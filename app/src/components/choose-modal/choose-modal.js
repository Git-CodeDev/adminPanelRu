import React from "react";

const ChooseModal = ({modal, target, data, redirect}) => {
    const list = data.map(item => {
        if (item.time) {  //если внутри объекта есть time (а есть он только внутри бэкапов), то:
            return (
                <li key={item.file}>  
                    <a 
                    className="uk-link-muted uk-modal-close" 
                    href="#"
                    // редирект на сохраненный бекап↓ что в папке admin/backups на сервере, а пользователю напишем что это копия от {даты создания} 
                    onClick={(e) => redirect(e, item.file)}>Резервная копия от {item.time}</a>
                </li>
            )
        } else {  //если time нет - то это страница
            return (
                <li key={item}>
                    <a 
                    className="uk-link-muted uk-modal-close" 
                    href="#"
                    onClick={(e) => redirect(e, item)}>{item}</a>
                </li>
            )
        }

    });

    let msg;
    if (data.length < 1) {
        msg = <div>Резервные копии не найдены!</div>
    }

    return(
        //модальное окно на предупреждении об изменении
        <div id={target} uk-modal={modal.toString()}>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Открыть</h2>
                {msg}
                <ul className="uk-list uk-list-divider">
                    {list}
                </ul>
                <p className="uk-text-right">
                    <button className="uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
                </p>
            </div>
    </div>
    )
};

export default ChooseModal