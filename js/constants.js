"use strict";

function Defaults() {
    this.backdropFilter = 'blur(0px)';
    this.H1 = 'Заголовок страницы';
    this.H2 = 'Категория';
    this.H3 = 'Название услуги';
    this.P = 'Цена';
    this.SPAN = 'Описание услуги';
    this.FOOTER = 'Подпись страницы';
    this.LI = { H3: this.H3, P: this.P, SPAN: this.SPAN };
    this.SECTION = { H2: this.H2, UL: [this.LI, this.LI] };
    this.STYLE = {
        aspectRatio: '4 / 5',
        backgroundColor: 'rgb(50, 50, 50)',
        color: 'rgb(255, 255, 255)',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'left',
        justifyContent: 'flex-start',
        opacity: '0.7',
        ['-webkit-backdrop-filter']: this.backdropFilter,
        backdropFilter: this.backdropFilter,
    };
    this.FIRST_PAGE = { H1: 'ПРАЙС', STYLE: {...this.STYLE, backgroundImage: 'url(http://placekitten.com/400/500)'} };
    this.PAGE = {
        H1: this.H1,
        SECTIONS: [this.SECTION],
        FOOTER: this.FOOTER,
        STYLE: this.STYLE,
    };
}

export const DEFAULTS = new Defaults();
