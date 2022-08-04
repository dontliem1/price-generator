'use strict';

import { DEFAULTS } from './constants.js';
import { bindListener, createCategory, createEditableElement, createService, getActiveArticle, getActiveDiv, getActiveElement, getActiveForm, getActiveLi, getMount, getOffset, handleArticleStylePropChange, handleFormStylePropChange } from './utils.js';

/**
 * FLOAT
 * */

// Alignment
const titleAlignment = /** @type {HTMLFieldSetElement | null} */ (document.getElementById('titleAlignment'));

function repositionTitleAlignment(element = getActiveElement()) {
    if (titleAlignment) {
        if (element && element === document.activeElement && element.tagName === 'H1' && (!element.nextElementSibling || element.nextElementSibling.tagName === 'FOOTER')) {
            const { left, height, top } = getOffset(element);

            titleAlignment.style.transform = `translate(${left}px, ${top + height}px)`;
            titleAlignment.hidden = false;
        } else {
            titleAlignment.hidden = true;
        }
    }
}

// Remove element
const deleteBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('delete'));

function repositionDeleteBtn(element = getActiveElement()) {
    if (deleteBtn) {
        if (element && element === document.activeElement && ['H1', 'H2', 'H3', 'SPAN', 'P', 'FOOTER'].includes(element.tagName)) {
            const { left, height, top } = getOffset(element);

            deleteBtn.hidden = false;
            deleteBtn.style.transform = `translate(${left + Math.min(0, window.innerWidth - left - deleteBtn.clientWidth - 6)}px, ${top + height}px)`;
        } else {
            deleteBtn.hidden = true;
        }
    }
}

// Background
const background = /** @type {HTMLFieldSetElement | null} */ (document.getElementById('background'));

function repositionBackground(form = getActiveForm()) {
    if (background && form) {
        if (form === document.activeElement) {
            const settings = document.getElementById('settings');
            const { left, top } = getOffset(form);
            const [leftBorder, topBorder] = settings ? [settings.clientWidth, settings.clientHeight] : [0, 0];

            if (left < window.innerWidth) {
                background.hidden = false;
            }

            background.style.transform = `translate(${left}px, ${Math.max(left > leftBorder ? 0 : topBorder, top)}px)`;
        } else {
            background.hidden = true;
        }
    }
}

bindListener('float', function handleFloatClick(e) {
    const floatElements = /** @type {HTMLCollectionOf<HTMLButtonElement | HTMLFieldSetElement>} */ (this.children);
    const clicked = /** @type {HTMLElement | null} */ (e.target);

    if (clicked && clicked === this) {
        for (const element of floatElements) {
            element.hidden = true;
        }
    }
}, 'click');

/**
 * SETTINGS
 * */
let sortingPollyfilled;
const sorting = /** @type {HTMLInputElement | null} */ (bindListener('sorting', async function handleSortinChange() {
    const draggable = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[draggable]'));
    const contentEditable = this.checked ? 'false' : 'true';

    if (!sortingPollyfilled) {
        const script = document.createElement('script');

        script.src = 'js/DragDropTouch.js';
        document.body.appendChild(script);
        sortingPollyfilled = true;
    }
    for (const element of draggable) {
        element.draggable = this.checked;
        if (element.tagName === 'H2') {
            element.contentEditable = contentEditable;
        }
        if (element.tagName === 'DIV') {
            for (const child of element.children) {
                const childElement = /** @type {HTMLHeadingElement | HTMLSpanElement | HTMLParagraphElement} */ (child);

                childElement.contentEditable = contentEditable;
            }
        }
    }

    if (deleteBtn) { deleteBtn.hidden = true; }
}));

