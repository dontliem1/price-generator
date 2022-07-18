//Экспорт
const exportBtn = document.getElementById('export');
const output = /** @type {HTMLOutputElement | null} */ (document.getElementById('json'));

if (exportBtn && output) {
    exportBtn.addEventListener('click', function handleExportClick() {
        const json = [];
        const pages = document.getElementsByTagName('article');

        for (const page of pages) {
            const pageJson = {};
            const price = /** @type {HTMLFormElement | null} */ (page.children[0]);
            const priceElems = price ? price.children : [];

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
                backgroundColor: page.style.backgroundColor,
                color: page.style.color,
                fontFamily: page.style.fontFamily,
            };
            json.push(pageJson);
        }

        output.value = JSON.stringify(json);
    });
}
