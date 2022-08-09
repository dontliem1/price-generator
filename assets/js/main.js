'use strict';

import { DEFAULTS, EDITABLE_TAGS, HEADER_TAGS, ITEMS_TAGS } from './constants.js';
import {
    BindListener,
    createCategory,
    createEditableElement,
    createService,
    getActiveArticle,
    getActiveDiv,
    getActiveElement,
    getActiveForm,
    getActiveLi,
    getMount,
    getOffset,
    handleArticleStylePropChange,
    handleFormStylePropChange,
    parsePage,
    parsePages
} from './utils.js';

/**
 * VARS
 * */

let sortingPollyfilled = false;
let fontsAdded = false;
const mount = getMount();

/**
 * FLOAT
 * */

// Alignment
const titleAlignment = /** @type {HTMLFieldSetElement | null} */ (document.getElementById('titleAlignment'));

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

function repositionBackground(form = getActiveForm()) {
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

        script.src = 'assets/js/DragDropTouch.js';
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
            )}px, ${top + height}px)`;
        } else {
            deleteBtn.hidden = true;
        }
    }
}

BindListener(deleteBtn, function handleDeleteClick() {
    const activeElement = getActiveElement();

    if (activeElement && window.confirm(
        `Remove element${activeElement.innerText.trim() ? (' "' + activeElement.innerText + '"') : ''}?`)
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

function handleTitleAlignmentChange(e) {
    handleFormStylePropChange(e);
    repositionTitleAlignment();
    repositionDeleteBtn();
}

// Title justify
const textAlignSelect = /** @type {HTMLSelectElement | null} */ (BindListener(
    'textAlign',
    handleTitleAlignmentChange
));

// Title vertical alignment
const justifyContentSelect = /** @type {HTMLSelectElement | null} */ (BindListener(
    'justifyContent',
    handleTitleAlignmentChange
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
            repositionBackground();
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
    const exportJson = new Blob(["\ufeff", parsePages()], { type: 'text/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(exportJson);
    link.download = 'price.json';
    link.click();
    link.remove();
}, 'click');

function checkBasicFileShare() {
    const txt = new Blob(['Hello, world!'], { type: 'text/plain' });
    const file = new File([txt], 'test.txt');

    return navigator.canShare({ files: [file] });
}

BindListener('save', async function handleSaveClick(e) {
    const saveBtn = /** @type {HTMLButtonElement} */ (e.currentTarget);

    if (saveBtn) { saveBtn.disabled = true; }

    await import('./html2canvas.min.js');

    const pages = document.getElementsByTagName('article');
    /** @type {HtmlToCanvasOptions} */
    const options = { backgroundColor: '#000', scale: 1, windowWidth: 1080, windowHeight: 1920 };

    if (sorting) { sorting.checked = false; }
    if (navigator.share === undefined || !navigator.canShare || !checkBasicFileShare()) {
        const link = document.createElement('a');
        const canvases = /** @type {string[]} */ ([]);

        document.body.appendChild(link);
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
        const form = /** @type {HTMLFormElement} */ (e.currentTarget);
        const focusedElement = /** @type {HTMLElement} */ (e.target);
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
            repositionBackground(form);
        }
    });
    form.addEventListener('focusout', function handleFormInput(e) {
        const focusedElement = /** @type {HTMLElement} */ (e.target);
        const form = /** @type {HTMLFormElement} */ (e.currentTarget);
        const editableElements = /** @type {NodeListOf<HTMLElement>} */ (form.querySelectorAll('[contenteditable]'));

        if (focusedElement.hasAttribute('contenteditable')) {
            editableElements.forEach(function disableContentEditable(element) {
                element.contentEditable = 'false';
            });
        }
    });
}

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
    observer.observe(li);
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

// Import
const importInput = BindListener('import', function handleImportClick(e) {
    if (!window.confirm('This will replace the current price. Continue?')) {
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
                window.alert("Couldn't load the file");
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

const itemsActionsMap = {
    category: createCategory,
    service: createService
};

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

renderPages(DEFAULTS.get());

/**
 * GLOBAL LISTENERS
 */

const resizeObserver = new ResizeObserver(function handleResize() {
    repositionBackground();
    repositionDeleteBtn();
    repositionTitleAlignment();
});

if (mount) { resizeObserver.observe(document.body); }

document.body.addEventListener('click', function handleClick(e) {
    const clickedElement = /** @type {HTMLElement | null} */ (e.target);
    const closestFieldset = clickedElement && clickedElement.closest('fieldset');
    const add = document.getElementById('add');
    const isBackgroundControls = closestFieldset && clickedElement !== closestFieldset && closestFieldset.id === 'background';

    if (clickedElement) {
        const activeElement = document.activeElement;
        // @ts-ignore
        if (!EDITABLE_TAGS.includes(clickedElement.tagName)) {
            [deleteBtn, titleAlignment].forEach(function hideDifferentControl(control) {
                if (!clickedElement.isSameNode(control) && control) {
                    control.hidden = true;
                }
            });
        }

        if (
            background &&
            clickedElement.tagName !== 'FORM' &&
            !isBackgroundControls &&
            !(clickedElement.isSameNode(this) && activeElement && activeElement.tagName === 'FORM')
        ) {
            background.hidden = true;
        }

        if (add && clickedElement.id !== 'addSummary') {
            add.removeAttribute('open');
        }
    }
});

document.body.addEventListener('keyup', function sortWithArrows(e) {
    const targetElement = /** @type {HTMLElement | null} */ (e.target);
    const element = targetElement &&
        (['H3', 'P', 'SPAN'].includes(targetElement.tagName) ? targetElement.parentElement : targetElement);

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

function savePages() {
    window.localStorage.setItem('price', parsePages());
}

window.addEventListener('beforeunload', savePages);
window.addEventListener('change', savePages);
window.addEventListener('load', function proposeLoad() {
    const savedCopy = this.localStorage.getItem('price');

    if (
        savedCopy &&
        savedCopy !== DEFAULTS.hash &&
        this.confirm('There is a saved local copy of last price made. Do you want to load it?')
    ) {
        renderPages(JSON.parse(savedCopy));
    } else {
        this.localStorage.clear();
    }
});