bindListener(deleteBtn, function handleDeleteClick() {
    const activeElement = getActiveElement();

    if (activeElement && window.confirm(`Remove element${activeElement.innerText.trim() ? (' "' + activeElement.innerText + '"') : ''}?`)) {
        const parent = activeElement.parentElement;

        activeElement.remove();
        if (parent && parent.tagName === 'DIV' && !parent.innerText.trim()) {
            parent.remove();
        }
        this.hidden = true;
        if (titleAlignment) {
            titleAlignment.hidden = true;
        }
    }
}, 'click');

// Background blur
const backdropFilterInput = bindListener('backdropFilter', function handleBackdropFilterInput() {
    const activeForm = getActiveForm();

    if (activeForm) {
        const value = `blur(${this.value}px)`;

        activeForm.style[this.name] = value;
        activeForm.style['-webkit-backdrop-filter'] = value;
    }
}, 'input');

// Background opacity
const opacityRange = bindListener('opacity', function handleOpacityRangeChange() {
    const activeDiv = getActiveDiv();

    if (activeDiv) {
        activeDiv.style[this.name] = (1 - parseFloat(this.value)).toString();
    }
}, 'input');

// Background image
const backgroundImageInput = bindListener('backgroundImage', function handleBackgroundImageChange() {
    const activeArticle = getActiveArticle();

    if (this.files && activeArticle) {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onloadend = function handleImageLoadEnd() {
            activeArticle.style.backgroundImage = 'url("' + reader.result + '")';
        };
        reader.readAsDataURL(file);
    }
});

bindListener('deleteBackgroundImage', function handleDeleteBackgroundImageClick() {
    const activeArticle = getActiveArticle();

    if (activeArticle) {
        activeArticle.style.backgroundImage = '';
    }
    if (backgroundImageInput) {
        backgroundImageInput.value = '';
    }
}, 'click');

// Title justify
const textAlignSelect = /** @type {HTMLSelectElement | null} */ (bindListener('textAlign', handleFormStylePropChange));

// Title vertical alignment
const justifyContentSelect = /** @type {HTMLSelectElement | null} */ (bindListener('justifyContent', function handleJustifyContentSelectChange(e) {
    handleFormStylePropChange(e);
    repositionTitleAlignment();
    repositionDeleteBtn();
}));

// Font
let fontsAdded = false;
const fontFamilySelect = /** @type {HTMLSelectElement | null} */ (bindListener('fontFamily', function handleFontChange(e) {
    if (!fontsAdded) {
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Alegreya&family=Alice&family=Bitter&family=Cormorant&family=EB+Garamond&family=IBM+Plex+Serif&family=Literata:opsz@7..72&family=Lora&family=Merriweather&family=Old+Standard+TT&family=PT+Serif&family=PT+Serif+Caption&family=Piazzolla:opsz@8..30&family=Playfair+Display&family=Prata&family=Source+Serif+Pro&family=Spectral&family=Alegreya+Sans&family=Arsenal&family=Commissioner&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inter&family=JetBrains+Mono&family=Montserrat&family=PT+Mono&family=PT+Sans&family=Raleway&family=Roboto&family=Roboto+Condensed&family=Roboto+Mono&family=Rubik&family=Yanone+Kaffeesatz&family=Caveat&family=Lobster&family=Pacifico&family=Pangolin&family=Podkova&family=Press+Start+2P&family=Ruslan+Display&family=Russo+One&family=Underdog&family=Yeseva+One&display=swap';
        document.head.appendChild(link);
        fontsAdded = true;
    }
    handleArticleStylePropChange(e);
}));

// Aspect ratio
bindListener('aspectRatio', function handleAspectRatioChange() {
    const mount = getMount();

    if (mount) {
        mount.dataset.aspectRatio = this.value;
        if (deleteBtn) { deleteBtn.hidden = true; }
        if (titleAlignment) { titleAlignment.hidden = true; }
    }
});

// Colors
const colorInput = bindListener('color', handleArticleStylePropChange);
const backgroundColorInput = bindListener('backgroundColor', function handleDivStylePropChange() {
    const activeDiv = getActiveDiv();

    if (activeDiv) {
        activeDiv.style[this.name] = this.value;
    }
});

