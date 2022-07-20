"use strict";

import { createPage, getActiveArticle, getActiveDiv, getActiveElement, getActiveForm } from "./utils.js";
import { DEFAULTS } from "./constants.js";

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

function handleDivStylePropChange(e) {
    const activeDiv = getActiveDiv();

    if (activeDiv) {
        activeDiv.style[e.target.name] = e.target.value;
    }
}

//Размытие фона
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

//Прозрачность подложки
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

//Фоновая картинка
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

//Выключка заголовка
const textAlignSelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="textAlign"]'));

if (textAlignSelect) { textAlignSelect.addEventListener('change', handleFormStylePropChange); }

//Вертикальное выравнивание заголовка
const justifyContentSelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="justifyContent"]'));

if (justifyContentSelect) { justifyContentSelect.addEventListener('change', handleFormStylePropChange); }

//Шрифт
const fontFamilySelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="fontFamily"]'));

if (fontFamilySelect) {
    let fontsAdded = false;
    fontFamilySelect.addEventListener('change', function handleFontChange(e) {
        if (!fontsAdded) {
            const link = document.createElement('link');

            link.rel = 'stylesheet';
            link.href = "https://fonts.googleapis.com/css2?family=Alegreya&family=Alice&family=Bitter&family=Cormorant&family=EB+Garamond&family=IBM+Plex+Serif&family=Literata:opsz@7..72&family=Lora&family=Merriweather&family=Old+Standard+TT&family=PT+Serif&family=PT+Serif+Caption&family=Piazzolla:opsz@8..30&family=Playfair+Display&family=Prata&family=Source+Serif+Pro&family=Spectral&family=Alegreya+Sans&family=Arsenal&family=Commissioner&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inter&family=JetBrains+Mono&family=Montserrat&family=PT+Mono&family=PT+Sans&family=Raleway&family=Roboto&family=Roboto+Condensed&family=Roboto+Mono&family=Rubik&family=Yanone+Kaffeesatz&family=Caveat&family=Lobster&family=Pacifico&family=Pangolin&family=Podkova&family=Press+Start+2P&family=Ruslan+Display&family=Russo+One&family=Underdog&family=Yeseva+One&display=swap";
            document.head.appendChild(link);
            fontsAdded = true;
        }
        handleArticleStylePropChange(e);
    });
}

//Соотношение сторон
const aspectRatioSelect = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="aspectRatio"]'));

if (aspectRatioSelect) { aspectRatioSelect.addEventListener('change', handleArticleStylePropChange); }

//Цвета
const colorInput = /** @type {HTMLInputElement | null} */ (document.querySelector('[name="color"]'));

if (colorInput) { colorInput.addEventListener('change', handleArticleStylePropChange); }

const backgroundColorInput = /** @type {HTMLInputElement | null} */ (document.querySelector('[name="backgroundColor"]'));

if (backgroundColorInput) { backgroundColorInput.addEventListener('change', handleDivStylePropChange); }

function ColorToHex(color) {
    const hexadecimal = parseInt(color, 10).toString(16);

    return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(rgb) {
    const colors = rgb.slice(4, -1).split(', ');

    return "#" + ColorToHex(colors[0]) + ColorToHex(colors[1]) + ColorToHex(colors[2]);
}

function updateStyleControls() {
    const activeArticle = getActiveArticle();
    const activeDiv = getActiveDiv();
    const activeForm = getActiveForm();

    function assignValueFromStyle(elem, from) {
        if (elem && from) { elem.value = from.style[elem.name]; }
    }

    assignValueFromStyle(textAlignSelect, activeForm);
    assignValueFromStyle(justifyContentSelect, activeForm);
    assignValueFromStyle(fontFamilySelect, activeArticle);
    assignValueFromStyle(aspectRatioSelect, activeArticle);
    if (opacityRange && activeDiv) { opacityRange.value = (1 - parseFloat(activeDiv.style.opacity)).toString(); }
    if (activeArticle && colorInput) { colorInput.value = ConvertRGBtoHex(activeArticle.style.color); }
    if (activeDiv && backgroundColorInput) { backgroundColorInput.value = ConvertRGBtoHex(activeDiv.style.backgroundColor); }
    if (backdropFilterInput && activeForm) { backdropFilterInput.value = activeForm.style[backdropFilterInput.name].slice(5, -3); }
}

//Импорт
const mount = document.getElementById('pages');

function renderPages(pagesJson, mount) {
    const pages = [];

    for (let i = 0; i < pagesJson.length; i++) {
        const page = pagesJson[i];
        const li = createPage(page, i === 0);

        pages.push(li);
    }
    mount.append(...pages);
    updateStyleControls();
}

if (mount) {
    mount.addEventListener('scroll', function handlePagesScroll() {
        if (mount.scrollLeft % mount.offsetWidth === 0) {
            const activeIndex = mount.scrollLeft / mount.offsetWidth;
            const pages = mount.children;

            for (let i = 0; i < pages.length; i++) {
                pages[i].classList.toggle('active', i === activeIndex);
            }
            updateStyleControls();
        }
    });
    renderPages([DEFAULTS.FIRST_PAGE, DEFAULTS.PAGE], mount);
}

const importInput = document.getElementById('import');

if (importInput && mount) {
    importInput.addEventListener('click', function handleImportClick(e) {
        if (!window.confirm('Это сотрет текущий прайс. Продолжить?')) {
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
                    window.alert('Не удалось загрузить файл');
                }
            };
            fileReader.readAsText(input.files[0], "UTF-8");
        }
    });
}


//Удаление
const deleteBtn =  /** @type {HTMLButtonElement | null} */ (document.getElementById('delete'));

if (deleteBtn) {
    deleteBtn.addEventListener('click', function handleDeleteClick() {
        const activeElement = getActiveElement();
        if (activeElement && window.confirm(`Удалить элемент${activeElement.innerText.trim() ? (' «' + activeElement.innerText + '»') : ''}?`)) {
            const pages = document.getElementById('pages');
            const section = activeElement.closest('section');
            const li = activeElement.closest('li');

            activeElement.remove();
            if (section && !section.innerText.trim()) {
                section.remove();
                if (backgroundImageInput) { backgroundImageInput.value = ''; }
            }
            if (li && !li.innerText.trim()) {
                li.remove();
            }


            if (pages && pages.children.length === 1) {
                const li = pages.children[0];

                li.classList.add('active');
                updateStyleControls();
            }
        }
    });
}
