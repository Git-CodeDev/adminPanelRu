import "../../helpers/iframeLoader.js";
import axios from 'axios'
import React, {Component} from 'react';
import DOMHelper from "../../helpers/dom-helper";
import EditorText from "../editor-text";
import UIkit from "uikit";
import Spinner from "../spinner"
import Spiner from "../spinner";
import ConfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";
import EditorImages from '../editor-images';
import Login from "../login";

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            backupsList: [],
            newPageName: "",
            loading: true,
            auth: false,
            loginError: false,
            loginLenghtError: false
        }
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
        this.init = this.init.bind(this);
        this.restoreBackup = this.restoreBackup.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        this.checkAuth();
    }

    componentDidUpdate(prevProps, prevState) { 
        if (this.state.auth !== prevState.auth) {  //если мы смогли залогиница то стейт изменица и код пойдет дальше, если нет то скип
            this.init(null, this.currentPage); 
        }
    }

    checkAuth() {  //проверка авторизованности пользователя на бэкэнде
        axios
            .get("./api/checkAuth.php")
            .then(res => {
                this.setState({
                    auth: res.data.auth
                })
            })
    }

    login(pass) {
        if (pass.length > 5) {  //здесь вы можете написать свою проверку, если она не пройдет пользователю покажет сообщение, которое вы можете настроить в login.js
            axios
                .post('./api/login.php', {"password": pass})  //отправка пароля на серв, там он сравнивается
                .then(res => {
                    this.setState({
                        auth: res.data.auth,  //если пароли совпали предет true, иначе false
                        loginError: !res.data.auth,  //противоположное значение аторизации (если прошла true, ошибка false - не прошла false ошибка true)
                        loginLenghtError: false  //заглушка, здесь могут быть ваши значения если вы напишете свое условие, сейчас тут всегда false тк у нас по условию if (pass.length > 5) и иначе код бы и не дашел сюда
                    })
                })
        } else {
            this.setState({
                loginError: false,  //мы здесь не отправляем запрос на логин, значит ошибка явно не в этом
                loginLenghtError: true  //значит очивидно ошибка в том условии что вы написали (по умолчанию это длинна пароля 5)
            })
        }
    }

    logout() {
        axios
            .get("./api/logout.php")
            .then(() => {
                window.location.replace("/")  //перемещение с админки на главную страницу
            })
    }

    init(e, page) {  //page - принимает назв. стр., что надо открыть
        if (e) {
            e.preventDefault();
        }
        if (this.state.auth) { 
            this.isLoading();
            this.iframe = document.querySelector('iframe'); 
            this.open(page, this.isLoaded);
            this.loadPageList();
            this.loadBackupsList();
        }
    }

    open(page, cb) {
        this.currentPage = page;  //перезаписываем текущую стр. на ту что надо открыть.

        axios
            .get(`../${page}?rnd=${Math.random()}`) //получаем чистый исходный код страницы
            .then(res => (DOMHelper.parseStrToDOM(res.data)))
            .then(DOMHelper.wrapTextNodes)
            .then(DOMHelper.wrapImages)  //присваивает кастомный тэг каждой картинке
            //след .then врывается в цепочку чтобы сохранить чистую копию страницы и продолжает ее будто его нет
            .then(dom => {
                this.virtualDom = dom;  //копируем это все добро в virtualDom и считаем что теперь здесь находится наша чистая копия
                return dom
            })
            .then(DOMHelper.serializeDOMToString)  //преобразовываем в текст нашу DOM структуру с обернутыми текстовыми нодами
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => this.iframe.load("../temp.html"))  //внутри load по сути просто задается src для iframe - то есть какое окно показать для редактирования (temp.html показать)
            .then(() => axios.post("./api/deleteTempPage.php"))
            .then(() => this.enableEditing())  
            .then(() => this.injectStyles())
            .then(cb);

            this.loadBackupsList();
    }

    async save(onSuccess, onError) {//копируем данные из виртуального Dom -а
        this.isLoading(); 
        const newDom = this.virtualDom.cloneNode(this.virtualDom);
        DOMHelper.unwrapTextNodes(newDom);
        DOMHelper.unwrapImages(newDom);
        const html = DOMHelper.serializeDOMToString(newDom); //приводим dom структуру в строку для последуюзей отправки на сервер
        await axios
            .post("./api/savePage.php", {pageName: this.currentPage, html})
            .then(() => this.showNotifications("Успешно сохранено", "success"))
            .catch(() => this.showNotifications("Ошибка сохранения", "danger"))
            .finally(this.isLoaded);

            this.loadBackupsList();
        }
 
    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            const virtualElement = this.virtualDom.body.querySelector(`[nodeid="${id}"]`)  //помещаем в переменную элемент из чистой копии, который потом будет принимать изменения грязной

            new EditorText(element, virtualElement)  //тут у нас создается полноценный редактор текста который работает через установление лисенеров на любую строку текста (ни его ни его методы вызывать не над тк это все включается в конструкторе)
        });

        this.iframe.contentDocument.body.querySelectorAll("[editableimgid]").forEach(element => {//берем картинку (с этим же id) из CONTENTDOCUMENT -а
            const id = element.getAttribute("editableimgid");  //берем id элемента (картинки)
            const virtualElement = this.virtualDom.body.querySelector(`[editableimgid="${id}"]`)  //берем картинку с этим же id но уже из VIRTUAL DOM -а

            new EditorImages(element, virtualElement, this.isLoading, this.isLoaded, this.showNotifications)  //здесь запускается редактор картинок (+спинер)
        });
    }

    injectStyles() {
        const style = this.iframe.contentDocument.createElement("style");
        style.innerHTML = `  
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
            [editableimgid]:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
    }

    showNotifications(message, status) {  //отвечает за показ уведомлений например об ошибке, принимает 2 арг: 
        UIkit.notification({message, status});  //{message} = message: message = например message: 'успешно сохраненно'
    }

    loadPageList() { 
        axios
            .get("./api/pageList.php")
            .then(res => this.setState({pageList: res.data}))
    }

    loadBackupsList() {  //загрузка списка бэкапов текущей страницы (переменная currentPage)
        axios
            .get("./backups/backups.json")  //получаем данные о наших бэкапах из этого файла
            .then(res => this.setState({backupsList: res.data.filter(backup => {  //фильтр для получения данных конкретной страницы открытой в данный момент
                return backup.page === this.currentPage;
            })}))  
    }

    restoreBackup(e, backup) {
        if (e) {
            e.preventDefault();
        }
        UIkit.modal.confirm("Вы действительно хотите восстановить страницу из это резервной копии? Все несохраненные данные будут потеряны!",
        {labels: {ok: 'Восстановить', cancel: 'Отмена'}})
        .then(() => { 
            this.isLoading();
            return axios
                .post("./api/restoreBackup.php", {"page": this.currentPage, "file": backup})  //замена страницы на бэкап копию на серве, page - имя страницы как index.html, file - имя бэкапа как 60829eb895f79.html
        })
        .then(() => {
            this.open(this.currentPage, this.isLoaded);  //перезагрузка страницы для показа новых бекапных данных и выкл спинера
        })  
    
    }

    isLoading() {
        this.setState({
            loading: true
        })
    }

    isLoaded() {
        this.setState({
            loading: false
        })
    }

    render() {
        const {loading, pageList, backupsList, auth, loginLenghtError, loginError} = this.state;
        const modal = true;
        let spinner;

        loading ? spinner = <Spinner active/> : spinner = <Spiner/>

        if (!auth) {  //если пользователь не авторизован
            return <Login login={this.login} lengthErr={loginLenghtError} logErr={loginError}/>  //пусть авторизуеца, передали метод
        }  //это защита лишь с фронта, также есть и на бэке

        return(
            <>
                <iframe src="" frameBorder="0"></iframe>

                {/*  ↓при клике на какую либо картинку вручную вызывается клик и по этому элементу:*/}
                <input id="img-upload" type="file" accept="image/*" style={{display: 'none'}}></input>

                {spinner}

                <Panel/>
                
                {/* нижездесь: modal - прост для передачи true в uk-modal чтоб бага не было, target - id какая модалка вызовеца, method - калл бек что вызовеца при клике на кнопку, 
                data - массив со страницами, redirect - при клике на элемент списка */}
                <ConfirmModal 
                modal={modal} 
                target={"modal-save"} 
                method={this.save}
                text={{
                    title: "Сохранение",
                    descr: "Вы действительно хотите сохранить изменения?",
                    btn: "Опубликовать"
                }}/>
                <ConfirmModal 
                modal={modal} 
                target={"modal-logout"} 
                method={this.logout}
                text={{
                    title: "Выход",
                    descr: "Вы действительно хотите выйти?",
                    btn: "Выйти"
                }}/>
                <ChooseModal modal={modal} target={"modal-open"} data={pageList} redirect={this.init}/>
                <ChooseModal modal={modal} target={"modal-backup"} data={backupsList} redirect={this.restoreBackup}/>
                {/* ↓если до virtualDom дело еще не дошло, то чтобы не было ошибки когда обращаются к несуществующим данным ничего рендерить не будем, а если есть то этот элемент отвечает за модаку для редактинга мета тегов */}
                {this.virtualDom ?<EditorMeta modal={modal} target={"modal-meta"} virtualDom={this.virtualDom}/> : false}
            </>
        )
    }
}