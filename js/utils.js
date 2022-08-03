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
    return li ? /** @type {HTMLElement | null} */ (li.firstElementChild) : null;
}

/**
 * @returns `<div>` of current page
 */
export function getActiveDiv(article = getActiveArticle()) {
    return article ? /** @type {HTMLDivElement | null} */ (article.firstElementChild) : null;
}

/**
 * @returns `<form>` of current page
 */
export function getActiveForm(article = getActiveArticle()) {
    return article ? /** @type {HTMLFormElement | null} */ (article.lastElementChild) : null;
}

/**
 * @param {HTMLElement | null} parent
 * @returns {HTMLElement | null} last focused element
 */
export function getActiveElement(parent = getActiveLi()) {
    return parent ? parent.querySelector('.active[contenteditable]') : null;
}

/**
 * @param {HTMLElement} el
 */
export function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + rect.height + window.scrollY,
        bottom: rect.top + rect.height
    };
}

/**
 * CONSTRUCTORS
 */

/**
* @param {Object} params
* @param {string} params.tag
* @param {string} [params.text]
* @param {HTMLElement | null} [params.parent]
* @param {boolean} [params.fromStart]
* @param {boolean} [useDefaults] - Если `false` не создает дефолтный элемент при пустом text
* @returns {HTMLElement | null} Created element
*/
export function createEditableElement({ tag, text, parent, fromStart }, useDefaults = true) {
    if (!['H1', 'H2', 'H3', 'P', 'FOOTER', 'SPAN'].includes(tag) || (!useDefaults && !text)) {
        return null;
    }

    const elem = document.createElement(tag);

    elem.setAttribute('contenteditable', 'true');
    elem.innerText = text ?? DEFAULTS[tag];
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

    return elem;
}

export function createService(serviceJson = DEFAULTS.SERVICE) {
    const div = document.createElement('div');

    for (const serviceProp in serviceJson) {
        createEditableElement({
            tag: serviceProp,
            text: serviceJson[serviceProp],
            parent: div
        }, false);
    }

    return div;
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