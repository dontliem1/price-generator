import { createPage, getActiveArticle } from "./utils.js";
import { DEFAULTS } from "./constants.js";

function handleStylePropChange(e) {
    const activeArticle = getActiveArticle();

    if (activeArticle) {
        activeArticle.style[e.target.name] = e.target.value;
    }
}

//Шрифт
const fontFamilySelect = /** @type {HTMLSelectElement} */ (document.querySelector('[name="fontFamily"]'));

fontFamilySelect.addEventListener('change', handleStylePropChange);

function updateFontFamily(activePage = getActiveArticle()) {
    if (activePage && fontFamilySelect) {
        fontFamilySelect.value = activePage.style.fontFamily;
    }
}

//Соотношение сторон
const aspectRatioSelect = /** @type {HTMLSelectElement} */ (document.querySelector('[name="aspectRatio"]'));

aspectRatioSelect.addEventListener('change', handleStylePropChange);

function updateActiveAspectRatio(activePage = getActiveArticle()) {
    if (activePage && aspectRatioSelect) {
        aspectRatioSelect.value = activePage.style.aspectRatio;
    }
}

//Цвета
const colorInput = /** @type {HTMLInputElement} */ (document.querySelector('[name="color"]'));
const backgroundColorInput = /** @type {HTMLInputElement} */ (document.querySelector('[name="backgroundColor"]'));

colorInput.addEventListener('change', handleStylePropChange);
backgroundColorInput.addEventListener('change', handleStylePropChange);

function ColorToHex(color) {
    const hexadecimal = parseInt(color, 10).toString(16);

    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(rgb) {
    const colors = rgb.slice(4, -1).split(', ');

    return "#" + ColorToHex(colors[0]) + ColorToHex(colors[1]) + ColorToHex(colors[2]);
}

function updateActiveColors(activePage = getActiveArticle()) {
    if (activePage && colorInput && backgroundColorInput) {
        colorInput.value = ConvertRGBtoHex(activePage.style.color);
        backgroundColorInput.value = ConvertRGBtoHex(activePage.style.backgroundColor);
    }
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
    updateActiveColors();
    updateActiveAspectRatio();
    updateFontFamily();
}

if (mount) {
    mount.addEventListener('scroll', function handlePagesScroll() {
        if (mount.scrollLeft % mount.offsetWidth === 0) {
            const activeIndex = mount.scrollLeft / mount.offsetWidth;
            const pages = mount.children;

            for (let i = 0; i < pages.length; i++) {
                const pageArticle = /** @type {HTMLElement | null} */ (pages[i].firstChild);

                // pages[i].classList.toggle('active', i === activeIndex);
                if (i === activeIndex) {
                    pages[i].classList.add('active');
                    updateActiveColors(pageArticle);
                    updateActiveAspectRatio(pageArticle);
                    updateFontFamily(pageArticle);
                } else {
                    pages[i].classList.remove('active');
                }
            }
        }
    });
    renderPages([DEFAULTS.FIRST_PAGE, DEFAULTS.PAGE], mount);
}
