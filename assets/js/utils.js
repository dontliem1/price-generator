'use strict';

import { DEFAULTS, HEADER_TAGS, ITEMS_TAGS } from "./constants.js";

/**
 * GETTERS
 */

/**
 * @returns {HTMLOListElement | null} `<ol>` of current page
 */
export function getMount() {
    return /** @type {HTMLOListElement | null} */ (document.getElementById('pages'));
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
    if (![...HEADER_TAGS, ...ITEMS_TAGS].includes(tag) || (!useDefaults && !text)) {
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
 * Set effectAllowed and dropEffect to "move"
 * @param {Event} event - The event object.
 */
function handleDragStart(event) {
    dragged = /** @type {HTMLDivElement | HTMLHeadingElement} */ (event.target);
}
/**
 * Set the dragged variable to null.
 */
function handleDragEnd() {
    dragged = null;
}
/**
 * Allow drop.
 */
function handleDragOver(event) {
    event.preventDefault();
}

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
    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);
    div.addEventListener("dragover", handleDragOver, false);
    div.addEventListener("dragenter", function handleDivDragEnter(e) {
        if (dragged && dragged.nextElementSibling !== this) {
            this.classList.add('drag-over');
        }
        draggedSame = this === draggedOver;
        draggedOver = this;
        draggedTarget = e.target;
    });
    div.addEventListener("dragleave", function handleDivDragLeave(e) {
        if (!draggedSame || (draggedTarget === e.target)) { this.classList.remove('drag-over'); }
    });
    div.addEventListener("drop", function handleDivDrop(event) {
        const targetElement = /** @type {HTMLHeadingElement | null} */ (event.target);
        const underDiv = targetElement &&
            (targetElement.tagName === 'DIV' ? targetElement : targetElement.parentElement);

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
    const category = createEditableElement({
        tag: 'H2',
        ...(categoryJson.hasOwnProperty('H2') && { text: categoryJson.H2 }),
    }, false);

    if (category) {
        category.draggable = draggable;
        category.addEventListener("dragstart", handleDragStart);
        category.addEventListener("dragend", handleDragEnd);
        category.addEventListener("dragover", handleDragOver, false);
        category.addEventListener("dragenter", function handleCategoryDragEnter() {
            if (dragged && dragged.nextElementSibling !== this) { this.classList.add('drag-over'); }
        });
        category.addEventListener("dragleave", function handleCategoryDragLeave() {
            this.classList.remove('drag-over');
        });
        category.addEventListener("drop", function handleCategoryDrop(event) {
            const targetElement = /** @type {HTMLHeadingElement | null} */ (event.target);

            if (targetElement) {
                targetElement.classList.remove("drag-over");
                if (dragged && targetElement !== dragged && targetElement !== dragged.nextElementSibling) {
                    targetElement.insertAdjacentElement('beforebegin', dragged);
                }
            }
        });
    }

    return category;
}

/**
* @param {Object} params
* @param {HTMLElement | null} params.page
* @param {HTMLElement | null} params.form
* @param {HTMLElement | null} params.div
* @param {boolean} [parseImages]
* @returns {Partial<CSSStyleDeclaration>}
*/
function parseStyles({ page, form, div }, parseImages) {
    const { backgroundImage = '', color = '', fontFamily = '' } = page ? page.style : {};
    const { justifyContent = '', textAlign = '' } = form ? form.style : {};
    const { backgroundColor = '', opacity = '' } = div ? div.style : {};

    return Object.fromEntries(Object.entries({
        backgroundColor,
        backgroundImage,
        color,
        fontFamily,
        justifyContent,
        opacity,
        textAlign,
    }).filter(function filterEmpty([prop, value]) {
        if (!parseImages && prop === 'backgroundImage') {
            return false;
        }
        return value;
    }));
}

/**
 * @param {HTMLElement} page
 * @param {boolean} [parseImages]
 */
export function parsePage(page, parseImages) {
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
    }, parseImages);

    return pageJson;
}

/**
 * @param {boolean} [parseImages]
 * @returns {string} The current price stringified
 */
export function parsePages(parseImages) {
    const json = {
        /** @type {Page[]} */
        PAGES: [],
        /** @type {PagesStyle} */
        STYLE: {}
    };
    const pages = document.getElementsByTagName('article');
    const mount = getMount();

    if (mount && mount.dataset.aspectRatio) {
        json.STYLE.aspectRatio = mount.dataset.aspectRatio;
    }
    for (const page of pages) {
        json.PAGES.push(parsePage(page, parseImages));
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
export function BindListener(element, callback, eventType = 'change') {
    const targetElement = typeof element === 'string' ?
        /** @type {InteractiveElement} */ (document.getElementById(element)) :
        element;

    if (targetElement) {
        targetElement.addEventListener(eventType, callback);
    }

    return targetElement;
}

/**
 * It takes the value of the control and sets the value of the article's style property to that value.
 * @param {Event} e - The event object
 */
export function handleArticleStylePropChange(e) {
    const activeArticle = getActiveArticle();
    const control = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);

    if (activeArticle && control) {
        activeArticle.style[control.name] = control.value;
    }
}

/**
 * It takes the value of the selected control and sets the value of the form's style property to that value.
 * @param {Event} e - The event object
 */
export function handleFormStylePropChange(e) {
    const activeForm = getActiveForm();
    const control = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);

    if (activeForm) {
        activeForm.style[control.name] = control.value;
    }
}