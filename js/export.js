//Экспорт
const exportBtn = /** @type {HTMLAnchorElement | null} */ (document.getElementById('export'));

if (exportBtn) {
    exportBtn.addEventListener('click', function handleExportClick(e) {
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
            pageJson.STYLE = {
                aspectRatio: page.style.aspectRatio,
                color: page.style.color,
                fontFamily: page.style.fontFamily,
            };
            if (form) {
                pageJson.STYLE.textAlign = form.style.textAlign;
                pageJson.STYLE.justifyContent = form.style.justifyContent;
                pageJson.STYLE.backdropFilter = form.style['backdropFilter'];
                pageJson.STYLE['-webkit-backdrop-filter'] = form.style['-webkit-backdrop-filter'];
            }
            if (div) {
                pageJson.STYLE.backgroundColor = div.style.backgroundColor;
                pageJson.STYLE.opacity = div.style.opacity;
            }
            json.push(pageJson);
        }
        const stringified = JSON.stringify(json);
        const exportJson = new Blob([stringified], { type: 'text/json' });

        exportBtn.href = URL.createObjectURL(exportJson);
    });
}

const saveBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('save'));

// @ts-ignore
if (saveBtn && html2canvas) {
    saveBtn.addEventListener('click', function handleSaveClick() {
        const pages = document.getElementsByTagName('article');

        function resolveCanvas(canvas) {
            // document.body.appendChild(canvas);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'price.png';
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        for (const page of pages) {
            page.scrollIntoView();
            // @ts-ignore
            html2canvas(page).then(resolveCanvas);
        }
    });
}