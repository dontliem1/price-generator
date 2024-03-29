'use strict';

/** @type {HTMLElement | null} */
let dragged = null;
/** @type {HTMLElement | null} */
let draggedOver = null;
let draggedSame = false;
/** @type {EventTarget | null} */
let draggedTarget = null;
let sortingPolyfilled = false;
let fontsAdded = false;
const STORAGE_KEY = 'price';
const savedCopy = window.localStorage.getItem(STORAGE_KEY);
const TITLE_TAG = 'H1';
const FOOTER_TAG = 'FOOTER';
const CATEGORY_TAG = 'H2';
const SERVICE_TAG = 'DIV';
const SERVICE_NAME_TAG = 'B';
const SERVICE_PRICE_TAG = 'SPAN';
const SERVICE_DESCRIPTION_TAG = 'P';
const SERVICE_TAGS = [SERVICE_NAME_TAG, SERVICE_PRICE_TAG, SERVICE_DESCRIPTION_TAG];
const ITEMS_TAGS = [CATEGORY_TAG, ...SERVICE_TAGS];
const DRAG_OVER_CLASSNAMES = ["drag-over--before", "drag-over--after"];
const titleAlignment = document.getElementById('titleAlignment');
const mountElement = document.getElementById('pages');

/**
 * @param {keyof MESSAGES} key
 */
function m(key) { return (typeof MESSAGES === 'object' && key in MESSAGES) ? MESSAGES[key] : 'text_not_found'; }

class Defaults {
    constructor() {
        this.aspectRatio = '4 / 5';
        /** @type {Category} */
        this.CATEGORY = { type: 'CATEGORY', [CATEGORY_TAG]: m(CATEGORY_TAG) };
        /** @type {Service} */
        this.SERVICE = {
            type: 'SERVICE',
            [SERVICE_NAME_TAG]: m(SERVICE_NAME_TAG),
            [SERVICE_PRICE_TAG]: m(SERVICE_PRICE_TAG),
            [SERVICE_DESCRIPTION_TAG]: m(SERVICE_DESCRIPTION_TAG),
        };
        this.STYLE = {
            backgroundColor: 'rgb(50, 50, 50)',
            color: 'rgb(255, 255, 255)',
            opacity: '0.5',
        };
    }
    /**
     * @return {Pages} Example pages
     */
    get() {
        return { PAGES, STYLE: { aspectRatio: this.aspectRatio } };
    }
}

const DEFAULTS = new Defaults();

/* GETTERS */
/**
 * @returns {HTMLLIElement | null} `<li>` of current page
 */
function getActiveLi() {
    return document.querySelector('li.active');
}

function getActiveArticle(li = getActiveLi()) {
    return /** @type {HTMLElement | null} */ (li && li.firstElementChild);
}

function getActiveDiv(article = getActiveArticle()) {
    return /** @type {HTMLDivElement | null} */ (article && article.firstElementChild);
}

function getActiveForm(article = getActiveArticle()) {
    return /** @type {HTMLFormElement | null} */ (article && article.lastElementChild);
}

/**
 * @returns {HTMLElement | null} last focused element
 */
function getActiveElement(li = getActiveLi()) {
    return li && li.querySelector('.active[contenteditable]');
}

/**
 * @param {HTMLElement} el
 */
function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        height: rect.height,
    };
}

/* CONSTRUCTORS */
/**
* @param {Object} params
* @param {string} params.tag
* @param {string} [params.text]
* @param {HTMLElement | null} [params.parent]
* @param {boolean} [params.fromStart]
* @param {boolean} [useDefaults] - If `true` creates an element with default text if `text` is empty
*/
function createEditableElement({ tag, text, parent }, useDefaults = true) {
    if (!useDefaults && typeof text !== 'string') {
        return null;
    }

    const elem = document.createElement(tag);

    elem.contentEditable = 'false';
    elem.innerText = text || MESSAGES[tag];
    if (parent) {
        if (tag === TITLE_TAG) {
            parent.prepend(elem);
        } else {
            parent.appendChild(elem);
        }
    }
    elem.tabIndex = 0;

    return elem;
}

