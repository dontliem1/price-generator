'use strict';
class Defaults {
    constructor() {
        this.aspectRatio = '4 / 5';
        this.opacity = '0.5';
        this.H1 = 'Title';
        this.H2 = 'Category';
        this.H3 = 'Service name';
        /** @type {Category} */
        this.CATEGORY = { type: 'CATEGORY', H2: this.H2 };
        this.P = 'Price';
        this.SPAN = 'Service description';
        this.FOOTER = 'Page footer';
        /** @type {Service} */
        this.SERVICE = {
            type: 'SERVICE',
            H3: this.H3,
            P: this.P,
            SPAN: this.SPAN,
        };
        this.STYLE = {
            backgroundColor: 'rgb(50, 50, 50)',
            color: 'rgb(255, 255, 255)',
            opacity: this.opacity,
        };
        /** @type {Page} */
        this.FIRST_PAGE = {
            H1: 'PRICE',
            STYLE: {
                backgroundColor: 'rgb(0, 0, 0)',
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, 0) 100%), radial-gradient(at left bottom, rgba(0, 200, 255, 1) 0%, rgba(0, 200, 255, 0) 80%), linear-gradient(135deg, rgba(50, 50, 120, 0) 0%, rgba(50, 50, 120, 0) 75%, rgba(50, 50, 120, 1) 100%), linear-gradient(75deg, rgba(100, 100, 0, 1) 0%, rgba(200, 100, 100, 1) 17%, rgba(200, 150, 40, 1) 74%, rgba(200, 100, 30, 1) 100%)',
                color: 'rgb(230, 228, 200)',
                justifyContent: 'flex-end',
                opacity: '0',
            },
        };
        /** @type {Page} */
        this.SECOND_PAGE = {
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
            FOOTER: 'Made in Lepekhin Studio',
            STYLE: this.STYLE,
        };
        this.hash = '{"PAGES":[{"H1":"PRICE","STYLE":{"backgroundImage":"radial-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), radial-gradient(at left bottom, rgb(0, 200, 255) 0%, rgba(0, 200, 255, 0) 80%), linear-gradient(135deg, rgba(50, 50, 120, 0) 0%, rgba(50, 50, 120, 0) 75%, rgb(50, 50, 120) 100%), linear-gradient(75deg, rgb(100, 100, 0) 0%, rgb(200, 100, 100) 17%, rgb(200, 150, 40) 74%, rgb(200, 100, 30) 100%)","color":"rgb(230, 228, 200)","justifyContent":"flex-end","backgroundColor":"rgb(0, 0, 0)","opacity":"0"}},{"ITEMS":[{"type":"CATEGORY","H2":"Makeup"},{"type":"SERVICE","H3":"Full face makeup application","P":"£45","SPAN":"lashes included"},{"type":"SERVICE","H3":"Eye Makeup only","P":"£30"},{"type":"SERVICE","H3":"Strip lashes","P":"£5"}],"FOOTER":"Made in Lepekhin Studio","STYLE":{"color":"rgb(255, 255, 255)","backgroundColor":"rgb(50, 50, 50)","opacity":"0.5"}}],"STYLE":{"aspectRatio":"4 / 5"}}';
    }
    /**
     * @return {Pages}
     */
    get() {
        return { PAGES: [this.FIRST_PAGE, this.SECOND_PAGE], STYLE: { aspectRatio: this.aspectRatio } };
    }
}

export const DEFAULTS = new Defaults();
/** @type {ReadonlyArray<'H2'| 'H3'| 'SPAN'| 'P'>} */
export const ITEMS_TAGS = ['H2', 'H3', 'SPAN', 'P'];
/** @type {ReadonlyArray<'H1'| 'FOOTER'>} */
export const HEADER_TAGS = ['H1', 'FOOTER'];
/** @type {ReadonlyArray<EditableTags>} */
export const EDITABLE_TAGS = [...HEADER_TAGS, ...ITEMS_TAGS];
