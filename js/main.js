'use strict';

import { DEFAULTS } from './constants.js';

/** @typedef {{tag: string; text?: string; parent?: HTMLElement; fromStart?: boolean}} editableElementParams */
/**
 * @param {editableElementParams} params
 * @returns {HTMLElement} Created element
 */
function createEditableElement({ tag, text, parent, fromStart }) {
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

function handleFormInput(e) {
    const element = /** @type {HTMLElement} */ (e.target);
    if (!element.textContent) {
        element.innerHTML = ' ';
    }
    // If overflow
    // const page = e.currentTarget.parentElement;
    // if (page && (page.scrollHeight - page.clientHeight > 16)) {
    //     window.alert(page.scrollHeight + ' ' + page.clientHeight);
    // }
}

function createService(serviceJson = DEFAULTS.LI) {
    const li = document.createElement('li');

    for (const liTag in serviceJson) {
        createEditableElement({
            tag: liTag,
            text: serviceJson[liTag],
            parent: li
        });
    }

    return li;
}

function createSection(sectionJson = DEFAULTS.SECTION) {
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
        createEditableElement({
            tag: sectionTag,
            text: sectionJson[sectionTag],
            parent: section
        });
    }

    return section;
}

/**
 * @returns {HTMLLIElement | null} `<li>` of current page
 */
function getActiveLi() {
    return document.querySelector('li.active');
}

/**
 * @returns {HTMLElement | null} `<article>` of current page
 */
function getActiveArticle() {
    return document.querySelector('li.active > article');
}

/**
 * @returns {HTMLFormElement | null} `<form>` of current page
 */
function getActiveForm() {
    return document.querySelector('li.active form');
}

/**
 * @returns {HTMLDivElement | null} `<div>` of current page
 */
function getActiveDiv() {
    return document.querySelector('li.active div');
}

/**
 * @returns {HTMLElement | null} last focused element
 */
function getActiveElement(form = getActiveForm()) {
    return form ? form.querySelector('.active[contenteditable]') : null;
}

const mount = document.getElementById('pages');

function handleArticleStylePropChange(e) {
    const activeArticle = getActiveArticle();

    if (activeArticle) {
        activeArticle.style[e.target.name] = e.target.value;
    }
}

function handleFormStylePropChange(e) {
    const activeForm = getActiveForm();

    if (activeForm) {
        activeForm.style[e.target.name] = e.target.value;
    }
}

/**
 * @param {HTMLElement} el
 */
function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + rect.height + window.scrollY,
    };
}

// Remove element
const deleteBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('delete'));

function repositionDeleteBtn(element = getActiveElement()) {
    if (deleteBtn) {
        if (element) {
            const { left, top } = getOffset(element);

            deleteBtn.style.left = left + 'px';
            deleteBtn.style.top = top + 'px';
            deleteBtn.hidden = false;
        } else {
            deleteBtn.hidden = true;
        }
    }
}

// Alignment
const titleAlignment = /** @type {HTMLFieldSetElement | null} */ (document.getElementById('titleAlignment'));

function repositionTitleAlignment(element = getActiveElement()) {
    if (titleAlignment) {
        if (element && element.tagName === 'H1') {
            const { left, top } = getOffset(element);

            titleAlignment.style.left = left + (deleteBtn ? (deleteBtn.clientWidth + 5) : 0) + 'px';
            titleAlignment.style.top = top + 'px';
            titleAlignment.hidden = false;
        } else {
            titleAlignment.hidden = true;
        }
    }
}

if (deleteBtn) {
    deleteBtn.addEventListener('click', function handleDeleteClick() {
        const activeElement = getActiveElement();

        if (activeElement && window.confirm(`Remove element${activeElement.innerText.trim() ? (' "' + activeElement.innerText + '"') : ''}?`)) {
            const section = activeElement.closest('section');
            const li = activeElement.closest('li');

            activeElement.remove();
            if (section && !section.innerText.trim()) {
                section.remove();
            }
            if (li && !li.innerText.trim() && !li.classList.contains('active')) {
                li.remove();
            }
            repositionDeleteBtn();
            if (activeElement.tagName === 'H1') { repositionTitleAlignment(); }
        }
    });
}

/**
 * @param {FocusEvent} e
 */
