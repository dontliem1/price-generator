"use strict";

import { createEditableElement, createSection, createService, getActiveForm } from './utils.js';

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