const itemsActionsMap = {
    CATEGORY: function createCategory(/** @type {boolean} */ draggable, categoryJson = DEFAULTS.CATEGORY) {
        const category = /** @type {HTMLElementTagNameMap[Lowercase<typeof CATEGORY_TAG>]}  */ (createEditableElement({
            tag: CATEGORY_TAG,
            text: CATEGORY_TAG in categoryJson ? categoryJson[CATEGORY_TAG] : m(CATEGORY_TAG),
        }, false));

        category.draggable = draggable;

        return category;
    },
    SERVICE: function createService(/** @type {boolean} */ draggable, serviceJson = DEFAULTS.SERVICE) {
        const service = /** @type {HTMLElementTagNameMap[Lowercase<typeof SERVICE_TAG>]} */ (document.createElement(SERVICE_TAG));

        service.draggable = draggable;
        for (const serviceProp in serviceJson) {
            if (SERVICE_TAGS.includes(serviceProp)) {
                createEditableElement({
                    tag: serviceProp,
                    text: serviceJson[serviceProp],
                    parent: service
                }, false);
            }
        }

        return service;
    }
};

/**
 * @param {HTMLElement} page
 * @param {boolean} [parseImages]
 * @returns {Page}
 */
function parsePage(page, parseImages) {
    const div = /** @type {HTMLDivElement | null} */ (page.firstElementChild);
    /** @type {Partial<CSSStyleDeclaration>} */
    const divStyle = div ? div.style : {};
    const form = /** @type {HTMLFormElement | null} */ (page.lastElementChild);
    /** @type {Partial<CSSStyleDeclaration>} */
    const formStyle = form ? form.style : {};
    const priceElements = form ? /** @type {HTMLCollectionOf<HTMLElement>} */ (form.children) : [];
    const pageJson = {
        /** @type {(Category | Service)[]} */
        ITEMS: [],
        STYLE: {
            backgroundColor: divStyle.backgroundColor,
            backgroundImage: (!parseImages && 'gradient' !== page.style.backgroundImage.substring(7, 15)) ? undefined : page.style.backgroundImage,
            color: page.style.color,
            fontFamily: page.style.fontFamily,
            justifyContent: formStyle.justifyContent,
            opacity: divStyle.opacity,
            textAlign: formStyle.textAlign,
        }
    };

    for (const priceElem of priceElements) {
        switch (priceElem.tagName) {
            case TITLE_TAG:
            case FOOTER_TAG:
                pageJson[priceElem.tagName] = priceElem.innerText;

                break;
            case CATEGORY_TAG:
                pageJson.ITEMS.push({ type: 'CATEGORY', [CATEGORY_TAG]: priceElem.innerText });

                break;
            case SERVICE_TAG:
                if (priceElem.childElementCount > 0) {
                    /** @type {Service} */
                    const service = { type: "SERVICE" };

                    for (const item of priceElem.children) {
                        service[item.tagName] = item.textContent;
                    }

                    pageJson.ITEMS.push(service);
                }

                break;
        }
    }

    return pageJson;
}

/**
 * @param {boolean} [parseImages]
 * @returns {string} The current price stringified
 */
function parsePages(parseImages) {
    /** @type {Required<Pages>} */
    const json = {
        PAGES: [],
        STYLE: {}
    };
    const pages = document.getElementsByTagName('article');

    if (mountElement !== null && mountElement.dataset.aspectRatio) {
        json.STYLE.aspectRatio = mountElement.dataset.aspectRatio;
    }
    for (const page of pages) {
        json.PAGES.push(parsePage(page, parseImages));
    }

    return JSON.stringify(json);
}

/* LISTENERS */

/**
 * @typedef {HTMLInputElement | HTMLButtonElement | HTMLSelectElement | null} InteractiveElement
 * @param {InteractiveElement | string} element
 * @param {(this: HTMLInputElement, ev: Event) => any} callback
 * @param {'change' | 'click' | 'input'} [eventType]
 * @return {InteractiveElement}
 */
function BindListener(element, callback, eventType = 'change') {
    const targetElement = typeof element === 'string' ?
        /** @type {InteractiveElement} */ (document.getElementById(element)) :
        element;

    if (targetElement) { targetElement.addEventListener(eventType, callback); }

    return targetElement;
}

/**
 * It takes the value of the control and sets the value of the article's style property to that value.
 * @param {Event} e - The event object
 */
