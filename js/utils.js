import { DEFAULTS } from "./constants.js";

/**
 * Создает редактируемый элемент и добавляет к родителю
 * @param {{tag: string; text?: string; parent?: HTMLElement; fromStart?: boolean}} params
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

export function handleFormFocusIn(e) {
    const element = /** @type {HTMLElement} */ (e.target);
    const editableElements = document.querySelectorAll('[contenteditable]');

    for (const editableElement of editableElements) {
        editableElement.classList.toggle('active', editableElement === element);
    }
}

export function handleFormInput(e) {
    const element = /** @type {HTMLElement} */ (e.target);
    if (!element.textContent) {
        element.innerHTML = ' ';
    }
    const page = e.currentTarget.parentElement;
    if (page && (page.scrollHeight - page.clientHeight > 16)) {
        alert(page.scrollHeight + ' ' + page.clientHeight);
    }
}

export function createPage(pageJson = DEFAULTS.PAGE, isActive = true) {
    const li = document.createElement('li');
    const article = document.createElement('article');
    const form = document.createElement('form');
    const div = document.createElement('div');

    li.classList.toggle('active', isActive);
    form.addEventListener('focusin', handleFormFocusIn);
    form.addEventListener('input', handleFormInput);
    article.append(div, form);

    for (const tag in pageJson) {
        if (tag === 'STYLE') {
            for (const styleProp in pageJson[tag]) {
                if (['-webkit-backdrop-filter', 'backdropFilter', 'textAlign', 'justifyContent'].includes(styleProp)) {
                    form.style[styleProp] = pageJson[tag][styleProp];

                    continue;
                }
                if (['backgroundColor', 'opacity'].includes(styleProp)) {
                    div.style[styleProp] = pageJson[tag][styleProp];

                    continue;
                }
                article.style[styleProp] = pageJson[tag][styleProp];
            }

            continue;
        }
        if (tag === 'SECTIONS') {
            for (const sectionJson of pageJson[tag]) {
                const section = createSection(sectionJson);

                form.appendChild(section);
            }

            continue;
        }
        createEditableElement({tag, text: pageJson[tag], parent: form});
    }
    li.appendChild(article);

    return li;
}

export function createService(serviceJson = DEFAULTS.LI) {
    const li = document.createElement('li');

    for (const liTag in serviceJson) {
        createEditableElement({tag: liTag, text: serviceJson[liTag], parent: li});
    }

    return li;
}

export function createSection(sectionJson = DEFAULTS.SECTION) {
    const section = document.createElement('section');

    for (const sectionTag in sectionJson) {
        if (sectionTag === 'UL') {
            const ul = document.createElement('ul');

            for (const liJson of sectionJson[sectionTag]) {
                const li = createService(liJson);

                ul.appendChild(li);
            }
            section.appendChild(ul);

            continue;
        }
        createEditableElement({tag: sectionTag, text: sectionJson[sectionTag], parent: section});
    }

    return section;
}

/**
 * Найти активную страницу
 * @returns {HTMLLIElement | null}
 */
export function getActivePage() {
    return document.querySelector('li.active');
}

/**
 * Найти article активной страницы
 * @returns {HTMLElement | null}
 */
export function getActiveArticle() {
    return document.querySelector('li.active > article');
}

/**
 * Найти форму активной страницы
 * @returns {HTMLFormElement | null}
 */
export function getActiveForm() {
    return document.querySelector('li.active form');
}

/**
 * Найти подложку активной страницы
 * @returns {HTMLDivElement | null}
 */
export function getActiveDiv() {
    return document.querySelector('li.active div');
}

/**
 * Найти активный элемент
 * @returns {HTMLElement | null}
 */
export function getActiveElement() {
    return document.querySelector('.active[contenteditable]');
}
