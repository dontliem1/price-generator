'use strict';

const exportBtn = /** @type {HTMLAnchorElement | null} */ (document.getElementById('export'));

/**
* @param {Object} params
* @param {HTMLElement | null} params.page
* @param {HTMLElement | null} params.form
* @param {HTMLElement | null} params.div
*/
function parseStyles({ page, form, div }) {
    // @ts-ignore
    const { aspectRatio, backgroundImage, color, fontFamily } = page ? page.style : {};
    // @ts-ignore
    const { backdropFilter, justifyContent, textAlign } = form ? form.style : {};
    // @ts-ignore
    const { backgroundColor, opacity } = div ? div.style : {};

    return Object.fromEntries(Object.entries({ aspectRatio, backgroundImage, color, fontFamily, backdropFilter, justifyContent, textAlign, backgroundColor, opacity }).filter(function filterEmpty([, value]) {
        return value;
    }));
}

if (exportBtn) {
    exportBtn.addEventListener('click', function handleExportClick() {
        /** @type {{PAGES: { STYLE?: Record<string, string>, ITEMS?: {type: string; H3?: string; SPAN?: string; P?: string; H2?: string}[], H1?: string, FOOTER?: string }[], STYLE: {aspectRatio?: string}}} */
        const json = { PAGES: [], STYLE: {} };
        const pages = document.getElementsByTagName('article');
        const mount = document.getElementById('pages');

        if (mount && mount.dataset.aspectRatio) {
            json.STYLE.aspectRatio = mount.dataset.aspectRatio;
        }
        for (const page of pages) {
            /**
             * @type {{ITEMS: {type: string, text?: string, H3?: string, P?: string, SPAN?: string}[], H1?: string, FOOTER?: string, STYLE?: {[prop: string]: string}}}
             */
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
                        const category = { type: 'CATEGORY', text: priceElem.innerText };

                        pageJson.ITEMS = pageJson.ITEMS ? [...pageJson.ITEMS, category] : [category];

                        break;
                    case 'DIV':
                        const serviceItems = /** @type {HTMLCollectionOf<HTMLElement>} */ (priceElem.children);

                        if (serviceItems.length) {
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
            });
            json.PAGES.push(pageJson);
        }
        const stringified = JSON.stringify(json);
        const exportJson = new Blob([stringified], { type: 'text/json' });

        this.href = URL.createObjectURL(exportJson);
    });
}

function checkBasicFileShare() {
    const txt = new Blob(['Hello, world!'], { type: 'text/plain' });
    const file = new File([txt], 'test.txt');

    return navigator.canShare({ files: [file] });
}

const saveBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('save'));

if (saveBtn) {
    saveBtn.addEventListener('click', async function handleSaveClick() {
        saveBtn.disabled = true;

        await import('./html2canvas.min.js');

        const pages = document.getElementsByTagName('article');

        document.body.classList.add('rendering');
        if (navigator.share === undefined || !navigator.canShare || !checkBasicFileShare()) {
            const link = document.createElement('a');
            const canvases = /** @type {string[]} */ ([]);

            document.body.appendChild(link);
            for (const page of pages) {
                await html2canvas(page).then(function resolveCanvas(canvas) {
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

                document.body.classList.remove('rendering');
                saveBtn.disabled = false;
            }, 1000);
        } else {
            const files = /** @type {File[]} */ ([]);

            for (const page of pages) {
                await html2canvas(page).then(function resolveCanvas(/** @type {HTMLCanvasElement} */ canvas) {
                    canvas.toBlob(function blobToFile(blob) {
                        if (blob) {
                            files.push(new File([blob], (files.length + 1) + '.png'));
                        }
                    });
                });
            }

            setTimeout(async function shareImages() {
                await navigator.share({ files }).catch(function handleError(error) {
                    window.console.error(error);
                });

                document.body.classList.remove('rendering');
                saveBtn.disabled = false;
            }, 1000);
        }
    });
}