/**
 * SCROLL OBSERVER
 */

/**
 * @param {HTMLSelectElement | null} select to pass the value
 * @param {HTMLElement | null} from take a style value
 * @returns {void}
 */
function assignValueFromStyle(select, from) {
    if (select && from) {
        if (from.style[select.name]) {
            select.value = from.style[select.name];
        } else {
            select.selectedIndex = 0;
        }
    }
}

const observer = new IntersectionObserver(function onIntersect(entries) {
    for (const entry of entries) {
        const page = /** @type {HTMLLIElement} */ (entry.target);

        if (entry.isIntersecting) {
            page.classList.add('active');

            const activeArticle = getActiveArticle(page);
            const activeDiv = getActiveDiv(activeArticle);
            const activeForm = getActiveForm(activeArticle);
            const convertRGBtoHex = (rgb) => {
                const colorToHex = (color) => parseInt(color, 10).toString(16).padStart(2, '0');
                const colors = rgb.slice(4, -1).split(', ');

                return '#' + colorToHex(colors[0]) + colorToHex(colors[1]) + colorToHex(colors[2]);
            };

            assignValueFromStyle(textAlignSelect, activeForm);
            assignValueFromStyle(justifyContentSelect, activeForm);
            if (backdropFilterInput && activeForm) {
                backdropFilterInput.value = activeForm.style[backdropFilterInput.name] ? activeForm.style[backdropFilterInput.name].slice(5, -3) : '0';
            }
            assignValueFromStyle(fontFamilySelect, activeArticle);
            if (colorInput && activeArticle) {
                colorInput.value = convertRGBtoHex(activeArticle.style.color);
            }
            if (opacityRange && activeDiv) {
                opacityRange.value = (1 - parseFloat(activeDiv.style.opacity)).toString();
            }
            if (backgroundColorInput && activeDiv) {
                backgroundColorInput.value = convertRGBtoHex(activeDiv.style.backgroundColor);
            }
            if (backgroundImageInput) {
                backgroundImageInput.value = '';
            }
        } else {
            const activeElement = getActiveElement(page);
            const focusedElement =  /** @type {HTMLElement | null} */ (page.querySelector(':focus'));

            if (activeElement) {
                activeElement.classList.remove('active');
            }
            if (focusedElement) {
                focusedElement.blur();
            }

            page.classList.remove('active');
        }

        repositionDeleteBtn();
        repositionTitleAlignment();
        if (background) {
            background.hidden = true;
        }
    }
}, {
    root: getMount(),
    threshold: 0.6,
});

// Delete page
bindListener('deletePage', function handleDeletePageClick() {
    const activePage = getActiveLi();

    if (activePage && window.confirm('Remove the current page?')) {
        observer.unobserve(activePage);
        activePage.remove();
    }
}, 'click');

/**
 * IMPORT
 */

/**
 * @param {HTMLFormElement} form
 */
function bindFormListeners(form) {
    form.addEventListener('focusin', function handleFormFocusIn(e) {
        const focusedElement = /** @type {HTMLElement} */ (e.target);
        const editableElements = /** @type {NodeListOf<HTMLElement>} */ (this.querySelectorAll('[contenteditable]'));

        for (const editableElement of editableElements) {
            editableElement.classList.toggle('active', editableElement === focusedElement);
        }
        if (!(['H2', 'H3', 'SPAN', 'P'].includes(focusedElement.tagName) && sorting && sorting.checked)) {
            repositionDeleteBtn(focusedElement);
        } else if (deleteBtn) {
            deleteBtn.hidden = true;
        }
        repositionTitleAlignment(focusedElement);
        repositionBackground(this);
    });
    form.addEventListener('input', function handleFormInput(e) {
        const element = /** @type {HTMLElement} */ (e.target);

        if (!element.innerText) {
            element.textContent = ' ';
        }
        // If overflow
        // const page = e.currentTarget.parentElement;
        // if (page && (page.scrollHeight - page.clientHeight > 16)) {
        //     window.alert(page.scrollHeight + ' ' + page.clientHeight);
        // }
    });
}

