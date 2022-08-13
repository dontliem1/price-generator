'use strict';

/**
 * @param {string} key
 */
function m(key) { return (messages && key in messages) ? messages[key] : 'text_not_found'; }

class Defaults {
    constructor() {
        this.aspectRatio = '4 / 5';
        this.opacity = '0.5';
        /** @type {Category} */
        this.CATEGORY = { type: 'CATEGORY', H2: m('H2') };
        /** @type {Service} */
        this.SERVICE = {
            type: 'SERVICE',
            H3: m('H3'),
            P: m('P'),
            SPAN: m('SPAN'),
        };
        this.STYLE = {
            backgroundColor: 'rgb(50, 50, 50)',
            color: 'rgb(255, 255, 255)',
            opacity: this.opacity,
        };
    }
    /**
     * @return {Pages}
     */
    get() {
        return {
            PAGES: [{
                H1: m('PRICE'),
                ITEMS: m('ITEMS'),
                FOOTER: m('EXAMPLE_FOOTER'),
                STYLE: {
                    backgroundColor: 'rgb(0, 0, 0)',
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, 0) 100%), radial-gradient(at left bottom, rgba(0, 200, 255, 1) 0%, rgba(0, 200, 255, 0) 80%), linear-gradient(135deg, rgba(50, 50, 120, 0) 0%, rgba(50, 50, 120, 0) 75%, rgba(50, 50, 120, 1) 100%), linear-gradient(75deg, rgba(100, 100, 0, 1) 0%, rgba(200, 100, 100, 1) 17%, rgba(200, 150, 40, 1) 74%, rgba(200, 100, 30, 1) 100%)',
                    color: 'rgb(230, 228, 200)',
                    justifyContent: 'flex-end',
                    opacity: '0.3',
                },
            }], STYLE: { aspectRatio: this.aspectRatio }
        };
    }
}

const DEFAULTS = new Defaults();

/** @type {ReadonlyArray<'H2'| 'H3'| 'SPAN'| 'P'>} */
const ITEMS_TAGS = ['H2', 'H3', 'SPAN', 'P'];
/** @type {ReadonlyArray<'H1'| 'FOOTER'>} */
const HEADER_TAGS = ['H1', 'FOOTER'];


/**
 * GETTERS
 */

/**
 * @returns {HTMLOListElement | null} `<ol>` of current page
 */
function getMount() {
    return /** @type {HTMLOListElement | null} */ (document.getElementById('pages'));
}

/**
 * @returns {HTMLLIElement | null} `<li>` of current page
 */
function getActiveLi() {
    return document.querySelector('li.active');
}

/**
 * @returns `<article>` of current page
 */
function getActiveArticle(li = getActiveLi()) {
    return /** @type {HTMLElement | null} */ (li && li.firstElementChild);
}

/**
 * @returns `<div>` of current page
 */
function getActiveDiv(article = getActiveArticle()) {
    return /** @type {HTMLDivElement | null} */ (article && article.firstElementChild);
}

/**
 * @returns `<form>` of current page
 */
function getActiveForm(article = getActiveArticle()) {
    return /** @type {HTMLFormElement | null} */ (article && article.lastElementChild);
}

/**
 * @param {HTMLElement | null} parent
 * @returns {HTMLElement | null} last focused element
 */
