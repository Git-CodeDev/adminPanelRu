export default class EditorText {
    constructor(element, virtualElement) {  //передаем element из грязной копии и virtualElement из чистой
        this.element = element;
        this.virtualElement = virtualElement;
        this.element.addEventListener("click", () => this.onClick())
        this.element.addEventListener("blur", () => this.onBlur())  //выключаем фокус с элемента для прекращения редактирования строки для баг фикса с кликом в пустоту но выбором строки
        this.element.addEventListener("keypress", (e) => this.onKeypress(e))
        this.element.addEventListener("input", (e) => this.onTextEdit(e))  //передача изменений в чистую копию

        if (this.element.parentNode.nodeName === "A" || this.element.parentNode.nodeName === "BUTTON") {
            this.element.addEventListener("contextmenu", (e) => this.onCtxMenu(e))  //для редактирования ссылок, кнопок на ПКМ 
        }
    }

    onCtxMenu(e) {
        e.preventDefault()
        this.onClick()
    }

    onKeypress(e) {
        if (e.keyCode === 13) {  //код 13 у клавищи Enter
            this.element.blur()
        }
    }

    onClick() {
        this.element.contentEditable = "true";  //включение атрибута для редактирования
        this.element.focus();
    }

    onBlur() {
        this.element.removeAttribute("contenteditable")  //отключения редактирования элемента (баг фикс)
    } 

    onTextEdit() {
        //Пользователь делает изменения в element.innerHTML. 
        //Далее мы их отслеживаем, при изм. вызываем этот метод и он все изменения из element.innerHTML передает в this.virtualElement.innerHTML - нужный элемент чистой копии
        this.virtualElement.innerHTML = this.element.innerHTML;
    }
}