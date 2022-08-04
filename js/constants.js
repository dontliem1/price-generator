'use strict';
/**
 * @typedef {{backgroundColor?: string, backgroundImage?: string, color?: string, justifyContent?: string, opacity?: string}} PageStyle
 * @typedef {{H1?: string, STYLE?: PageStyle, FOOTER?: string}} Page
 */
class Defaults {
    constructor() {
        this.aspectRatio = '4 / 5';
        this.opacity = '0.5';
        this.H1 = 'Title';
        /**
         * @type {'Category'}
         * @const
         */
        this.H2 = 'Category';
        this.H3 = 'Service name';
        /**
         * @typedef {{type: 'CATEGORY', H2?: string}} Category
         * @type {{type: 'CATEGORY', H2: 'Category'}}
         * @const
         */
        this.CATEGORY = { type: 'CATEGORY', H2: this.H2 };
        this.P = 'Price';
        this.SPAN = 'Service description';
        this.FOOTER = 'Page footer';
        /**
         * @typedef {{type: 'SERVICE', H3?: string, P?: string, SPAN?: string}} Service
         * @type {Service}
         * @const
         */
        this.SERVICE = {
            type: 'SERVICE',
            H3: this.H3,
            P: this.P,
            SPAN: this.SPAN,
        };
        this.ITEMS = [
            this.CATEGORY,
            this.SERVICE,
            this.SERVICE,
        ];
        /**
         * @type {PageStyle}
         * @const
         */
        this.STYLE = {
            backgroundColor: 'rgb(50, 50, 50)',
            color: 'rgb(255, 255, 255)',
            opacity: this.opacity,
        };
        /**
         * @type {Page}
         * @const
         */
        this.FIRST_PAGE = {
            H1: 'PRICE',
            STYLE: {
                backgroundColor: 'rgb(0, 0, 0)',
                backgroundImage: 'url(images/example.webp)',
                color: 'rgb(255, 228, 168)',
                justifyContent: 'flex-end',
                opacity: this.opacity,
            },
        };
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
            FOOTER: 'The title picture is from https://unsplash.com/photos/hSlmasb-tuE',
            STYLE: this.STYLE,
        };
        this.hash = '{"PAGES":[{"H1":"PRICE","STYLE":{"backgroundImage":"url(\\"images/example.webp\\")","color":"rgb(255, 228, 168)","justifyContent":"flex-end","backgroundColor":"rgb(0, 0, 0)","opacity":"0.5"}},{"ITEMS":[{"type":"CATEGORY","text":"Makeup"},{"type":"SERVICE","H3":"Full face makeup application","P":"£45","SPAN":"lashes included"},{"type":"SERVICE","H3":"Eye Makeup only","P":"£30"},{"type":"SERVICE","H3":"Strip lashes","P":"£5"}],"FOOTER":"The title picture is from https://unsplash.com/photos/hSlmasb-tuE","STYLE":{"color":"rgb(255, 255, 255)","backgroundColor":"rgb(50, 50, 50)","opacity":"0.5"}}],"STYLE":{"aspectRatio":"4 / 5"}}';
    }
    /**
     * @return {{PAGES: Page[], STYLE: {aspectRatio?: string}}}
     */
    get() {
        return { PAGES: [this.FIRST_PAGE, this.SECOND_PAGE], STYLE: { aspectRatio: this.aspectRatio } };
    }
}

export const DEFAULTS = new Defaults();