function getActiveElement(parent = getActiveLi()) {
    return parent && parent.querySelector('.active[contenteditable]');
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

/**
 * CONSTRUCTORS
 */

function stripTagsOnPaste(e) {
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
}

/**
* @param {Object} params
* @param {EditableTags} params.tag
* @param {string} [params.text]
* @param {HTMLElement | null} [params.parent]
* @param {boolean} [params.fromStart]
* @param {boolean} [useDefaults] - If `true` creates an element with default text if `text` is empty
* @returns {(HTMLElementTagNameMap[Lowercase<EditableTags>] & ElementContentEditable) | null} Created element
*/
function createEditableElement({ tag, text, parent, fromStart }, useDefaults = true) {
    if (![...HEADER_TAGS, ...ITEMS_TAGS].includes(tag) || (!useDefaults && !text)) {
        return null;
    }

    const elem = document.createElement(tag);

    elem.contentEditable = 'false';
    elem.innerText = text ? text : m(tag);
    if (parent) {
        if (fromStart) {
            parent.prepend(elem);
        } else {
            parent.appendChild(elem);
        }
    }
    elem.tabIndex = 0;
    elem.addEventListener('paste', stripTagsOnPaste);

    return elem;
}

/**
 * @type {HTMLHeadingElement | HTMLDivElement | null}
 */
let dragged = null;
let draggedOver;
let draggedSame;
let draggedTarget;
const savedCopy = window.localStorage.getItem('price');

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
function createService(draggable, serviceJson = DEFAULTS.SERVICE) {
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

    return div;
}
/**
 * @param {boolean} draggable
 * @param {Category} [categoryJson]
 * @returns {HTMLElement}
 */
function createCategory(draggable, categoryJson = DEFAULTS.CATEGORY) {
    const category = /** @type {HTMLHeadingElement} */ (createEditableElement({
        tag: 'H2',
        text: 'H2' in categoryJson ? categoryJson.H2 : m('H2'),
    }, false));

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
function parsePage(page, parseImages) {
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
function parsePages(parseImages) {
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
function BindListener(element, callback, eventType = 'change') {
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
function handleArticleStylePropChange(e) {
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
function handleFormStylePropChange(e) {
    const activeForm = getActiveForm();
    const control = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);

    if (activeForm) {
        activeForm.style[control.name] = control.value;
    }
}

/**
 * VARS
 * */

let sortingPollyfilled = false;
let fontsAdded = false;
const mount = getMount();
const itemsActionsMap = {
    category: createCategory,
    service: createService
};

/**
 * FLOAT
 * */

// Alignment
const titleAlignment = /** @type {HTMLFieldSetElement | null} */ (document.getElementById('titleAlignment'));

/**
 * If the active element is an H1 and it's alone or with footer, then show the title
 * alignment element
 * @param [element] - The element to reposition the title alignment for.
 */
function repositionTitleAlignment(element = getActiveElement()) {
    if (titleAlignment) {
        if (
            element &&
            element.tagName === 'H1' &&
            (!element.nextElementSibling || element.nextElementSibling.tagName === 'FOOTER')
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
const deleteBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('delete'));

// Swap
const moveLeft = BindListener('moveLeft', function movePageLeft() {
    const activePage = getActiveLi();
    const leftPage = (activePage && activePage.previousElementSibling);

    if (leftPage) {
        leftPage.insertAdjacentElement('beforebegin', activePage);
        activePage.scrollIntoView();
    }
}, 'click');
const moveRight = BindListener('moveRight', function movePageRight() {
    const activePage = getActiveLi();
    const rightPage = (activePage && activePage.nextElementSibling);

    if (rightPage) {
        rightPage.insertAdjacentElement('afterend', activePage);
        activePage.scrollIntoView();
    }
}, 'click');

// Background
const background = /** @type {HTMLFieldSetElement | null} */ (document.getElementById('background'));

/**
 * If the form is active, show the background and hide the left and right arrows if there's no according neighbours
 * @param [form] - The form to reposition the background for.
 */
function toggleBackground(form = getActiveForm()) {
    if (background) {
        if (form && form.isSameNode(document.activeElement)) {
            const activeLi = getActiveLi();

            if (activeLi && moveLeft && moveRight) {
                moveLeft.hidden = !activeLi.previousElementSibling;
                moveRight.hidden = !activeLi.nextElementSibling;
            }
            background.hidden = false;
        } else {
            background.hidden = true;
        }
    }
}

/**
 * SETTINGS
 * */

const sorting = /** @type {HTMLInputElement | null} */ (BindListener('sorting', function handleSortingChange() {
    const draggableElements = /** @type {NodeListOf<HTMLElement>} */ (
        document.querySelectorAll('#pages [draggable]')
    );
    const contentEditable = this.checked ? 'false' : 'true';
    const activeElement = getActiveElement();

    if (!sortingPollyfilled) {
        const script = document.createElement('script');

        script.src = (document.documentElement.lang === 'en' ? '.' : '..') + '/assets/js/vendors/DragDropTouch.js';
        script.async = false;
        document.body.appendChild(script);
        sortingPollyfilled = true;
    }
    for (const element of draggableElements) {
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

    // @ts-ignore
    if (deleteBtn && activeElement && ITEMS_TAGS.includes(activeElement.tagName)) {
        deleteBtn.hidden = true;
    }
}));

/**
 * It repositions the delete button to the bottom of the currently active element
 * @param [element] - The element to reposition the delete button for.
 */
function repositionDeleteBtn(element = getActiveElement()) {
    if (deleteBtn) {
        if (
            element &&
            (
                // @ts-ignore
                HEADER_TAGS.includes(element.tagName) ||
                // @ts-ignore
                (ITEMS_TAGS.includes(element.tagName) && sorting && !sorting.checked)
            )
        ) {
            const { left, height, top } = getOffset(element);

            deleteBtn.hidden = false;
            deleteBtn.style.transform = `translate(${left + Math.min(
                0,
                window.innerWidth - left - deleteBtn.clientWidth - 6
            )}px, ${top + height + Math.min(
                0,
                window.innerHeight - top - height - deleteBtn.clientHeight - 6
            )}px)`;
            // console.log();
        } else {
            deleteBtn.hidden = true;
        }
    }
}
function truncate(str) {
    if (!str.trim()) {
        return '';
    }
    return '"' + (str.length > 10 ? str.substring(0, 10) + '...' : str) + '"';
}
BindListener(deleteBtn, function handleDeleteClick() {
    const activeElement = getActiveElement();

    if (activeElement && window.confirm(
        `${m('REMOVE_ELEMENT')}${truncate(activeElement.innerText)}?`)
    ) {
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

// Background opacity
const opacityRange = BindListener('opacity', function handleOpacityRangeChange() {
    const activeDiv = getActiveDiv();

    if (activeDiv) {
        activeDiv.style[this.name] = (1 - parseFloat(this.value)).toString();
    }
}, 'input');

// Background image
const backgroundImageInput = BindListener('backgroundImage', function handleBackgroundImageChange() {
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

BindListener('deleteBackgroundImage', function handleDeleteBackgroundImageClick() {
    const activeArticle = getActiveArticle();

    if (activeArticle) {
        activeArticle.style.backgroundImage = '';
    }
    if (backgroundImageInput) {
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
const fontFamilySelect = /** @type {HTMLSelectElement | null} */ (BindListener(
    'fontFamily',
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
));

// Aspect ratio
const aspectRatioSelect = BindListener('aspectRatio', function handleAspectRatioChange() {
    if (mount) {
        mount.dataset.aspectRatio = this.value;
        if (deleteBtn) { deleteBtn.hidden = true; }
        if (titleAlignment) { titleAlignment.hidden = true; }
    }
});

// Colors
const colorInput = BindListener('color', handleArticleStylePropChange);
const backgroundColorInput = BindListener('backgroundColor', function handleDivStylePropChange() {
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

const observer = new IntersectionObserver(function handleIntersect(entries) {
    for (const entry of entries) {
        const page = /** @type {HTMLLIElement} */ (entry.target);

        if (entry.isIntersecting) {
            page.classList.add('active');

            const focusedElement = page.querySelector(':focus');
            const activeArticle = getActiveArticle(page);
            const activeDiv = getActiveDiv(activeArticle);
            const activeForm = getActiveForm(activeArticle);
            const convertRGBtoHex = (rgb) => {
                const colorToHex = (color) => parseInt(color, 10).toString(16).padStart(2, '0');
                const colors = rgb.slice(4, -1).split(', ');

                return '#' + colorToHex(colors[0]) + colorToHex(colors[1]) + colorToHex(colors[2]);
            };

            if (focusedElement) {
                focusedElement.classList.add('active');
            }
            assignValueFromStyle(textAlignSelect, activeForm);
            assignValueFromStyle(justifyContentSelect, activeForm);
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
            toggleBackground();
            repositionDeleteBtn();
            repositionTitleAlignment();
        } else {
            const activeElement = getActiveElement(page);

            if (activeElement) {
                activeElement.classList.remove('active');
            }

            page.classList.remove('active');
            [deleteBtn, titleAlignment, background].forEach(function hideControl(control) {
                if (control) {
                    control.hidden = true;
                }
            });
        }
    }
}, {
    root: mount,
    threshold: 1,
});

BindListener('export', function handleExportClick() {
    const exportJson = new Blob(["\ufeff", parsePages(true)], { type: 'text/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(exportJson);
    link.download = 'price.json';
    link.click();
    link.remove();
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

BindListener('save', async function handleSaveClick(e) {
    const saveBtn = /** @type {HTMLButtonElement} */ (e.currentTarget);

    if (saveBtn) { saveBtn.disabled = true; }

    await import('./vendors/html2canvas.min.js');

    const pages = document.getElementsByTagName('article');
    /** @type {HtmlToCanvasOptions} */
    const options = { backgroundColor: '#000', scale: 1, windowWidth: 1080, windowHeight: 1920 };

    if (sorting) { sorting.checked = false; }
    if (navigator.share === undefined || !navigator.canShare || !checkBasicFileShare()) {
        const link = document.createElement('a');
        const canvases = /** @type {string[]} */ ([]);

        for (const page of pages) {
            await html2canvas(page, options).then(function resolveCanvas(canvas) {
                canvases.push(canvas.toDataURL());
            });
        }

        setTimeout(async function downloadImages() {
            for (let i = 0; i < canvases.length; i++) {
                link.href = canvases[i];
                link.download = (i + 1) + '.png';
                link.click();
            }
            link.remove();
            saveBtn.disabled = false;
        }, 1000);
    } else {
        const files = /** @type {File[]} */ ([]);

        for (const page of pages) {
            await html2canvas(page, options).then(function resolveCanvas(/** @type {HTMLCanvasElement} */ canvas) {
                canvas.toBlob(function blobToFile(blob) {
                    if (blob) {
                        files.push(new File([blob], (files.length + 1) + '.png'));
                    }
                });
            });
        }

        setTimeout(async function shareImages() {
            await navigator.share({ files }).catch(function handleError(error) {
                window.console.log(error.name + ': ' + error.message);
            }).finally(function resetStyle() {
                saveBtn.disabled = false;
            });
        }, 1000);
    }
}, 'click');

// Delete page
BindListener('deletePage', function handleDeletePageClick() {
    const activePage = getActiveLi();

    if (activePage && window.confirm(m('REMOVE_PAGE'))) {
        observer.unobserve(activePage);
        activePage.remove();
    }
}, 'click');

/**
 * IMPORT
 */

/**
 * Assigns the style properties of the given props to the given elements
 * @param {object} elements
 * @param {HTMLFormElement} elements.form
 * @param {HTMLDivElement} elements.div
 * @param {HTMLElement} elements.article
 * @param [props] - An object containing the style properties to be applied.
 */
function attachStyleFromJson({ form, div, article }, props = {}) {
    const {
        backgroundColor,
        backgroundImage,
        color,
        fontFamily,
        justifyContent,
        opacity,
        textAlign,
    } = props;
    const assignFilteredStyle = function (element, object) {
        Object.assign(element.style, Object.fromEntries(Object.entries(object).filter(function filterEmpty([, value]) {
            return value;
        })));
    };

    assignFilteredStyle(form, { justifyContent, textAlign });
    assignFilteredStyle(div, { backgroundColor, opacity });
    assignFilteredStyle(article, { backgroundImage, color, fontFamily });
}

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

    attachStyleFromJson({ form, div, article }, pageJson.STYLE);
    createEditableElement({
        tag: 'H1',
        text: pageJson.H1,
        parent: form
    }, false);
    if (pageJson.ITEMS !== undefined && typeof pageJson.ITEMS !== 'string') {
        pageJson.ITEMS.forEach(function appendItem(item) {
            const type = item.type.toLowerCase();

            if (type in itemsActionsMap) {
                form.appendChild(itemsActionsMap[type](draggable, item));
            }
        });
    }
    createEditableElement({
        tag: 'FOOTER',
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
function renderPages(pagesJson, mount = getMount()) {
    if (mount) {
        const pages = [];
        const aspectRatio = (pagesJson.STYLE && pagesJson.STYLE.aspectRatio) ?
            pagesJson.STYLE.aspectRatio :
            DEFAULTS.aspectRatio;

        mount.dataset.aspectRatio = aspectRatio;
        if (aspectRatioSelect) {
            aspectRatioSelect.value = aspectRatio;
        }
        if (pagesJson.PAGES) {
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

if (savedCopy && savedCopy !== m('PAGES') && window.confirm(m('LOAD_CONFIRM'))) {
    renderPages(JSON.parse(savedCopy));
} else {
    renderPages(DEFAULTS.get());
    window.localStorage.removeItem('price');
}

// Import
const importInput = BindListener('import', function handleImportClick(e) {
    if (!window.confirm(m('IMPORT_CONFIRM'))) {
        e.preventDefault();
    }
}, 'click');

BindListener(importInput, function handleImportChange() {
    if (this.files) {
        const fileReader = new FileReader();

        fileReader.onload = function handleFileLoad(e) {
            if (e.target && typeof e.target.result === 'string') {
                renderPages(JSON.parse(e.target.result));
            } else {
                window.alert(m('FILE_LOAD_ERROR'));
            }
        };
        fileReader.readAsText(this.files[0], 'UTF-8');
    }
});

/**
 * ADD
 * */

BindListener('duplicate', function handleDuplicateClick() {
    const activeLi = getActiveLi();

    if (activeLi) {
        const activePage = getActiveArticle(activeLi);
        const activePageJson = activePage && parsePage(activePage);

        if (activePageJson && 'H1' in activePageJson) {
            activePageJson.H1 += ' copy';
        }

        const newPage = activePageJson ? createPage(activePageJson) : createPage();

        observer.observe(newPage);
        activeLi.insertAdjacentElement('afterend', newPage);
        newPage.scrollIntoView();
    }
}, 'click');

if (mount) {
    BindListener('page', function handleAddPageClick() {
        const newPage = createPage();

        mount.appendChild(newPage);
        newPage.scrollIntoView();
    }, 'click');
}

BindListener('title', function handleAddTitleClick() {
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

BindListener('footer', function handleAddFooterClick() {
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

Object.keys(itemsActionsMap).forEach(function bingClickToItem(itemId) {
    BindListener(itemId, function handleAddItemClick() {
        const form = getActiveForm();
        const item = itemsActionsMap[itemId](Boolean(sorting && sorting.checked));

        if (form && item) {
            const existingFooter = form.querySelector('footer');

            if (existingFooter) {
                form.insertBefore(item, existingFooter);
            } else {
                form.appendChild(item);
            }
        }
    }, 'click');
});

/**
 * GLOBAL LISTENERS
 */

const resizeObserver = new ResizeObserver(function handleResize() {
    toggleBackground();
    repositionDeleteBtn();
    repositionTitleAlignment();
});

resizeObserver.observe(document.body);

function getDraggable(element) {
    let parentElement = element;

    while (parentElement && !parentElement.draggable) {
        parentElement = parentElement.parentElement;
    }

    return parentElement;
}

if (mount) {
    mount.addEventListener("drop", function handleDivDrop(event) {
        event.preventDefault();

        const targetElement = /** @type {HTMLHeadingElement | null} */ (event.target);
        const draggable = getDraggable(targetElement);
        const text = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
        let range = document.caretRangeFromPoint && document.caretRangeFromPoint(event.clientX, event.clientY);

        // @ts-ignore
        if (!range && event.rangeParent) {
            range = document.createRange();
            // @ts-ignore
            range.setStart(event.rangeParent, event.rangeOffset);
            // @ts-ignore
            range.setEnd(event.rangeParent, event.rangeOffset);
        }

        if (range) { range.insertNode(document.createTextNode(text)); }

        if (draggable) {
            draggable.classList.remove("drag-over");
            if (dragged && !dragged.isSameNode(draggable) && !draggable.isSameNode(dragged.nextElementSibling)) {
                draggable.insertAdjacentElement('beforebegin', dragged);
            }
        }
    });
    mount.addEventListener('focusin', function handleFormFocusIn(e) {
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
            editableElements.forEach(function disableContentEditable(element) {
                element.contentEditable = 'true';
            });
            if (background) { background.hidden = true; }
        }
        // @ts-ignore
        if (ITEMS_TAGS.includes(focusedElement.tagName) && sorting && sorting.checked) {
            if (deleteBtn) {
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
    mount.addEventListener('focusout', function handleFormInput(e) {
        const focusedElement = /** @type {HTMLElement} */ (e.target);
        const form = /** @type {HTMLFormElement} */ (focusedElement.closest('form'));
        const editableElements = /** @type {NodeListOf<HTMLElement>} */ (form.querySelectorAll('[contenteditable]'));

        if (focusedElement.hasAttribute('contenteditable')) {
            editableElements.forEach(function disableContentEditable(element) {
                element.contentEditable = 'false';
            });
        }
    });
}

document.body.addEventListener('click', function handleClick(e) {
    const clickedElement = /** @type {HTMLElement} */ (e.target);
    const closestFieldset = clickedElement.closest('fieldset');
    const add = document.getElementById('add');
    const isBackgroundControls = closestFieldset && !clickedElement.isSameNode(closestFieldset) && closestFieldset.id === 'background';

    if (!clickedElement.hasAttribute('contenteditable') && !['delete', 'titleAlignment', 'textAlign', 'justifyContent'].includes(clickedElement.id)) {
        if (deleteBtn) {
            deleteBtn.hidden = true;
        }
        if (titleAlignment) {
            titleAlignment.hidden = true;
        }
    }

    if (
        background &&
        clickedElement.tagName !== 'FORM' &&
        !isBackgroundControls &&
        !(clickedElement.isSameNode(this) && document.activeElement && document.activeElement.tagName === 'FORM')
    ) {
        background.hidden = true;
    }

    if (add && clickedElement.id !== 'addSummary') {
        add.removeAttribute('open');
    }

    if (clickedElement.id) {
        ym(89949856,'reachGoal', clickedElement.id);
    }
});

document.body.addEventListener('keyup', function sortWithArrows(e) {
    const targetElement = /** @type {HTMLElement | null} */ (e.target);
    const element = targetElement &&
        (['H3', 'P', 'SPAN'].includes(targetElement.tagName) ? targetElement.parentElement : targetElement);

    if (element && element.draggable) {
        switch (e.key) {
            case 'ArrowUp':
                const previousElement = /** @type {HTMLElement | null} */ (element.previousElementSibling);

                if (previousElement && previousElement.draggable) {
                    previousElement.insertAdjacentElement("beforebegin", element);
                    e.preventDefault();
                }

                break;
            case 'ArrowDown':
                const nextElement = /** @type {HTMLElement | null} */ (element.nextElementSibling);

                if (nextElement && nextElement.draggable) {
                    nextElement.insertAdjacentElement("afterend", element);
                    e.preventDefault();
                }

                break;
        }
    }
});

window.addEventListener('change', function savePages() {
    window.localStorage.setItem('price', parsePages());
});