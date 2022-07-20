"use strict";

import { createEditableElement, createPage, createSection, createService, getActiveForm, getActivePage, handleFormFocusIn, handleFormInput } from './utils.js';

const titleBtn = document.getElementById('title');

if (titleBtn) {
    titleBtn.addEventListener('click', function handleAddTitleClick() {
        const form = getActiveForm();
        if (form) {
            const existingTitle = form.querySelector('h1');

            if (existingTitle) {
                existingTitle.focus();
            } else {
                createEditableElement({ tag: 'H1', fromStart: true, parent: form });
            }
        }
    });
}

const subtitleBtn = document.getElementById('subtitle');

if (subtitleBtn) {
    subtitleBtn.addEventListener('click', function handleAddSubtitleClick() {
        const form = getActiveForm();
        if (form) {
            const existingSubtitle = form.querySelector('footer');

            if (existingSubtitle) {
                existingSubtitle.focus();
            } else {
                createEditableElement({ tag: 'FOOTER', parent: form });
            }
        }
    });
}

const groupBtn = document.getElementById('group');

if (groupBtn) {
    groupBtn.addEventListener('click', function handleAddGroupClick() {
        const form = getActiveForm();
        if (form) {
            const existingSubtitle = form.querySelector('footer');
            const group = createSection();

            if (existingSubtitle) {
                form.insertBefore(group, existingSubtitle);
            } else {
                form.appendChild(group);
            }
        }
    });
}

//Добавить услугу
const serviceBtn = document.getElementById('service');

if (serviceBtn) {
    serviceBtn.addEventListener('click', function handleAddServiceClick() {
        const form = getActiveForm();
        if (form) {
            const existingGroup = form.querySelector('ul');
            const li = createService();

            if (existingGroup) {
                existingGroup.appendChild(li);
            } else {
                const ul = document.createElement('ul');

                ul.appendChild(li);
                form.appendChild(ul);
            }
        }
    });
}

//Добавить страницу
const pageBtn = document.getElementById('page');

if (pageBtn) {
    pageBtn.addEventListener('click', function handleAddPageClick() {
        const pages = document.getElementById('pages');
        if (pages) {
            // let newPage;
            // const activePage = getActivePage();
            // if (activePage) {
            //     newPage = /** @type {HTMLLIElement} */ (activePage.cloneNode(true));

            //     let newPageTitle = newPage.querySelector('h1');

            //     if (newPageTitle) {
            //         newPageTitle.innerText += ' копия';
            //     }

            //     let newPageForm = newPage.querySelector('form');
            //     if (newPageForm) {
            //         newPageForm.addEventListener('focusin', handleFormFocusIn);
            //         newPageForm.addEventListener('input', handleFormInput);
            //     }
            // } else {
            //     newPage = createPage();
            // }
            const newPage = createPage();

            pages.appendChild(newPage);
            newPage.scrollIntoView();
        }
    });
}