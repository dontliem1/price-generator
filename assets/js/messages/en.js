'use strict';

const messages = {
    H1: 'Title',
    H2: 'Category',
    H3: 'Service name',
    P: 'Price',
    SPAN: 'Service description',
    FOOTER: 'Page footer',
    PRICE: 'RUTINA',
    ITEMS: [
        {
            type: "SERVICE",
            SPAN: "Welcome to our handy image constructor!"
        },
        {
            type: "CATEGORY",
            H2: "A few buttons"
        },
        {
            type: "SERVICE",
            H3: "Export to image(s)",
            P: "🖼"
        },
        {
            type: "SERVICE",
            H3: "Export to .json file",
            P: "📄",
            SPAN: "You can import it later to load your project"
        },
        {
            type: "SERVICE",
            H3: "Toggle sorting mode",
            P: "⇅",
            SPAN: "Try it now and drag and drop these hints!"
        }
    ],
    EXAMPLE_FOOTER: "To change font, colors and image, tap on the background",
    FILE_LOAD_ERROR: "Couldn't load the file",
    REMOVE_ELEMENT: 'Remove element',
    REMOVE_PAGE: 'Remove the current page?',
    IMPORT_CONFIRM: 'This will replace the current price. Continue?',
    LOAD_CONFIRM: 'There is a saved local copy of last price made without images. Do you want to load it?',
    PAGES: '{"PAGES":[{"H1":"PRICE MAKER","ITEMS":[{"type":"SERVICE","SPAN":"Welcome to our handy image constructor!"},{"type":"CATEGORY","H2":"A few buttons"},{"type":"SERVICE","H3":"Export to image(s)","P":"🖼"},{"type":"SERVICE","H3":"Export to .json file","P":"📄","SPAN":"You can import it later to load your project"},{"type":"SERVICE","H3":"Toggle sorting mode","P":"⇅","SPAN":"Try it now and drag and drop these hints!"}],"FOOTER":"To change font, colors and image, tap on the background","STYLE":{"backgroundColor":"rgb(0, 0, 0)","color":"rgb(230, 228, 200)","justifyContent":"flex-end","opacity":"0.3"}}],"STYLE":{"aspectRatio":"4 / 5"}}',
};