export default class DOMHelper {
    static parseStrToDOM(str) {  //str - строка, что вернулась к нам от сервера
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html")  //распарсим строку в DOM структуру
     }
 
    static wrapTextNodes(dom) {
        const body = dom.body   //поработаем с body той DOM структуры, что передали этому методу
        let textNodes = [];  //создаем список текстовых нод

        function recursy(element) {  //получение элементов глубоких уровней рекурсией
            element.childNodes.forEach(node => {
                
                if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
                    textNodes.push(node); 
                } else { 
                    recursy(node)
                }
            })
        };

        recursy(body);

        textNodes.forEach((node, i) => {
            const wrapper = dom.createElement('text-editor');  //создание кастомной обертки
            node.parentNode.replaceChild(wrapper, node); 
            wrapper.appendChild(node); 
            wrapper.setAttribute("nodeid", i);
        });

        return dom  //возращаем измененный dom где все текстовые ноды обернуты нашими элементами
    }

    static serializeDOMToString(dom) {  //преобразование DOM-структуры в текст для последующей отправки на сервер
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    static unwrapTextNodes(dom) {  //разворот обертки (удаление кастомных тэгов)
        dom.body.querySelectorAll("text-editor").forEach(element => { 
            element.parentNode.replaceChild(element.firstChild, element);
        })  
    }

    static wrapImages(dom) {
        dom.body.querySelectorAll("img").forEach((img, i) => {
            img.setAttribute("editableimgid", i)  //устанавливаем личный атрибут, что дает картинке уникальный id + порядок
        });

        return dom  //возращаем dom обратно, ток измененный
    }

    static unwrapImages(dom) {  //удаляет наш кастомный атрибут с картинок
        dom.body.querySelectorAll("[editableimgid]").forEach(img => {
            img.removeAttribute("editableimgid")
        });
    }
}