function handleArticleStylePropChange(e) {
    const activeArticle = getActiveArticle();

    if (activeArticle !== null && (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
        activeArticle.style[e.target.name] = e.target.value;
    }
}

/**
 * It takes the value of the selected control and sets the value of the form's style property to that value.
 * @param {Event} e - The event object
 */
function handleFormStylePropChange(e) {
    const activeForm = getActiveForm();

    if (activeForm && (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
        activeForm.style[e.target.name] = e.target.value;
    }
}

/* FLOAT */

/**
 * If the active element is an H1 and it's alone or with footer, then show the title
 * alignment element
 * @param [element] - The element to reposition the title alignment for.
 */
function repositionTitleAlignment(element = getActiveElement()) {
    if (titleAlignment !== null) {
        if (
            element !== null &&
            element.tagName === TITLE_TAG &&
            (element.nextElementSibling === null || element.nextElementSibling.tagName === FOOTER_TAG)
        ) {
            const { left, height, top } = getOffset(element);

            titleAlignment.style.transform = `translate(${left}px, ${top + height}px)`;
            titleAlignment.hidden = false;
        } else {
            titleAlignment.hidden = true;
        }
    }
}

// Remove element
const deleteBtn = BindListener('delete', function handleDeleteClick() {
    const element = getActiveElement();
    const parentElement = element && element.parentElement;

    if (element !== null && parentElement) {
        if (
            parentElement.tagName === SERVICE_TAG &&
            parentElement.childElementCount > 1 &&
            SERVICE_TAGS.includes(element.tagName) &&
            window.confirm(m('REMOVE_SERVICE'))
        ) {
            parentElement.remove();
        } else {
            element.remove();
            if (parentElement.tagName === SERVICE_TAG && parentElement.innerText.trim() === '') {
                parentElement.remove();
            }
            if (titleAlignment !== null) { titleAlignment.hidden = true; }
        }
        this.hidden = true;
        window.localStorage.setItem(STORAGE_KEY, parsePages());
    }
}, 'click');

// Swap
function movePage(e) {
    const toRight = e.currentTarget && e.currentTarget.id === 'moveRight';
    const activePage = getActiveLi();
    const sibling = activePage !== null && (toRight ? activePage.nextElementSibling : activePage.previousElementSibling);

    if (sibling) {
        sibling.insertAdjacentElement(toRight ? 'afterend' : 'beforebegin', activePage);
        activePage.scrollIntoView();
    }
}
const moveLeft = BindListener('moveLeft', movePage, 'click');
const moveRight = BindListener('moveRight', movePage, 'click');

// Background
const background = document.getElementById('background');

/**
 * If the form is active, show the background and hide the left and right arrows if there's no according neighbors
 * @param [form] - The form to reposition the background for.
 */
function toggleBackground(form = getActiveForm()) {
    if (background !== null) {
        if (form && form.isSameNode(document.activeElement)) {
            const activeLi = getActiveLi();

            if (activeLi && moveLeft && moveRight) {
                moveLeft.hidden = activeLi.previousElementSibling === null;
                moveRight.hidden = activeLi.nextElementSibling === null;
            }
            background.hidden = false;
        } else {
            background.hidden = true;
        }
    }
}

/* SETTINGS */

const sorting = /** @type {HTMLInputElement | null} */ (BindListener('sorting', function handleSortingChange() {
    const draggableElements = /** @type {NodeListOf<HTMLElement>} */ (
        document.querySelectorAll('#pages [draggable]')
    );
    const contentEditable = (!this.checked).toString();

    if (!sortingPolyfilled) {
        const script = document.createElement('script');

        script.src = '/assets/js/vendors/DragDropTouch.js';
        script.async = false;
        document.body.appendChild(script);
        sortingPolyfilled = true;
    }
    for (const element of draggableElements) {
        element.draggable = this.checked;
        if (element.tagName === CATEGORY_TAG) {
            element.contentEditable = contentEditable;
        }
        if (element.tagName === SERVICE_TAG) {
            for (const child of element.children) {
                Object.assign(child, { contentEditable });
            }
        }
    }

    if (deleteBtn !== null) { deleteBtn.hidden = true; }
}));

/**
 * It repositions the delete button to the bottom of the currently active element
 * @param [element] - The element to reposition the delete button for.
 */
function repositionDeleteBtn(element = getActiveElement()) {
    if (deleteBtn !== null) {
        if (
            element !== null &&
            (
                [TITLE_TAG, FOOTER_TAG].includes(element.tagName) ||
                (ITEMS_TAGS.includes(element.tagName) && sorting !== null && !sorting.checked)
            )
        ) {
            const { left, height, top } = getOffset(element);

            deleteBtn.style.transform = `translate(${left + Math.min(
                0,
                window.innerWidth - left - deleteBtn.clientWidth - 6
            )}px, ${top + height + Math.min(
                0,
                window.innerHeight - top - height - deleteBtn.clientHeight - 6
            )}px)`;
            deleteBtn.hidden = false;
        } else {
            deleteBtn.hidden = true;
        }
    }
}

// Background opacity
const opacityRange = BindListener('opacity', function handleOpacityRangeChange() {
    const activeDiv = getActiveDiv();

    if (activeDiv !== null) {
        activeDiv.style.opacity = (1 - this.valueAsNumber).toString();
    }
}, 'input');

// Background image
const backgroundImageInput = BindListener('backgroundImage', function handleBackgroundImageChange() {
    const activeArticle = getActiveArticle();

    if (this.files !== null && activeArticle !== null) {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onloadend = function handleImageLoadEnd() {
            activeArticle.style.backgroundImage = 'url("' + reader.result + '")';
        };
        reader.readAsDataURL(file);
    }
});

BindListener('deleteBackgroundImage', function handleDeleteBackgroundImageClick() {
    const activeArticle = getActiveArticle();

    if (activeArticle !== null && backgroundImageInput) {
        activeArticle.style.backgroundImage = '';
        backgroundImageInput.value = '';
    }
}, 'click');

// Title justify
const textAlignSelect = /** @type {HTMLSelectElement | null} */ (BindListener(
    'textAlign',
    handleFormStylePropChange
));

// Title vertical alignment
const justifyContentSelect = /** @type {HTMLSelectElement | null} */ (BindListener(
    'justifyContent',
    function handleTitleAlignmentChange(e) {
        handleFormStylePropChange(e);
        repositionTitleAlignment();
        repositionDeleteBtn();
    }
));

// Font
function handleFontChange(e) {
    if (!fontsAdded) {
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Alegreya&family=Alice&family=Bitter&family=Cormorant&family=EB+Garamond&family=IBM+Plex+Serif&family=Literata:opsz@7..72&family=Lora&family=Merriweather&family=Old+Standard+TT&family=PT+Serif&family=PT+Serif+Caption&family=Piazzolla:opsz@8..30&family=Playfair+Display&family=Prata&family=Source+Serif+Pro&family=Spectral&family=Alegreya+Sans&family=Arsenal&family=Commissioner&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inter&family=JetBrains+Mono&family=Montserrat&family=PT+Mono&family=PT+Sans&family=Raleway&family=Roboto&family=Roboto+Condensed&family=Roboto+Mono&family=Rubik&family=Yanone+Kaffeesatz&family=Caveat&family=Lobster&family=Pacifico&family=Pangolin&family=Podkova&family=Press+Start+2P&family=Ruslan+Display&family=Russo+One&family=Underdog&family=Yeseva+One&display=swap';
        document.head.appendChild(link);
        fontsAdded = true;
    }
    handleArticleStylePropChange(e);
}
const fontFamilySelect = /** @type {HTMLSelectElement | null} */ (BindListener('fontFamily', handleFontChange));

// Aspect ratio
const aspectRatioSelect = BindListener('aspectRatio', function handleAspectRatioChange() {
    if (mountElement !== null) { mountElement.dataset.aspectRatio = this.value; }
    if (deleteBtn !== null) { deleteBtn.hidden = true; }
    if (titleAlignment !== null) { titleAlignment.hidden = true; }
});

// Colors
const colorInput = BindListener('color', handleArticleStylePropChange);
const backgroundColorInput = BindListener('backgroundColor', function handleDivStylePropChange() {
    const activeDiv = getActiveDiv();

    if (activeDiv !== null) {
        activeDiv.style[this.name] = this.value;
    }
});

/* SCROLL OBSERVER */

/**
 * @param {HTMLSelectElement | null} select to pass the value
 * @param {HTMLElement | null} [from] take a style value
 * @returns {void}
 */
function assignValueFromStyle(select, from) {
    if (select !== null) {
        if (from && from.style[select.name]) {
            select.value = from.style[select.name];
        } else {
            select.selectedIndex = 0;
        }
    }
}

function colorToHex(/** @type {string} */ color) { return parseInt(color, 10).toString(16).padStart(2, '0'); }

function convertRGBtoHex(/** @type {string} */ rgb) {
    const colors = rgb.slice(4, -1).split(', ');

    return '#' + colors.map(colorToHex).join('');
}

const observer = new IntersectionObserver(function handleIntersect(entries) {
    for (const entry of entries) {
        const page = /** @type {HTMLLIElement} */ (entry.target);

        if (entry.isIntersecting) {
            page.classList.add('active');

            const focusedElement = page.querySelector(':focus');
            const activeArticle = getActiveArticle(page);
            const activeDiv = getActiveDiv(activeArticle);
            const activeForm = getActiveForm(activeArticle);

            if (focusedElement !== null) {
                focusedElement.classList.add('active');
            }
            assignValueFromStyle(textAlignSelect, activeForm);
            assignValueFromStyle(justifyContentSelect, activeForm);
            assignValueFromStyle(fontFamilySelect, activeArticle);
            if (colorInput !== null && activeArticle !== null) {
                colorInput.value = convertRGBtoHex(activeArticle.style.color);
            }
            if (activeDiv !== null) {
                if (opacityRange !== null) {
                    opacityRange.value = (1 - parseFloat(activeDiv.style.opacity || '0')).toString();
                }
                if (backgroundColorInput !== null) {
                    backgroundColorInput.value = convertRGBtoHex(activeDiv.style.backgroundColor);
                }
            }
            if (backgroundImageInput !== null) {
                backgroundImageInput.value = '';
            }
            toggleBackground(activeForm);
            repositionDeleteBtn();
            repositionTitleAlignment();
        } else {
            const activeElement = getActiveElement(page);

            if (activeElement !== null) {
                activeElement.classList.remove('active');
            }

            page.classList.remove('active');
            [deleteBtn, titleAlignment, background].forEach(function hideControl(control) {
                if (control !== null) {
                    control.hidden = true;
                }
            });
        }
    }
}, {
    root: mountElement,
    threshold: 1,
});

BindListener('save', function handleSaveClick() {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob(["\ufeff", parsePages(true)], { type: 'text/json' }));

    link.href = url;
    link.download = 'price.json';
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}, 'click');

/**
 * Check if the user agent supports the Web Share API with a single file.
 * @returns Whether the user agent can share files.
 */
function checkBasicFileShare() {
    const txt = new Blob(['Hello, world!'], { type: 'text/plain' });
    const file = new File([txt], 'test.txt');

    return navigator.canShare({ files: [file] });
}

BindListener('export', async function handleExportClick(e) {
    const exportBtn = /** @type {HTMLButtonElement} */ (e.currentTarget);

    exportBtn.disabled = true;

    await import('./vendors/html2canvas.min.js');

    const pages = document.getElementsByTagName('article');
    /** @type {HtmlToCanvasOptions} */
    const options = { allowTaint: true, backgroundColor: '#000', scale: 1, windowWidth: 1080, windowHeight: 1920 };

    if (sorting !== null) { sorting.checked = false; }
    if (navigator.share === undefined || !navigator.canShare || !checkBasicFileShare()) {
        const link = document.createElement('a');

        for (let i = 0; i < pages.length; i++) {
            try {
                link.href = (await html2canvas(pages[i], options)).toDataURL();
                link.download = (i + 1) + '.png';
                link.click();
            } catch (error) {
                window.console.error(error);
            }
        }
        link.remove();
    } else {
        const files = /** @type {File[]} */ ([]);

        for (const page of pages) {
            try {
                const canvas = await html2canvas(page, options);

                if (canvas instanceof HTMLCanvasElement) {
                    const blob = /** @type {Blob | null} */ (await new Promise(resolve => canvas.toBlob(resolve)));

                    if (blob) {
                        files.push(new File([blob], (files.length + 1) + '.png'));
                    }
                }
            } catch (error) {
                window.console.error(error);
            }
        }

        try {
            await navigator.share({ files });
        } catch (error) {
            window.console.log(error.toString());
        }
    }
    exportBtn.disabled = false;
}, 'click');

// Delete page
BindListener('deletePage', function handleDeletePageClick() {
    const activePage = getActiveLi();

    if (activePage !== null && window.confirm(m('REMOVE_PAGE'))) {
        observer.unobserve(activePage);
        activePage.remove();

        if (background !== null) {
            background.hidden = true;
        }
        window.localStorage.setItem(STORAGE_KEY, parsePages());
    }
}, 'click');

/* IMPORT */
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
    const { justifyContent, textAlign, backgroundColor, opacity, backgroundImage, color, fontFamily } = Object.assign(
        { backgroundColor: 'rgb(0, 0, 0)', opacity: '0', color: DEFAULTS.STYLE.color, fontFamily: '' },
        pageJson.STYLE
    );

    Object.assign(form.style, { justifyContent, textAlign });
    Object.assign(div.style, { backgroundColor, opacity });
    Object.assign(article.style, { backgroundImage, color, fontFamily });
    createEditableElement({
        tag: TITLE_TAG,
        text: pageJson[TITLE_TAG],
        parent: form
    }, false);
    if (Array.isArray(pageJson.ITEMS)) {
        pageJson.ITEMS.forEach(function appendItem(/** @type {any} */ item) {
            if (item.type in itemsActionsMap) {
                form.appendChild(itemsActionsMap[item.type](draggable, item));
            }
        });
    }
    createEditableElement({
        tag: FOOTER_TAG,
        text: pageJson.FOOTER,
        parent: form
    }, false);
    observer.observe(li);
    li.classList.toggle('active', isActive);
    form.tabIndex = 0;
    article.append(div, form);
    li.appendChild(article);

    return li;
}

