import React, {Component} from 'react';

export default class EditorMeta extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meta: {
                title: '',
                keywords: '',
                description: ''
            }
        }
    }

    componentDidMount() {
        this.getMeta(this.props.virtualDom);
    }

    componentDidUpdate(prevProps) {
        if (this.props.virtualDom !== prevProps.virtualDom) {
            this.getMeta(this.props.virtualDom);  //обновляем мета теги на актуальные с нового виртуал дома (грубо говоря с нового iframe/новой страницы)
        }
    }

    getMeta(virtualDom) {  //для получания Meta даных, которые уже есть у нашей страницы
        this.title = virtualDom.head.querySelector("title")  || virtualDom.head.appendChild(virtualDom.createElement("title"));  //выбираем мета тэг title внутри нашего вируального DOM, а если его почему то нет(бывает и такое), то создадим новыйй пустой

        this.keywords = virtualDom.head.querySelector("meta[name='keywords']");  //выбираем мета тэг keywords
        if (!this.keywords) {  //если keywords не существуют, создадим их
            this.keywords = virtualDom.head.appendChild(virtualDom.createElement("meta"));
            this.keywords.setAttribute("name", "keywords");
            this.keywords.setAttribute("content", "");  //для баг фикса когда при отсутствии тэгов на новой странице отображение в форме некоректно - отображает старые данные
        }

        this.description = virtualDom.head.querySelector("meta[name='description']");  //выбираем мета тэг description
        if (!this.description) {  //если description не существуют, создадим его
            this.description = virtualDom.head.appendChild(virtualDom.createElement("meta")); 
            this.description.setAttribute("name", "description");
            this.description.setAttribute("content", "");
        }

        this.setState({
            meta: {
                title: this.title.innerHTML,
                keywords: this.keywords.getAttribute("content"),
                description: this.description.getAttribute("content")
            }
        })
    }

    applyMeta() {
        this.title.innerHTML = this.state.meta.title;
        this.keywords.setAttribute("content", this.state.meta.keywords);
        this.description.setAttribute("content", this.state.meta.description);
    }

    onValueChange(e) {

        if (e.target.getAttribute("data-title")) {
            e.persist();  //Останавливает React от сброса свойств объекта события. Нужна для react версии 16 или менее (просто обновить реакт до 17 версии оказалось невозможным из-за конфликта с UIKit)
            this.setState(({meta}) => {  //выкл. асинхронности
                const newMeta = {  //чтобы не было прямых мутаций надо создать новый объект - копию пред. объекта с измененным title
                    ...meta,  //все то что было в старом meta
                    title: e.target.value  //но с замененным title
                }

                return {// перезаписываем в state новый объект
                    meta: newMeta
                }
            })


        } else if (e.target.getAttribute("data-key")) {
            e.persist();
            this.setState(({meta}) => {
                const newMeta = {
                    ...meta,  
                    keywords: e.target.value  
                }

                return {
                    meta: newMeta
                }
            })

        } else {  //мета с тэгом desctiption
            e.persist();  
            this.setState(({meta}) => { 
                const newMeta = { 
                    ...meta, 
                    description: e.target.value
                }

                return {
                    meta: newMeta
                }
            })
        }
            
    }

    render() {

        const {modal, target} = this.props;
        const {title, keywords, description} = this.state.meta;

        return(
        <div id={target} uk-modal={modal.toString()}>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Редактирование Meta-тэгов</h2>

                <form>
                    <div className="uk-margin">
                        <input 
                        data-title
                        className="uk-input" 
                        type="text" 
                        placeholder="Title" 
                        value={title}
                        onChange={(e) => this.onValueChange(e)}/>
                   </div>

                    <div className="uk-margin">
                        <textarea 
                        data-key
                        className="uk-textarea" 
                        rows="5" placeholder="Keywords" 
                        value={keywords}
                        onChange={(e) => this.onValueChange(e)}></textarea>
                    </div>
                    <div className="uk-margin">
                        <textarea 
                        data-description
                        className="uk-textarea" 
                        rows="5" placeholder="Description" 
                        value={description}
                        onChange={(e) => this.onValueChange(e)}></textarea>
                    </div>
                </form>
                
                <p className="uk-text-right">
                    <button className="uk-button uk-button-default uk-modal-close uk-margin-small-right " type="button">Отменить</button>
                    <button
                        className="uk-button uk-button-primary uk-modal-close" 
                        type="button"
                        onClick={() => this.applyMeta()}>Применить</button>
                </p>
            </div>
    </div>
        )
    }
}