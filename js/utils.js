'use strict';

import { DEFAULTS, EDITABLE_TAGS } from "./constants.js";

/**
 * GETTERS
 */

export function getMount() {
    return document.getElementById('pages');
}

/**
 * @returns {HTMLLIElement | null} `<li>` of current page
 */
export function getActiveLi() {
    return document.querySelector('li.active');
}

/**
 * @returns `<article>` of current page
 */
export function getActiveArticle(li = getActiveLi()) {
    return /** @type {HTMLElement | null} */ (li && li.firstElementChild);
}

/**
 * @returns `<div>` of current page
 */
export function getActiveDiv(article = getActiveArticle()) {
    return /** @type {HTMLDivElement | null} */ (article && article.firstElementChild);
}

/**
 * @returns `<form>` of current page
 */
export function getActiveForm(article = getActiveArticle()) {
    return /** @type {HTMLFormElement | null} */ (article && article.lastElementChild);
}

/**
 * @param {HTMLElement | null} parent
 * @returns {HTMLElement | null} last focused element
 */
export function getActiveElement(parent = getActiveLi()) {
    return parent && parent.querySelector('.active[contenteditable]');
}

/**
 * @param {HTMLElement} el
 */
export function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        height: rect.height,
    };
}

/**
 * CONSTRUCTORS
 */

/**
* @param {Object} params
* @param {EditableTags} params.tag
* @param {string} [params.text]
* @param {HTMLElement | null} [params.parent]
* @param {boolean} [params.fromStart]
* @param {boolean} [useDefaults] - Если `false` не создает дефолтный элемент при пустом text
* @returns {(HTMLElementTagNameMap[Lowercase<EditableTags>] & ElementContentEditable) | null} Created element
*/
export function createEditableElement({ tag, text, parent, fromStart }, useDefaults = true) {
    if (!EDITABLE_TAGS.includes(tag) || (!useDefaults && !text)) {
        return null;
    }

    const elem = document.createElement(tag);

    elem.contentEditable = 'false';
    elem.innerText = text ? text : DEFAULTS[tag];
    if (parent) {
        if (fromStart) {
            parent.prepend(elem);
        } else {
            parent.appendChild(elem);
        }
    }
    elem.tabIndex = 0;
    elem.addEventListener('drop', function handleDrop(e) {
        e.preventDefault();

        const text = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
        let range = document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);

        // @ts-ignore
        if (!range && e.rangeParent) {
            // firefox
            range = document.createRange();
            // @ts-ignore
            range.setStart(e.rangeParent, e.rangeOffset);
            // @ts-ignore
            range.setEnd(e.rangeParent, e.rangeOffset);
        }

        if (range) { range.insertNode(document.createTextNode(text)); }
    });

    elem.addEventListener('paste', function stripTags(e) {
        e.preventDefault();

        const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
        const oldSelection = document.getSelection();

        if (oldSelection) {
            const range = oldSelection.getRangeAt(0);

            range.deleteContents();

            const textNode = document.createTextNode(text);

            range.insertNode(textNode);
            range.selectNodeContents(textNode);
            range.collapse(false);

            const selection = window.getSelection();

            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    });

    return elem;
}

/**
 * @type {HTMLHeadingElement | HTMLDivElement | null}
 */
let dragged = null;
let draggedOver;
let draggedSame;
let draggedTarget;

/**
 * @param {boolean} draggable
 * @param {Service} serviceJson
 * @returns {HTMLDivElement}
 */
export function createService(draggable, serviceJson = DEFAULTS.SERVICE) {
    const div = document.createElement('div');

    div.draggable = draggable;
    for (const serviceProp in serviceJson) {
        if (['H3', 'SPAN', 'P'].includes(serviceProp)) {
            const tag = /** @type {'H3' | 'SPAN' | 'P'} */ (serviceProp);

            createEditableElement({
                tag,
                text: serviceJson[serviceProp],
                parent: div
            }, false);
        }
    }
    div.addEventListener("dragstart", (event) => {
        const dragEvent = /** @type {DragEvent} */ (event);

        dragged = /** @type {HTMLDivElement} */ (event.target);
        if (dragEvent.dataTransfer) {
            dragEvent.dataTransfer.effectAllowed = "move";
            dragEvent.dataTransfer.dropEffect = "move";
        }
    });
    div.addEventListener("dragend", () => {
        dragged = null;
    });
    div.addEventListener("dragover", (event) => {
        event.preventDefault();
    }, false);
    div.addEventListener("dragenter", function (e) {
        if (dragged && dragged.nextElementSibling !== this) {
            this.classList.add('drag-over');
        }
        draggedSame = this === draggedOver;
        draggedOver = this;
        draggedTarget = e.target;
    });
    div.addEventListener("dragleave", function (e) {
        if (!draggedSame || (draggedTarget === e.target)) { this.classList.remove('drag-over'); }
    });
    div.addEventListener("drop", (event) => {
        const targetElement = /** @type {HTMLHeadingElement | null} */ (event.target);
        const underDiv = targetElement && (targetElement.tagName === 'DIV' ? targetElement : targetElement.parentElement);

        if (underDiv) {
            underDiv.classList.remove("drag-over");
            if (dragged && underDiv !== dragged && underDiv !== dragged.nextElementSibling) {
                underDiv.insertAdjacentElement('beforebegin', dragged);
            }
        }
    });

    return div;
}
/**
 * @param {boolean} draggable
 * @param {Category} [categoryJson]
 * @returns {HTMLElement | null}
 */