/**
 * @param {Pages} pagesJson
 * @param {HTMLElement | null} mount
 */
function renderPages(pagesJson, mount = mountElement) {
    if (mount !== null) {
        const pages = [];
        const aspectRatio = (pagesJson.STYLE && pagesJson.STYLE.aspectRatio) ?
            pagesJson.STYLE.aspectRatio :
            DEFAULTS.aspectRatio;

        mount.dataset.aspectRatio = aspectRatio;
        if (aspectRatioSelect !== null) {
            aspectRatioSelect.value = aspectRatio;
        }
        if (Array.isArray(pagesJson.PAGES)) {
            pagesJson.PAGES.forEach(function createPages(page, index) {
                pages.push(createPage(page, index === 0));
            });
        }
        for (const oldPage of mount.children) {
            observer.unobserve(oldPage);
        }
        mount.textContent = '';
        mount.append(...pages);
    }
}

/**
 * @param {HTMLElement | null} element
 * @param {boolean} [duringSorting]
 */
function selectElement(element, duringSorting = (sorting !== null && sorting.checked)) {
    const selection = document.getSelection();

    if (element !== null) {
        const item = /** @type {HTMLElement} */ (element.firstElementChild ? element.firstElementChild : element);

        item.focus();
        if (!duringSorting && selection !== null) { selection.setBaseAndExtent(item, 0, item, item.childNodes.length); }
    }
}

