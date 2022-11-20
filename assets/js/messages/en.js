'use strict';

const MESSAGES = {
    H1: 'Title',
    H2: 'Category',
    H3: 'Service name',
    P: 'Price',
    SPAN: 'Service description',
    FOOTER: 'Page footer',
    FILE_LOAD_ERROR: "Couldn't load the file",
    REMOVE_SERVICE: 'Remove the whole service row?',
    REMOVE_PAGE: 'Remove the current page?',
    IMPORT_CONFIRM: 'This will replace the current price. Continue?',
    LOAD_CONFIRM: 'There is a saved local copy of last price made without images. Do you want to load it?',
    PAGES: '{"PAGES":[{"STYLE":{"backgroundColor":"rgb(0, 0, 0)","color":"rgb(255, 255, 255)","justifyContent":"flex-end","opacity":"0","textAlign":"right"},"H1":"RUTINA","FOOTER":"Swipe for instructions →"},{"STYLE":{"backgroundColor":"rgb(50, 50, 50)","color":"rgb(255, 255, 255)","opacity":"0.5"},"ITEMS":[{"type":"SERVICE","H3":"Make your own price list","SPAN":"Tap on text or add more pages or items"},{"type":"SERVICE","H3":"Export to image(s)","P":"🖼"},{"type":"SERVICE","H3":"Save to .json file","P":"📄","SPAN":"You can load it later to continue work"},{"type":"SERVICE","H3":"Choose aspect ratio","P":"4:5","SPAN":"If you want to make stories"},{"type":"SERVICE","H3":"Toggle sorting mode","P":"⇅","SPAN":"Try it now and drag and drop these hints!"},{"type":"SERVICE","H3":"Change font, colors and image","P":"Aa","SPAN":"Just tap on background"}]},{"STYLE":{"backgroundColor":"rgb(0, 0, 0)","color":"rgb(230, 228, 200)","opacity":"0.3"},"H1":"Price example","ITEMS":[{"type":"CATEGORY","H2":"Brows"},{"type":"SERVICE","H3":"Brows architecture","P":"£20","SPAN":"modeling + coloring + correction"},{"type":"SERVICE","H3":"Long term paving","P":"£25"},{"type":"CATEGORY","H2":"Lashes"},{"type":"SERVICE","H3":"Eyelash tinting","P":"£5"},{"type":"SERVICE","H3":"Removal of false eyelashes","P":"£4"}],"FOOTER":"Book time at direct messages"}],"STYLE":{"aspectRatio":"4 / 5"}}',
};

/** @type {Page[]} */
const PAGES = [
    {
        H1: 'RUTINA',
        FOOTER: "Swipe for instructions →",
        STYLE: {
            backgroundImage: 'linear-gradient(180deg, #ffd200 0, #ffbf00 12.5%, #ffaa00 25%, #ff9314 37.5%, #f37b1f 50%, #e26426 62.5%, #d3502c 75%, #c53f30 87.5%, #b93035 100%)',
            justifyContent: 'flex-end',
            textAlign: 'right'
        },
    },
    {
        ITEMS: [
            {
                type: "SERVICE",
                H3: "Make your own price list",
                SPAN: "Tap on text or add more pages or items"
            },
            {
                type: "SERVICE",
                H3: "Export to image(s)",
                P: "🖼"
            },
            {
                type: "SERVICE",
                H3: "Save to .json file",
                P: "📄",
                SPAN: "You can load it later to continue work"
            },
            {
                type: "SERVICE",
                H3: "Choose aspect ratio",
                P: "4:5",
                SPAN: "If you want to make stories"
            },
            {
                type: "SERVICE",
                H3: "Toggle sorting mode",
                P: "⇅",
                SPAN: "Try it now and drag and drop these hints!"
            },
            {
                type: "SERVICE",
                H3: "Change font, colors and image",
                P: "Aa",
                SPAN: "Just tap on background"
            }
        ],
        STYLE: {
            backgroundColor: 'rgb(50, 50, 50)',
            color: 'rgb(255, 255, 255)',
            opacity: '0.5'
        },
    },
    {
        H1: 'Price example',
        ITEMS: [
            {
                "type": "CATEGORY",
                "H2": "Brows"
            },
            {
                "type": "SERVICE",
                "H3": "Brows architecture",
                "P": "£20",
                "SPAN": "modeling + coloring + correction"
            },
            {
                "type": "SERVICE",
                "H3": "Long term paving",
                "P": "£25"
            },
            {
                "type": "CATEGORY",
                "H2": "Lashes"
            },
            {
                "type": "SERVICE",
                "H3": "Eyelash tinting",
                "P": "£5"
            },
            {
                "type": "SERVICE",
                "H3": "Removal of false eyelashes",
                "P": "£4"
            }
        ],
        FOOTER: "Book time at direct messages",
        STYLE: {
            backgroundColor: 'rgb(0, 0, 0)',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, 0) 100%), radial-gradient(at left bottom, rgba(0, 200, 255, 1) 0%, rgba(0, 200, 255, 0) 80%), linear-gradient(135deg, rgba(50, 50, 120, 0) 0%, rgba(50, 50, 120, 0) 75%, rgba(50, 50, 120, 1) 100%), linear-gradient(75deg, rgba(100, 100, 0, 1) 0%, rgba(200, 100, 100, 1) 17%, rgba(200, 150, 40, 1) 74%, rgba(200, 100, 30, 1) 100%)',
            color: 'rgb(230, 228, 200)',
            opacity: '0.3',
        },
    }
];
