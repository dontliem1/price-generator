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

            json.push(pageJson);
        }

        output.value = JSON.stringify(json);
    });
}

//Активный элемент
let activeElement = null;
const form = document.querySelector('form');
const deleteBtn =  /** @type {HTMLButtonElement | null} */ (document.getElementById('delete'));
if (form) {
    form.addEventListener('input', function handleFocus(e) {
        const element = /** @type {HTMLElement} */ (e.target);
        if (!element.textContent) {
            element.innerHTML = ' ';
        }
        const page = form.parentElement;
        if (page && (page.scrollHeight - page.clientHeight > 16)) {
            alert(page.scrollHeight + ' ' + page.clientHeight);
        }
    });
}
if (form && deleteBtn) {
    form.addEventListener('focusin', function handleFocus(e) {
        const element = /** @type {HTMLElement} */ (e.target);
        if (element.hasAttribute('contenteditable')) {
            activeElement = e.target;
            deleteBtn.hidden = false;
        }
    });
}

//Удаление
if (deleteBtn) {
    deleteBtn.addEventListener('click', function handleDeleteClick() {
        if (confirm('Удалить элемент?')) {
            const parent = activeElement.parentElement;
            activeElement.remove();
            if (!parent.innerText.trim()) {
                parent.remove();
            }
            deleteBtn.hidden = true;
        }
    });
}