"use strict";

//Экспорт
const exportBtn = /** @type {HTMLAnchorElement | null} */ (document.getElementById('export'));

function parseStyles({ page, form, div }) {
    const result = {};

    ['aspectRatio', 'color', 'fontFamily'].forEach(function addPageProps(prop) {
        if (page.style[prop]) { result[prop] = page.style[prop]; }
    });
    if (form) {
        ['-webkit-backdrop-filter', 'backdropFilter', 'justifyContent', 'textAlign'].forEach(function addFormProps(prop) {
            if (form.style[prop]) { result[prop] = form.style[prop]; }
        });
    }
    if (div) {
        ['backgroundColor', 'opacity'].forEach(function addFormProps(prop) {
            if (div.style[prop]) { result[prop] = div.style[prop]; }
        });
    }

    return result;
}

if (exportBtn) {
    exportBtn.addEventListener('click', function handleExportClick() {
        const json = [];
        const pages = document.getElementsByTagName('article');

        for (const page of pages) {
            const pageJson = {};
            const div = /** @type {HTMLDivElement | null} */ (page.firstElementChild);
            const form = /** @type {HTMLFormElement | null} */ (page.lastElementChild);
            const priceElems = form ? form.children : [];

            for (const priceElem of priceElems) {
                if (priceElem.tagName === 'SECTION') {
                    if (!pageJson.SECTIONS) {
                        pageJson.SECTIONS = [];
                    }
                    const sectionJson = {};

                    for (const sectionElem of priceElem.children) {
                        if (sectionElem.tagName === 'UL') {
                            if (!sectionJson[sectionElem.tagName]) {
                                sectionJson[sectionElem.tagName] = [];
                            }
                            for (const li of sectionElem.children) {
                                const liJson = {};

                                for (const prop of li.children) {
                                    liJson[prop.tagName] = prop.textContent;
                                }
                                sectionJson[sectionElem.tagName].push(liJson);
                            }

                            continue;
                        }
                        sectionJson[sectionElem.tagName] = sectionElem.textContent;
                    }
                    pageJson.SECTIONS.push(sectionJson);
                    continue;
                }
                pageJson[priceElem.tagName] = priceElem.textContent;
            }
            pageJson.STYLE = parseStyles({ page, form, div });
            json.push(pageJson);
        }
        const stringified = JSON.stringify(json);
        const exportJson = new Blob([stringified], { type: 'text/json' });

        exportBtn.href = URL.createObjectURL(exportJson);
    });
}

const saveBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('save'));

/**
 * @param {{ toDataURL: (arg0: string) => string; }} canvas
 */
function resolveCanvas(canvas) {
    const link = /** @type {HTMLAnchorElement | null} */ (document.getElementById('canvas'));

    if (link) {
        link.href = canvas.toDataURL('image/png');
        link.download = link.dataset.index + '.png';
        link.click();
        link.dataset.index = (parseInt(link.dataset.index ?? '0', 10) + 1).toString();
    }
}

if (saveBtn) {
    saveBtn.addEventListener('click', async function handleSaveClick() {
        saveBtn.disabled = true;
        document.body.style.minWidth = '1080px';

        await import('./html2canvas.min.js');

        const link = document.createElement('a');
        const pages = document.getElementsByTagName('article');

        link.id = 'canvas';
        link.dataset.index = '1';
        document.body.appendChild(link);
        for (const page of pages) {
            await html2canvas(page).then(resolveCanvas);
        }

        link.remove();
        document.body.style.minWidth = '';
        saveBtn.disabled = false;
    });
}