if (savedCopy !== null && savedCopy !== m('PAGES') && window.confirm(m('LOAD_CONFIRM'))) {
    renderPages(JSON.parse(savedCopy));
} else {
    renderPages(DEFAULTS.get());
    window.localStorage.removeItem(STORAGE_KEY);
}

// Import
const importInput = BindListener('import', function handleImportClick(e) {
    if (!window.confirm(m('IMPORT_CONFIRM'))) {
        e.preventDefault();
    }
}, 'click');

BindListener(importInput, function handleImportChange() {
    if (this.files !== null) {
        const fileReader = new FileReader();

        fileReader.onload = function handleFileLoad(e) {
            if (e.target !== null && typeof e.target.result === 'string') {
                renderPages(JSON.parse(e.target.result));
            } else {
                window.alert(m('FILE_LOAD_ERROR'));
            }
        };
        fileReader.readAsText(this.files[0], 'UTF-8');
    }
});

/* ADD */

BindListener('duplicate', function handleDuplicateClick() {
    const activeLi = getActiveLi();

    if (activeLi !== null) {
        const activePage = getActiveArticle(activeLi);
        const activePageJson = activePage && parsePage(activePage);

        if (activePageJson && TITLE_TAG in activePageJson) {
            activePageJson[TITLE_TAG] += m('COPY');
        }

        const newPage = activePageJson ? createPage(activePageJson) : createPage();

        observer.observe(newPage);
        activeLi.insertAdjacentElement('afterend', newPage);
        newPage.scrollIntoView();
    }
}, 'click');