function handleFormFocusIn(e) {
    const form = /** @type {HTMLFormElement} */ (e.currentTarget);
    const editableElements = /** @type {NodeListOf<HTMLElement>} */ (form.querySelectorAll('[contenteditable]'));

    for (const editableElement of editableElements) {
        editableElement.classList.toggle('active', editableElement === e.target);
        if (editableElement === e.target) {
            repositionDeleteBtn(editableElement);
            if (editableElement.tagName === 'H1') {
                repositionTitleAlignment(editableElement);
            }
        }
    }
}

// Background blur
const backdropFilterInput = /** @type {HTMLInputElement | null} */ (document.querySelector('[name="backdropFilter"]'));

if (backdropFilterInput) {
    backdropFilterInput.addEventListener('input', function handleBackdropFilterInput(e) {
        const input = /** @type {HTMLInputElement | null} */ (e.target);
        const activeForm = getActiveForm();

        if (input && activeForm) {
            const value = `blur(${input.value}px)`;

            activeForm.style[input.name] = activeForm.style['-webkit-backdrop-filter'] = value;
        }
    });
}

// Background opacity
const opacityRange = /** @type {HTMLInputElement | null} */ (document.querySelector('[name="opacity"]'));

if (opacityRange) {
    opacityRange.addEventListener('input', function handleOpacityRangeChange(e) {
        const activeDiv = getActiveDiv();
        const input = /** @type {HTMLInputElement | null} */ (e.target);

        if (input && activeDiv) {
            activeDiv.style[input.name] = (1 - parseFloat(input.value)).toString();
        }
    });
}

// Background image
const backgroundImageInput = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="backgroundImage"]'));

if (backgroundImageInput) {
    backgroundImageInput.addEventListener('change', function handleBackgroundImageChange(e) {
        const input = /** @type {HTMLInputElement} */ (e.target);
        const activeArticle = getActiveArticle();

        if (input && input.files && activeArticle) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onloadend = function () {
                activeArticle.style.backgroundImage = 'url("' + reader.result + '")';
            };
            reader.readAsDataURL(file);
        }
    });
}

const deleteBackgroundImage = document.getElementById('deleteBackgroundImage');

if (deleteBackgroundImage) {
    deleteBackgroundImage.addEventListener('click', function handleDeleteBackgroundImageClick() {
        if (deleteBackgroundImage) {
            const activeArticle = getActiveArticle();

            if (activeArticle) {
                activeArticle.style.backgroundImage = '';
            }
        }
    });
}

// Title justify
const textAlignSelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="textAlign"]'));

if (textAlignSelect) {
    textAlignSelect.addEventListener('change', function handleTextAlignSelectChange(e) {
        handleFormStylePropChange(e);
        repositionTitleAlignment();
        repositionDeleteBtn();
    });
}

// Title vertical alignment
const justifyContentSelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="justifyContent"]'));

if (justifyContentSelect) {
    justifyContentSelect.addEventListener('change', function handleJustifyContentSelectChange(e) {
        handleFormStylePropChange(e);
        repositionTitleAlignment();
        repositionDeleteBtn();
    });
}

// Font
const fontFamilySelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="fontFamily"]'));

if (fontFamilySelect) {
    let fontsAdded = false;
    fontFamilySelect.addEventListener('change', function handleFontChange(e) {
        if (!fontsAdded) {
            const link = document.createElement('link');

            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Alegreya&family=Alice&family=Bitter&family=Cormorant&family=EB+Garamond&family=IBM+Plex+Serif&family=Literata:opsz@7..72&family=Lora&family=Merriweather&family=Old+Standard+TT&family=PT+Serif&family=PT+Serif+Caption&family=Piazzolla:opsz@8..30&family=Playfair+Display&family=Prata&family=Source+Serif+Pro&family=Spectral&family=Alegreya+Sans&family=Arsenal&family=Commissioner&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inter&family=JetBrains+Mono&family=Montserrat&family=PT+Mono&family=PT+Sans&family=Raleway&family=Roboto&family=Roboto+Condensed&family=Roboto+Mono&family=Rubik&family=Yanone+Kaffeesatz&family=Caveat&family=Lobster&family=Pacifico&family=Pangolin&family=Podkova&family=Press+Start+2P&family=Ruslan+Display&family=Russo+One&family=Underdog&family=Yeseva+One&display=swap';
            document.head.appendChild(link);
            fontsAdded = true;
        }
        handleArticleStylePropChange(e);
    });
}

// Aspect ratio
const aspectRatioSelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="aspectRatio"]'));