function attachStyleFromJson({ form, div, article }, props = {}) {
    const { backdropFilter, justifyContent, textAlign, backgroundColor, opacity, backgroundImage, color, fontFamily } = props;
    const assignFilteredStyle = function (element, object) {
        Object.assign(element.style, Object.fromEntries(Object.entries(object).filter(function filterEmpty([, value]) {
            return value;
        })));
    };

    assignFilteredStyle(form, { backdropFilter, justifyContent, textAlign });
    assignFilteredStyle(div, { backgroundColor, opacity });
    assignFilteredStyle(article, { backgroundImage, color, fontFamily });
}

/** @typedef {{ STYLE?: Record<string, string>, ITEMS?: ({type: 'CATEGORY'; H2?: string} | {type: 'SERVICE'; H3?: string; SPAN?: string; P?: string;})[], H1?: string, FOOTER?: string }} Page */
/**
 * @param {Page} pageJson
 * @param {boolean} [isActive]
 * @returns {HTMLLIElement}
 */
function createPage(pageJson = { STYLE: DEFAULTS.STYLE }, isActive = true) {
    const li = document.createElement('li');
    const article = document.createElement('article');
    const form = document.createElement('form');
    const div = document.createElement('div');
    const draggable = Boolean(sorting && sorting.checked);

    li.classList.toggle('active', isActive);
    form.tabIndex = 0;
    bindFormListeners(form);
    article.append(div, form);

    attachStyleFromJson({ form, div, article }, pageJson.STYLE);
    createEditableElement({
        tag: 'H1',
        text: pageJson.H1,
        parent: form
    }, false);
    if (pageJson.ITEMS) {
        pageJson.ITEMS.map(function createItem(item) {
            switch (item.type) {
                case 'CATEGORY':
                    const category = createCategory(draggable, item);

                    if (category) { form.appendChild(category); }

                    break;
                case 'SERVICE':
                    form.appendChild(createService(draggable, item));

                    break;
            }
        });
    }
    createEditableElement({
        tag: 'FOOTER',
        text: pageJson.FOOTER,
        parent: form
    }, false);
    li.appendChild(article);
    observer.observe(li);

    return li;
}

/**
 * @param {{PAGES?: Page[]; STYLE?: {aspectRatio?: string}}} pagesJson
 * @param {HTMLElement | null} mount
 */
export function renderPages(pagesJson, mount = getMount()) {
    if (mount) {
        const pages = [];

        if (pagesJson.PAGES) {
            pagesJson.PAGES.forEach(function createPages(page, index) {
                pages.push(createPage(page, index === 0));
            });
        }
        if (pagesJson.STYLE) {
            mount.dataset.aspectRatio = pagesJson.STYLE.aspectRatio ? pagesJson.STYLE.aspectRatio : DEFAULTS.aspectRatio;
        }
        mount.textContent = '';
        mount.append(...pages);
    }
}

// Import
const importInput = bindListener('import', function handleImportClick(e) {
    if (!window.confirm('This will replace the current price. Continue?')) {
        e.preventDefault();
    }
}, 'click');

bindListener(importInput, function handleImportChange() {
    if (this.files) {
        const fileReader = new FileReader();

        fileReader.onload = function handleFileLoad(e) {
            if (e.target && typeof e.target.result === 'string') {
                renderPages(JSON.parse(e.target.result));
            } else {
                window.alert("Couldn't load the file");
            }
        };
        fileReader.readAsText(this.files[0], 'UTF-8');
    }
});

/**
 * ADD
 * */

