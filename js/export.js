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

function checkBasicFileShare() {
    // XXX: There is no straightforward API to do this.
    // For now, assume that text/plain is supported everywhere.
    const txt = new Blob(['Hello, world!'], { type: 'text/plain' });
    // XXX: Blob support? https://github.com/w3c/web-share/issues/181
    const file = new File([txt], "test.txt");
    return navigator.canShare({ files: [file] });
}

const saveBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('save'));

if (saveBtn) {
    saveBtn.addEventListener('click', async function handleSaveClick() {
        saveBtn.disabled = true;

        await import('./html2canvas.min.js');

        const pages = document.getElementsByTagName('article');

        document.body.style.minWidth = '1080px';

        if (navigator.share === undefined || !navigator.canShare || !checkBasicFileShare()) {
            const link = document.createElement('a');
            const canvases = /** @type {string[]} */ ([]);

            document.body.appendChild(link);
            for (const page of pages) {
                await html2canvas(page).then(function resolveCanvas(canvas) { canvases.push(canvas.toDataURL()); });
            }
            for (let i = 0; i < canvases.length; i++) {
                link.href = canvases[i];
                link.download = (i + 1) + '.png';
                link.click();
            }
            link.remove();
        } else {
            const canvases = /** @type {HTMLCanvasElement[]} */ ([]);
            const files = /** @type {File[]} */ ([]);

            for (const page of pages) {
                canvases.push(await html2canvas(page).then(function resolveCanvas(/** @type {HTMLCanvasElement} */ canvas) {
                    return canvas;
                }));
            }

            for (const canvas of canvases) {
                canvas.toBlob(function blobToFile(blob) {
                    if (blob) { files.push(new File([blob], (files.length + 1) + ".png")); }
                });
            }

            setTimeout(async () => {
                await navigator.share({ files }).catch(function handleError(error) {
                    window.console.error(error);
                });
            }, 0);
        }

        document.body.style.minWidth = '';
        saveBtn.disabled = false;
    });
}