BindListener('title', function handleAddTitleClick() {
    const form = getActiveForm();

    if (form !== null) {
        const existingTitle = /** @type {HTMLElementTagNameMap[Lowercase<typeof TITLE_TAG>] | null} */ (form.querySelector(TITLE_TAG.toLowerCase()));

        selectElement(existingTitle !== null ? existingTitle : createEditableElement({
            tag: TITLE_TAG,
            parent: form
        }));
    }
}, 'click');

BindListener('footer', function handleAddFooterClick() {
    const form = getActiveForm();

    if (form !== null) {
        const existingFooter =  /** @type {HTMLElementTagNameMap[Lowercase<typeof FOOTER_TAG>] | null} */ (form.querySelector(FOOTER_TAG.toLowerCase()));

        selectElement(existingFooter !== null ? existingFooter : createEditableElement({
            tag: FOOTER_TAG,
            parent: form
        }));
    }
}, 'click');

Object.keys(itemsActionsMap).forEach(function bingClickToItem(itemId) {
    BindListener(itemId.toLowerCase(), function handleAddItemClick() {
        const form = getActiveForm();

        if (form !== null) {
            const item = /** @type {HTMLElementTagNameMap[Lowercase<typeof CATEGORY_TAG | typeof SERVICE_TAG>]} */ (itemsActionsMap[itemId](Boolean(sorting && sorting.checked)));

            form.insertBefore(item, form.querySelector(FOOTER_TAG.toLowerCase()));
            selectElement(item, true);
        }
    }, 'click');
});

