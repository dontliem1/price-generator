'use strict';

function Defaults() {
    this.aspectRatio = '4 / 5';
    this.opacity = '0.5';
    this.H1 = 'Title';
    this.H2 = 'Category';
    this.H3 = 'Service name';
    this.P = 'Price';
    this.SPAN = 'Service description';
    this.FOOTER = 'Page footer';
    this.LI = {
        H3: this.H3,
        P: this.P,
        SPAN: this.SPAN,
    };
    this.SECTION = {
        H2: this.H2,
        UL: [this.LI, this.LI],
    };
    this.STYLE = {
        aspectRatio: this.aspectRatio,
        backgroundColor: 'rgb(50, 50, 50)',
        color: 'rgb(255, 255, 255)',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'left',
        justifyContent: 'flex-start',
        opacity: this.opacity,
    };
    this.FIRST_PAGE = {
        H1: 'PRICE',
        STYLE: {
            aspectRatio: this.aspectRatio,
            backgroundColor: 'rgb(0, 0, 0)',
            backgroundImage: 'url(images/example.webp)',
            color: 'rgb(255, 228, 168)',
            justifyContent: 'flex-end',
            opacity: this.opacity,
        },
    };
    this.SECOND_PAGE = {
        SECTIONS: [
            {
                H2: 'Brows',
                UL: [
                    {
                        H3: 'Full face makeup application',
                        P: '£45',
                        SPAN: 'lashes included',
                    },
                    {
                        H3: 'Eye Makeup only',
                        P: '£30',
                    },
                    {
                        H3: 'Strip lashes',
                        P: '£5',
                    },
                ],
            }],
        FOOTER: 'The title picture is from https://unsplash.com/photos/hSlmasb-tuE',
        STYLE: this.STYLE,
    };
    this.PAGE = {
        H1: this.H1,
        SECTIONS: [this.SECTION],
        FOOTER: this.FOOTER,
        STYLE: this.STYLE,
    };
}

export const DEFAULTS = new Defaults();
