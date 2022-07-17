import { createEditableElement, createSection } from './utils.js';

const activePage = document.querySelector('article');
const titleBtn = document.getElementById('title');
const groupBtn = document.getElementById('group');
const subtitleBtn = document.getElementById('subtitle');

function getForm(page) {
    return page.firstChild;
}

if (titleBtn) {
    titleBtn.addEventListener('click', function createTitle() {
        const form = getForm(activePage);
        const existingTitle = form.querySelector('h1');

        if (existingTitle) {
            existingTitle.focus();
        } else {
            createEditableElement({tag: 'H1', fromStart: true, parent: form});
        }
    });
}

if (subtitleBtn) {
    subtitleBtn.addEventListener('click', function createSubtitle() {
        const form = getForm(activePage);
        const existingSubtitle = form.querySelector('footer');

        if (existingSubtitle) {
            existingSubtitle.focus();
        } else {
            createEditableElement({tag: 'FOOTER', parent: form});
        }
    });
}

if (groupBtn) {
    groupBtn.addEventListener('click', function createSubtitle() {
        const form = getForm(activePage);
        const existingSubtitle = form.querySelector('footer');

        const group = createSection();

        if (existingSubtitle) {
            form.insertBefore(group, existingSubtitle);
        } else {
            form.appendChild(group);
        }
    });
}