/* GLOBAL LISTENERS */

const resizeObserver = new ResizeObserver(function handleResize() {
    toggleBackground();
    repositionDeleteBtn();
    repositionTitleAlignment();
});

resizeObserver.observe(document.body);

if (mountElement !== null) {
    BindListener('page', function handleAddPageClick() {
        const newPage = createPage();

        mountElement.appendChild(newPage);
        newPage.scrollIntoView();
    }, 'click');

    mountElement.addEventListener("drop", function handleDivDrop(e) {
        e.preventDefault();

        const event = /** @type {DragEvent & {rangeParent: HTMLElement; rangeOffset: Number;}} */ (e);
        const text = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
        let dropZone = event.target;
        let range = document.caretRangeFromPoint && document.caretRangeFromPoint(event.clientX, event.clientY);

        if (!range && event.rangeParent) {
            range = document.createRange();
            range.setStart(event.rangeParent, event.rangeOffset);
            range.setEnd(event.rangeParent, event.rangeOffset);
        }

        if (range !== null) { range.insertNode(document.createTextNode(text)); }

        while (dropZone instanceof HTMLElement && !dropZone.draggable) {
            dropZone = dropZone.parentElement;
        }

        if (dropZone instanceof HTMLElement && sorting && sorting.checked) {
            if (dragged !== null && !dragged.isSameNode(dropZone)) {
                dropZone.insertAdjacentElement(dropZone.classList.contains(DRAG_OVER_CLASSNAMES[0]) ? 'beforebegin' : 'afterend', dragged);
            }
            dropZone.classList.remove(...DRAG_OVER_CLASSNAMES);
        }
    });
    mountElement.addEventListener('focusin', function handleFormFocusIn(e) {
        const focusedElement = /** @type {HTMLElement} */ (e.target);
        const form = /** @type {HTMLFormElement} */ (focusedElement.closest('form'));
        const editableElements = /** @type {NodeListOf<HTMLElement>} */ (form.querySelectorAll('[contenteditable]'));

        for (const editableElement of editableElements) {
            editableElement.classList.toggle('active', editableElement.isSameNode(focusedElement));
        }
        if (
            focusedElement.hasAttribute('contenteditable') &&
            !(focusedElement.draggable || (focusedElement.parentElement && focusedElement.parentElement.draggable))
        ) {
            editableElements.forEach(function enableContentEditable(element) {
                element.contentEditable = 'true';
            });
            if (background !== null) { background.hidden = true; }
        }
        if (ITEMS_TAGS.includes(focusedElement.tagName) && sorting !== null && sorting.checked) {
            if (deleteBtn !== null) {
                deleteBtn.hidden = true;
            }
        } else {
            repositionDeleteBtn(focusedElement);
        }
        repositionTitleAlignment(focusedElement);
        if (form.isSameNode(focusedElement)) {
            toggleBackground(form);
        }
    });
    mountElement.addEventListener('focusout', function handleFormInput(e) {
        if (e.target instanceof HTMLElement && e.target.hasAttribute('contenteditable')) {
            const form = e.target.closest('form');

            if (form !== null) {
                const editableElements = /** @type {NodeListOf<HTMLElement>} */ (form.querySelectorAll('[contenteditable]'));

                editableElements.forEach(function disableContentEditable(element) {
                    element.contentEditable = 'false';
                });
            }
        }
    });
    mountElement.addEventListener('paste', function stripTagsOnPaste(e) {
        e.preventDefault();

        const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
        const oldSelection = document.getSelection();

        if (oldSelection !== null) {
            const range = oldSelection.getRangeAt(0);

            range.deleteContents();

            const textNode = document.createTextNode(text);

            range.insertNode(textNode);
            range.selectNodeContents(textNode);
            range.collapse(false);

            const selection = window.getSelection();

            if (selection !== null) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    });
    mountElement.addEventListener("dragenter", function handleDragEnter(e) {
        const activeForm = getActiveForm();
        let dropZone = null;

        if (e.target instanceof HTMLElement) {
            if ([CATEGORY_TAG, SERVICE_TAG].includes(e.target.tagName)) {
                dropZone = e.target;
            }
            if (SERVICE_TAGS.includes(e.target.tagName)) {
                dropZone = e.target.parentElement;
            }
        }

        if (dragged !== null && activeForm !== null && dropZone !== null && sorting && sorting.checked) {
            let hoverClass = DRAG_OVER_CLASSNAMES[0];

            for (let i = 0; i < activeForm.childElementCount; i++) {
                if (dropZone.isSameNode(activeForm.children[i])) {
                    break;
                }
                if (dragged.isSameNode(activeForm.children[i])) {
                    hoverClass = DRAG_OVER_CLASSNAMES[1];

                    break;
                }
            }
            dropZone.classList.add(hoverClass);

            if (dropZone.tagName === SERVICE_TAG) {
                draggedSame = dropZone === draggedOver;
                draggedOver = dropZone;
                draggedTarget = e.target;
            }
        }
    });
    mountElement.addEventListener("dragleave", function handleDragLeave(e) {
        if (e.target instanceof HTMLElement) {
            if (e.target.tagName === CATEGORY_TAG ||
                (e.target.tagName === SERVICE_TAG && (!draggedSame || (draggedTarget === e.target)))
            ) {
                e.target.classList.remove(...DRAG_OVER_CLASSNAMES);
            } else if (
                SERVICE_TAGS.includes(e.target.tagName) &&
                (!draggedSame || (draggedTarget === e.target)) &&
                e.target.parentElement !== null
            ) {
                e.target.parentElement.classList.remove(...DRAG_OVER_CLASSNAMES);
            }
        }
    });
    mountElement.addEventListener("dragstart", function handleDragStart(e) {
        if (e.target instanceof HTMLElement) {
            dragged = e.target;
        }
    });
    mountElement.addEventListener("dragend", function handleDragEnd() {
        dragged = null;
    });
    mountElement.addEventListener("dragover", function handleDragOver(event) {
        event.preventDefault();
    }, false);
}

document.body.addEventListener('click', function handleClick(e) {
    if (e.target instanceof HTMLElement) {
        const closestFieldset = e.target.closest('fieldset');
        const add = document.getElementById('add');

        if (
            !e.target.hasAttribute('contenteditable') &&
            !['delete', 'titleAlignment', 'textAlign', 'justifyContent'].includes(e.target.id)
        ) {
            if (deleteBtn !== null) { deleteBtn.hidden = true; }
            if (titleAlignment !== null) { titleAlignment.hidden = true; }
        }

        if (
            background !== null &&
            e.target.tagName !== 'FORM' &&
            !(closestFieldset && !e.target.isSameNode(closestFieldset) && closestFieldset.id === 'background') &&
            !(e.target.isSameNode(this) && document.activeElement && document.activeElement.tagName === 'FORM')
        ) {
            background.hidden = true;
        }

        if (add && e.target.id !== 'addSummary') {
            add.removeAttribute('open');
        }

        if (e.target.id !== '' && typeof ym === 'function') {
            ym(89949856, 'reachGoal', e.target.id);
        }
    }
});

document.body.addEventListener('keyup', function sortWithArrows(e) {
    if (e.target instanceof HTMLElement && sorting && sorting.checked) {
        const element = SERVICE_TAGS.includes(e.target.tagName) ? e.target.parentElement : e.target;

        if (element !== null && element.draggable) {
            switch (e.key) {
                case 'ArrowUp':
                    if (element.previousElementSibling instanceof HTMLElement && element.previousElementSibling.draggable) {
                        element.previousElementSibling.insertAdjacentElement("beforebegin", element);
                    }

                    break;
                case 'ArrowDown':
                    if (element.nextElementSibling instanceof HTMLElement && element.nextElementSibling.draggable) {
                        element.nextElementSibling.insertAdjacentElement("afterend", element);
                    }

                    break;
            }
            e.target.focus();
        }
    }
});

document.body.addEventListener('change', function savePages() {
    window.localStorage.setItem(STORAGE_KEY, parsePages());
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register("/sw.js");
    });
}