export function createCategory(draggable, categoryJson = DEFAULTS.CATEGORY) {
    const h2 = createEditableElement({
        tag: 'H2',
        ...(categoryJson.hasOwnProperty('H2') && { text: categoryJson.H2 }),
    }, false);

    if (h2) {
        h2.draggable = draggable;
        h2.addEventListener("dragstart", (event) => {
            const dragEvent = /** @type {DragEvent} */ (event);

            dragged = /** @type {HTMLHeadingElement} */ (event.target);
            if (dragEvent.dataTransfer) {
                dragEvent.dataTransfer.effectAllowed = "move";
                dragEvent.dataTransfer.dropEffect = "move";
            }
        });
        h2.addEventListener("dragend", () => {
            dragged = null;
        });
        h2.addEventListener("dragover", (event) => {
            event.preventDefault();
        }, false);
        h2.addEventListener("dragenter", function () {
            if (dragged && dragged.nextElementSibling !== this) { this.classList.add('drag-over'); }
        });
        h2.addEventListener("dragleave", function () {
            this.classList.remove('drag-over');
        });
        h2.addEventListener("drop", (event) => {
            const targetElement = /** @type {HTMLHeadingElement | null} */ (event.target);

            if (targetElement) {
                targetElement.classList.remove("drag-over");
                if (dragged && targetElement !== dragged && targetElement !== dragged.nextElementSibling) {
                    targetElement.insertAdjacentElement('beforebegin', dragged);
                }
            }
        });
    }

    return h2;
}

/**
* @param {Object} params
* @param {HTMLElement | null} params.page
* @param {HTMLElement | null} params.form
* @param {HTMLElement | null} params.div
* @returns {PageStyle}
*/
function parseStyles({ page, form, div }) {
    const { aspectRatio = '', backgroundImage = '', color = '', fontFamily = '' } = page ? page.style : {};
    const { backdropFilter = '', justifyContent = '', textAlign = '' } = form ? form.style : { backdropFilter: '' };
    const { backgroundColor = '', opacity = '' } = div ? div.style : {};

    return Object.fromEntries(Object.entries({ aspectRatio, backgroundImage, color, fontFamily, backdropFilter, justifyContent, textAlign, backgroundColor, opacity }).filter(function filterEmpty([, value]) {
        return value;
    }));
}

/**
 * @param {HTMLElement} page
 */
export function parsePage(page) {
    /** @type {Page} */
    const pageJson = {};
    const div = /** @type {HTMLDivElement | null} */ (page.firstElementChild);
    const form = /** @type {HTMLFormElement | null} */ (page.lastElementChild);
    const priceElems = form ? /** @type {HTMLCollectionOf<HTMLElement>} */ (form.children) : [];

    for (const priceElem of priceElems) {
        switch (priceElem.tagName) {
            case 'H1':
            case 'FOOTER':
                pageJson[priceElem.tagName] = priceElem.innerText;

                break;
            case 'H2':
                /** @type {Category} */
                const category = { type: 'CATEGORY', H2: priceElem.innerText };

                pageJson.ITEMS = pageJson.ITEMS ? [...pageJson.ITEMS, category] : [category];

                break;
            case 'DIV':
                const serviceItems = /** @type {HTMLCollectionOf<HTMLElement>} */ (priceElem.children);

                if (serviceItems.length) {
                    /** @type {Service} */
                    const service = { type: "SERVICE" };

                    for (const item of serviceItems) {
                        service[item.tagName] = item.innerText;
                    }

                    pageJson.ITEMS = pageJson.ITEMS ? [...pageJson.ITEMS, service] : [service];
                }

                break;
        }
    }
    pageJson.STYLE = parseStyles({
        page,
        form,
        div,
    });

    return pageJson;
}

export function parsePages() {
    const json = {
        /** @type {Page[]} */
        PAGES: [],
        /** @type {PagesStyle} */
        STYLE: {}
    };
    const pages = document.getElementsByTagName('article');
    const mount = document.getElementById('pages');

    if (mount && mount.dataset.aspectRatio) {
        json.STYLE.aspectRatio = mount.dataset.aspectRatio;
    }
    for (const page of pages) {
        json.PAGES.push(parsePage(page));
    }
    return JSON.stringify(json);
}

/**
 * LISTENERS
 */

/**
 * @typedef {HTMLInputElement | HTMLButtonElement | HTMLSelectElement | null} InteractiveElement
 * @param {InteractiveElement | string} element
 * @param {(this: HTMLInputElement, ev: Event) => any} callback
 * @param {'change' | 'click' | 'input'} eventType
 * @return {InteractiveElement}
 */
export function bindListener(element, callback, eventType = 'change') {
    const targetElement = typeof element === 'string' ? /** @type {InteractiveElement} */ (document.getElementById(element)) : element;

    if (targetElement) {
        targetElement.addEventListener(eventType, callback);
    }

    return targetElement;
}

export function handleArticleStylePropChange(e) {
    const activeArticle = getActiveArticle();

    if (activeArticle) {
        activeArticle.style[e.target.name] = e.target.value;
    }
}

export function handleFormStylePropChange(e) {
    const activeForm = getActiveForm();

    if (activeForm) {
        activeForm.style[e.target.name] = e.target.value;
    }
}