import React, {Component} from 'react';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pass: ""
        }
    }

    onPasswordChange(e) {
        this.setState({
            pass: e.target.value
        })
    }

    render() {
        const {pass} = this.state;
        const {login, lengthErr, logErr} = this.props;

        let renderLogErr, renderLengthErr;  //создаем перемены которые будут рендерить ошибки

        logErr ? renderLogErr =  <span className="login-error">Введен неверный пароль</span> : null  //заполняем переменные взависимости от пришедших пропсов
        lengthErr ? renderLengthErr = <span className="login-error">Пароль должен быть длинее 5 символов</span> : null  //это больше как заглушка - пример того какое условие пароля вы можете проверить, однко это лишь то что будет показано пользователю, само условие в editor.js

        return(
            <div className="login-container"> 
                <div className="login">
                    <h2 className="uk-modal-title uk-text-center">Авторизация</h2>
                    <div className="uk=margin-top uk-text-lead">Пароль</div>
                    <input 
                    type="password" 
                    name="" 
                    id="" 
                    className="uk-input uk-margin-top" 
                    placeholder="Пароль"
                    value={pass}
                    onChange={(e) => this.onPasswordChange(e)}
                    onKeyUp={(key) => {if (key.keyCode === 13) {login(pass)}}}></input>
                    {renderLogErr}
                    {renderLengthErr}
                    <button  
                    className="uk-button uk-button-primary uk-margin-top" 
                    type="button"
                    onClick={() => login(pass)}>Вход</button>
                </div>
            </div>
        )
    }
}