bindListener('add', function handleAddClick(e) {
    const target = /** @type {HTMLElement | null} */ (e.target);

    if (target && target.tagName === 'BUTTON' && target.parentElement) {
        target.parentElement.removeAttribute('open');
        if (deleteBtn) { deleteBtn.hidden = true; }
        if (titleAlignment) { titleAlignment.hidden = true; }
    }
}, 'click');

bindListener('page', function handleAddPageClick() {
    const mount = getMount();

    if (mount) {
        const newPage = createPage();

        mount.appendChild(newPage);
        newPage.scrollIntoView();
    }
}, 'click');

bindListener('duplicate', function handleAddPageClick() {
    const pages = document.getElementById('pages');
    if (pages) {
        let newPage;
        const activePage = getActiveLi();

        if (activePage) {
            newPage = /** @type {HTMLLIElement} */ (activePage.cloneNode(true));

            let newPageTitle = newPage.querySelector('h1');
            let newPageForm = getActiveForm(newPage);

            if (newPageTitle) {
                newPageTitle.innerText += ' copy';
            }
            if (newPageForm) {
                bindFormListeners(newPageForm);
            }
        } else {
            newPage = createPage();
        }

        pages.appendChild(newPage);
        observer.observe(newPage);
        newPage.scrollIntoView();
    }
}, 'click');

bindListener('title', function handleAddTitleClick() {
    const form = getActiveForm();

    if (form) {
        const existingTitle = form.querySelector('h1');

        if (existingTitle) {
            existingTitle.focus();
        } else {
            createEditableElement({
                tag: 'H1',
                fromStart: true,
                parent: form
            });
        }
    }
}, 'click');

bindListener('footer', function handleAddFooterClick() {
    const form = getActiveForm();

    if (form) {
        const existingFooter = form.querySelector('footer');

        if (existingFooter) {
            existingFooter.focus();
        } else {
            createEditableElement({
                tag: 'FOOTER',
                parent: form
            });
        }
    }
}, 'click');

bindListener('category', function handleAddCategoryClick() {
    const form = getActiveForm();
    const category = createCategory(Boolean(sorting && sorting.checked));

    if (form && category) {
        const existingFooter = form.querySelector('footer');

        if (existingFooter) {
            form.insertBefore(category, existingFooter);
        } else {
            form.appendChild(category);
        }
    }
}, 'click');

bindListener('service', function handleAddServiceClick() {
    const form = getActiveForm();
    const service = createService(Boolean(sorting && sorting.checked));

    if (form && service) {
        const existingFooter = form.querySelector('footer');

        if (existingFooter) {
            form.insertBefore(service, existingFooter);
        } else {
            form.appendChild(service);
        }
    }
}, 'click');

/**
 * GLOBALS
 */

const resizeObserver = new ResizeObserver(() => {
    repositionBackground();
    repositionDeleteBtn();
    repositionTitleAlignment();
});

resizeObserver.observe(document.body);
document.body.addEventListener('keyup', function sortWithArrows(e) {
    const targetElement = /** @type {HTMLElement | null} */ (e.target);
    const element = targetElement && (['H3', 'P', 'SPAN'].includes(targetElement.tagName) ? targetElement.parentElement : targetElement);

    if (element && element.draggable) {
        const parentElement = element && element.parentElement;

        switch (e.key) {
            case 'ArrowUp':
                const previousElement = /** @type {HTMLElement | null} */ (element.previousElementSibling);

                if (parentElement && previousElement && previousElement.draggable) {
                    parentElement.insertBefore(element, previousElement);
                    targetElement.focus();
                    e.preventDefault();
                }

                break;
            case 'ArrowDown':
                const nextElement = /** @type {HTMLElement | null} */ (element.nextElementSibling);

                if (parentElement && nextElement && nextElement.draggable) {
                    parentElement.insertBefore(nextElement, element);
                    e.preventDefault();
                }

                break;
        }
    }
});
renderPages(DEFAULTS.get());