// мини самописаня библиотека для фикса бага в старых браузерах при использовании события onload для iframe
// только нативный js
// получаем все iframe и обращаемся к их прототипу
// далее пишем свой новый метод load для загрузки страничек в наш iframe
// он будет принимать 2 аргумента: 1- обязательный url, 2- необязательный callback, если он есть, он будет выполняться, если нет, то прост вернем промис
HTMLIFrameElement.prototype.load = function(url, callback) {
    const iframe = this;  //создаем контекст вызова для понятности

    try {
        iframe.src = url + "?rnd=" + Math.random().toString().substring(2)  //"?rnd=" для игнорирования кэширования    
    } catch (error) { 
        if (!callback) { 
            return new Promise((resolve, reject) => {  
                reject(error)
            });
        } else {
            callback(error);
        }
    }

    //имитируем событие onload (наша задача отследить когда iframe полностью загрузится)
    const maxTime = 60000; //максимальное время ответа
    const interval = 200; //интервал времени через который мы будем у браузера спрашивать готов ли наш iframe

    let timerCount = 0;  //подсчитываем кол-во раз сколько спросили у браузера про iframe

    //функционал проверки на то что наш iframe готов↓
    if (!callback) {  //если калбек не был передан, ошибки нет, вернем промис
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if (!iframe) {  //баг фикс связанный с асинхронностью
                    return clearInterval(timer)
                }
                timerCount++;
                if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
                    clearInterval(timer);  //если оба условия выполнились - все хорошо, iframe загрузился
                    resolve();  //отображаем успешное выполнение промиса
                } else if (timerCount * interval > maxTime) { 
                    reject(new Error("Iframe load fail!"));
                }
            }, interval);  //каждые 200 милисек проверка
        })
    } else {  //если передан callback
        const timer = setInterval(() => {
            if (!iframe) {
                return clearInterval(timer)
            }
            timerCount++;
            if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
                clearInterval(timer); 
                callback(); 
            } else if (timerCount * interval > maxTime) { 
                reject(new Error("Iframe load fail!")); 
            }
        }, interval);
    }
};