if (aspectRatioSelect) {
    aspectRatioSelect.addEventListener('change', handleArticleStylePropChange);
}

// Colors
const colorInput = /** @type {HTMLInputElement | null} */ (document.querySelector('[name="color"]'));

if (colorInput) {
    colorInput.addEventListener('change', handleArticleStylePropChange);
}

const backgroundColorInput = /** @type {HTMLInputElement | null} */ (document.querySelector('[name="backgroundColor"]'));

if (backgroundColorInput) {
    backgroundColorInput.addEventListener('change', function handleDivStylePropChange(e) {
        const activeDiv = getActiveDiv();
        const input = /** @type {HTMLInputElement | null} */ (e.target);

        if (activeDiv && input) {
            activeDiv.style[input.name] = input.value;
        }
    });
}

/**
 * @param {string} color octet
 */
function ColorToHex(color) {
    const hexadecimal = parseInt(color, 10).toString(16);

    return hexadecimal.length === 1 ? '0' + hexadecimal : hexadecimal;
}

/**
 * @param {string} rgb e.g. `rgb(255, 255, 255)`
 */
function ConvertRGBtoHex(rgb) {
    const colors = rgb.slice(4, -1).split(', ');

    return '#' + ColorToHex(colors[0]) + ColorToHex(colors[1]) + ColorToHex(colors[2]);
}

/**
 * @param {HTMLSelectElement} select to pass the value
 * @param {HTMLElement} from take a style value
 * @returns {void}
 */
function assignValueFromStyle(select, from) {
    if (from.style[select.name]) {
        select.value = from.style[select.name];
    } else {
        select.selectedIndex = 0;
    }
}

// Page creation
const observer = new IntersectionObserver(function onIntersect(entries) {
    entries.forEach(function handleEntryIntersection(entry) {
        entry.target.classList.toggle('active', entry.isIntersecting);
        if (!entry.isIntersecting) {
            const form = /** @type {HTMLFormElement} */ (entry.target);
            const activeElement = getActiveElement(form);

            if (activeElement) { activeElement.classList.remove('active'); }
            return;
        }
        const activeArticle = getActiveArticle();
        const activeDiv = getActiveDiv();
        const activeForm = getActiveForm();

        if (activeForm) {
            if (textAlignSelect) { assignValueFromStyle(textAlignSelect, activeForm); }
            if (justifyContentSelect) { assignValueFromStyle(justifyContentSelect, activeForm); }
            if (backdropFilterInput) { backdropFilterInput.value = activeForm.style[backdropFilterInput.name] ? activeForm.style[backdropFilterInput.name].slice(5, -3) : '0'; }
        }
        if (activeArticle) {
            if (fontFamilySelect) { assignValueFromStyle(fontFamilySelect, activeArticle); }
            if (aspectRatioSelect) { assignValueFromStyle(aspectRatioSelect, activeArticle); }
        }
        if (activeDiv) {
            if (opacityRange) { opacityRange.value = (1 - parseFloat(activeDiv.style.opacity)).toString(); }
            if (backgroundColorInput) { backgroundColorInput.value = ConvertRGBtoHex(activeDiv.style.backgroundColor); }
        }
        if (activeArticle && colorInput) {
            colorInput.value = ConvertRGBtoHex(activeArticle.style.color);
        }

        repositionDeleteBtn();
        repositionTitleAlignment();
    });
}, {
    root: mount,
    threshold: 0.6,
});

function createPage(pageJson, isActive = true) {
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
        createEditableElement({
            tag,
            text: pageJson[tag],
            parent: form
        });
    }
    li.appendChild(article);
    observer.observe(li);

    return li;
}

// Import
/**
 * @param {Record<string, any>[]} pagesJson
 * @param {HTMLElement} mount
 */
function renderPages(pagesJson, mount) {
    const pages = [];

    pagesJson.forEach(function createPages(page, index) {
        pages.push(createPage(page, index === 0));
    });
    mount.append(...pages);
}

if (mount) {
    renderPages([DEFAULTS.FIRST_PAGE, DEFAULTS.SECOND_PAGE], mount);
}

const importInput = document.getElementById('import');

