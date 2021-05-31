import axios from 'axios';

export default class EdotorImages {
    constructor(element, virtualElement, ...[isLoading, isLoaded, showNotifications]) {  //передаем element из грязной копии и virtualElement из чистой а также callbacks среди которых например вкл и выкл спинера
        this.element = element;
        this.virtualElement = virtualElement;
        
        this.element.addEventListener('click', () => this.onClick());
        this.imgUpLoader = document.querySelector('#img-upload');  //специальный инпут по загрузке картинок
        this.isLoading = isLoading;
        this.isLoaded = isLoaded;
        this.showNotifications = showNotifications;
    }

    onClick() {
        this.imgUpLoader.click();
        this.imgUpLoader.addEventListener('change', () => {
            if (this.imgUpLoader.files && this.imgUpLoader.files[0]) {
                let formData = new FormData();
                formData.append("image", this.imgUpLoader.files[0]);
                this.isLoading();  //вкл спинер перед отправкой запроса на серв
                axios  //отправка картинки на сервер
                    .post('./api/uploadImage.php', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    })
                    .then((res) => {  //res - ответ от сервера - путь к картинке в папке img что пользователь загрузил на сервер
                        //двойное присваивание для обновления картинки как на странице что внутри редактора так и на виртуальной
                        this.virtualElement.src = this.element.src = `./img/${res.data.src}`  //берем элмент с которым работаем (картинку) и меняем ей путь на ту которую пользоватиль загрузил в .post на сервер.
                    })
                    .catch(() => {
                        this.showNotifications("Ошибка сохранения", "danger")
                    })
                    .finally(() => {
                        this.imgUpLoader.value = ''  //скидываем данные из input чтобы можно было перевыбрать еще раз
                        this.isLoaded();  //выкл. спинера
                    })
            }
        });
    }

}