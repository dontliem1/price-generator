import { DEFAULTS } from "./constants.js";

/**
 * Создает редактируемый элемент и добавляет к родителю
 * @param {{tag: string; text?: string; parent?: HTMLElement; fromStart?: boolean}} Параметры тег, текст, родитель, в начало/конец
 * @returns {HTMLElement} Созданный элемент
 */
export function createEditableElement({tag, text = DEFAULTS[tag], parent, fromStart}) {
    const elem = document.createElement(tag);

    elem.setAttribute('contenteditable', 'true');
    elem.innerText = text;
    if (parent) {
        fromStart ? parent.prepend(elem) : parent.appendChild(elem);
    }

    return elem;
}

export function createSection(sectionJson = DEFAULTS.SECTION) {
    const section = document.createElement('section');

    for (const sectionTag in sectionJson) {
        if (sectionTag === 'UL') {
            const ul = document.createElement('ul');

            for (const liJson of sectionJson[sectionTag]) {
                const li = document.createElement('li');

                for (const liTag in liJson) {
                    createEditableElement({tag: liTag, text: liJson[liTag], parent: li});
                }
                ul.appendChild(li);
            }
            section.appendChild(ul);

            continue;
        }
        createEditableElement({tag: sectionTag, text: sectionJson[sectionTag], parent: section});
    }

    return section;
}