if (importInput && mount) {
    importInput.addEventListener('click', function handleImportClick(e) {
        if (!window.confirm('This will replace the current price. Continue?')) {
            e.preventDefault();
        }
    });

    importInput.addEventListener('change', function handleImportChange(e) {
        const input = /** @type {HTMLInputElement} */ (e.target);

        if (input.files) {
            const fileReader = new FileReader();

            fileReader.onload = function handleFileLoad(e) {
                if (e.target && typeof e.target.result === 'string') {
                    mount.innerHTML = '';
                    renderPages(JSON.parse(e.target.result), mount);
                } else {
                    window.alert("Couldn't load the file");
                }
            };
            fileReader.readAsText(input.files[0], 'UTF-8');
        }
    });
}

// Delete page
const deletePageBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('deletePage'));

if (deletePageBtn) {
    deletePageBtn.addEventListener('click', function handleDeletePageClick() {
        const activePage = getActiveLi();

        if (activePage && window.confirm('Remove current page?')) {
            activePage.remove();
        }
    });
}

// Add btns
const addBtns = document.querySelectorAll('.add .btn');

for (const addBtn of addBtns) {
    addBtn.addEventListener('click', function handleAddBtnClick(e) {
        const btn = /** @type {HTMLButtonElement | null} */ (e.target);

        if (btn && btn.parentElement) {
            btn.parentElement.removeAttribute('open');
        }
    });
}

// Add page
const pageBtn = document.getElementById('page');

if (pageBtn && mount) {
    pageBtn.addEventListener('click', function handleAddPageClick() {
        const newPage = createPage();

        mount.appendChild(newPage);
        newPage.scrollIntoView();
    },
    );
}

// Duplicate page
const duplicateBtn = document.getElementById('duplicate');

if (duplicateBtn) {
    duplicateBtn.addEventListener('click', function handleAddPageClick() {
        const pages = document.getElementById('pages');
        if (pages) {
            let newPage;
            const activePage = getActiveLi();

            if (activePage) {
                newPage = /** @type {HTMLLIElement} */ (activePage.cloneNode(true));

                let newPageTitle = newPage.querySelector('h1');

                if (newPageTitle) {
                    newPageTitle.innerText += ' copy';
                }

                let newPageForm = newPage.querySelector('form');
                if (newPageForm) {
                    newPageForm.addEventListener('focusin', handleFormFocusIn);
                    newPageForm.addEventListener('input', handleFormInput);
                }
            } else {
                newPage = createPage();
            }

            pages.appendChild(newPage);
            observer.observe(newPage);
            newPage.scrollIntoView();
        }
    });
}

// Add title
const titleBtn = document.getElementById('title');

if (titleBtn) {
    titleBtn.addEventListener('click', function handleAddTitleClick() {
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
    });
}

// Add footer
const subtitleBtn = document.getElementById('subtitle');

if (subtitleBtn) {
    subtitleBtn.addEventListener('click', function handleAddSubtitleClick() {
        const form = getActiveForm();
        if (form) {
            const existingSubtitle = form.querySelector('footer');

            if (existingSubtitle) {
                existingSubtitle.focus();
            } else {
                createEditableElement({
                    tag: 'FOOTER',
                    parent: form
                });
            }
        }
    });
}

// Add group
const groupBtn = document.getElementById('group');

if (groupBtn) {
    groupBtn.addEventListener('click', function handleAddGroupClick() {
        const form = getActiveForm();

        if (form) {
            const existingSubtitle = form.querySelector('footer');
            const group = createSection();

            if (existingSubtitle) {
                form.insertBefore(group, existingSubtitle);
            } else {
                form.appendChild(group);
            }
        }
    });
}

// Add service
const serviceBtn = document.getElementById('service');

if (serviceBtn) {
    serviceBtn.addEventListener('click', function handleAddServiceClick() {
        const form = getActiveForm();

        if (form) {
            const li = createService();
            const activeElement = getActiveElement();
            if (activeElement) {
                const closestSection = activeElement.closest('section');

                if (closestSection) {
                    const sectionsUl = closestSection.querySelector('ul');

                    if (sectionsUl) {
                        sectionsUl.append(li);
                    } else {
                        const ul = document.createElement('ul');

                        ul.appendChild(li);
                        closestSection.appendChild(ul);
                    }

                    return;
                }
            }

            const existingGroups = form.querySelectorAll('ul');

            if (existingGroups.length > 0) {
                existingGroups[existingGroups.length - 1].appendChild(li);
            } else {
                const section = document.createElement('section');
                const ul = document.createElement('ul');

                ul.appendChild(li);
                section.appendChild(ul);
                form.appendChild(section);
            }
        }
    });
}