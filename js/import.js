import { createEditableElement, createSection } from "./utils.js";
import { DEFAULTS } from "./constants.js";

const mount = document.getElementById('pages');

function renderPages(pagesJson, mount) {
    const pages = [];
    for (const page of pagesJson) {
        const article = document.createElement('article');
        const form = document.createElement('form');
        article.appendChild(form);
        const li = document.createElement('li');
        li.appendChild(article);

        for (const tag in page) {
            if (tag === 'SECTIONS') {
                for (const sectionJson of page[tag]) {
                    const section = createSection(sectionJson);
                    form.appendChild(section);
                }

                continue;
            }
            createEditableElement({tag, text: page[tag], parent: form});
        }
        pages.push(li);
    }
    mount.append(...pages);
}

renderPages([DEFAULTS.PAGE], mount);
