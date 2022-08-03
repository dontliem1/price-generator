'use strict';

import { DEFAULTS } from "./constants.js";

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
 * @typedef {'H1' | 'H2' | 'H3' | 'P' | 'FOOTER' | 'SPAN'} EditableTags
* @param {Object} params
* @param {EditableTags} params.tag
* @param {string} [params.text]
* @param {HTMLElement | null} [params.parent]
* @param {boolean} [params.fromStart]
* @param {boolean} [useDefaults] - Если `false` не создает дефолтный элемент при пустом text
* @returns {(HTMLElementTagNameMap[Lowercase<EditableTags>] & ElementContentEditable) | null} Created element
*/
export function createEditableElement({ tag, text, parent, fromStart }, useDefaults = true) {
    if (!['H1', 'H2', 'H3', 'P', 'FOOTER', 'SPAN'].includes(tag) || (!useDefaults && !text)) {
        return null;
    }

    const elem = document.createElement(tag);

    elem.setAttribute('contenteditable', 'true');
    elem.innerText = text ? text : DEFAULTS[tag];
    if (parent) {
        if (fromStart) {
            parent.prepend(elem);
        } else {
            parent.appendChild(elem);
        }
    }

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

    if (tag === 'P') {
        elem.inputMode = 'numeric';
    }

    return elem;
}

let dragged;
let draggedOver;
let draggedSame;
let draggedTarget;
/**
 * @param {{type: 'SERVICE'; H3?: string; SPAN?: string; P?: string}} serviceJson
 * @returns {HTMLDivElement}
 */
export function createService(serviceJson = DEFAULTS.SERVICE) {
    const div = document.createElement('div');

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
    div.draggable = true;
    div.addEventListener("dragstart", (event) => {
        const deleteBtn = document.getElementById('delete');
        const targetElement = /** @type {HTMLDivElement | null} */ (event.currentTarget);

        if (deleteBtn) { deleteBtn.hidden = true; }
        dragged = event.target;

        if (targetElement && event.dataTransfer) {
            targetElement.classList.add("dragging");
            event.dataTransfer.effectAllowed = "move";
        }
    });

    div.addEventListener("dragend", () => {
        dragged.classList.remove("dragging");
    });

    div.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    }, false);

    div.addEventListener("dragenter", function (e) {
        this.classList.add('dragover');
        draggedSame = this === draggedOver;
        draggedOver = this;
        draggedTarget = e.target;
    });

    div.addEventListener("dragleave", function (e) {
        if (!draggedSame || (draggedTarget === e.target)) {
            this.classList.remove('dragover');
        }
    });

    div.addEventListener("drop", (event) => {
        const targetElement = /** @type {HTMLElement | null} */ (event.target);
        const underDiv = targetElement && (targetElement.tagName === 'DIV' ? targetElement : targetElement.parentElement);

        event.preventDefault();
        if (underDiv) {
            underDiv.classList.remove("dragover");
            underDiv.insertAdjacentElement('beforebegin', dragged);
        }
    });

    return div;
}
/**
 * @param {{type: 'CATEGORY'; H2?: string}} categoryJson
 * @returns {HTMLElement | null}
 */
export function createCategory(categoryJson = DEFAULTS.CATEGORY) {
    const h2 = createEditableElement({
        tag: 'H2',
        ...(categoryJson.hasOwnProperty('H2') && { text: categoryJson.H2 }),
    }, false);

    if (h2) {
        h2.draggable = true;
        h2.addEventListener("dragstart", (event) => {
            const deleteBtn = document.getElementById('delete');
            const dragEvent = /** @type {DragEvent} */ (event);
            const targetElement = /** @type {HTMLHeadingElement | null} */ (event.currentTarget);

            if (deleteBtn) { deleteBtn.hidden = true; }
            dragged = event.target;

            if (targetElement && dragEvent.dataTransfer) {
                targetElement.classList.add("dragging");
                dragEvent.dataTransfer.effectAllowed = "move";
            }
        });

        h2.addEventListener("dragend", () => {
            dragged.classList.remove("dragging");
        });

        h2.addEventListener("dragover", (event) => {
            const dragEvent = /** @type {DragEvent} */ (event);

            dragEvent.preventDefault();
            if (dragEvent.dataTransfer) {
                dragEvent.dataTransfer.dropEffect = "move";
            }
        }, false);

        h2.addEventListener("dragenter", function () {
            this.classList.add('dragover');
        });

        h2.addEventListener("dragleave", function () {
            this.classList.remove('dragover');
        });

        h2.addEventListener("drop", (event) => {
            const targetElement = /** @type {HTMLElement | null} */ (event.target);

            event.preventDefault();
            if (targetElement) {
                targetElement.classList.remove("dragover");
                targetElement.insertAdjacentElement('beforebegin', dragged);
            }
        });

    }

    return h2;
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