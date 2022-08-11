'use strict';

const messages = {
    H1: 'Title',
    H2: 'Category',
    H3: 'Service name',
    P: 'Price',
    SPAN: 'Service description',
    FOOTER: 'Page footer',
    PRICE: 'PRICE',
    ITEMS: [
        { type: 'CATEGORY', H2: 'Makeup' },
        {
            type: 'SERVICE',
            H3: 'Full face makeup application',
            P: '£45',
            SPAN: 'lashes included',
        },
        {
            type: 'SERVICE',
            H3: 'Eye Makeup only',
            P: '£30',
        },
        {
            type: 'SERVICE',
            H3: 'Strip lashes',
            P: '£5',
        },
    ],
    EXAMPLE_FOOTER: 'Show this image to administrator to get 5% off',
    FILE_LOAD_ERROR: "Couldn't load the file",
    REMOVE_ELEMENT: 'Remove element',
    REMOVE_PAGE: 'Remove the current page?',
    IMPORT_CONFIRM: 'This will replace the current price. Continue?',
    LOAD_CONFIRM: 'There is a saved local copy of last price made without images. Do you want to load it?',
    PAGES: '{"PAGES":[{"H1":"PRICE","STYLE":{"backgroundColor":"rgb(0, 0, 0)","color":"rgb(230, 228, 200)","justifyContent":"flex-end","opacity":"0"}},{"ITEMS":[{"type":"CATEGORY","H2":"Makeup"},{"type":"SERVICE","H3":"Full face makeup application","P":"£45","SPAN":"lashes included"},{"type":"SERVICE","H3":"Eye Makeup only","P":"£30"},{"type":"SERVICE","H3":"Strip lashes","P":"£5"}],"FOOTER":"Made in Lepekhin Studio","STYLE":{"backgroundColor":"rgb(50, 50, 50)","color":"rgb(255, 255, 255)","opacity":"0.5"}}],"STYLE":{"aspectRatio":"4 / 5"}}',
};