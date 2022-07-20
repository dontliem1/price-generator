"use strict";

function Defaults() {
    this.aspectRatio = '4 / 5';
    this.H1 = 'Заголовок страницы';
    this.H2 = 'Категория';
    this.H3 = 'Название услуги';
    this.P = 'Цена';
    this.SPAN = 'Описание услуги';
    this.FOOTER = 'Подпись страницы';
    this.LI = { H3: this.H3, P: this.P, SPAN: this.SPAN };
    this.SECTION = { H2: this.H2, UL: [this.LI, this.LI] };
    this.STYLE = {
        aspectRatio: this.aspectRatio,
        backgroundColor: 'rgb(50, 50, 50)',
        color: 'rgb(255, 255, 255)',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'left',
        justifyContent: 'flex-start',
        opacity: '1',
    };
    this.FIRST_PAGE = {
        H1: 'ПРАЙС',
        STYLE: {
            aspectRatio: this.aspectRatio,
            backgroundColor: 'rgb(0, 0, 0)',
            backgroundImage: 'url(images/example.webp)',
            color: 'rgb(255, 228, 168)',
            justifyContent: 'flex-end',
            opacity: '0.5',
        },
    };
    this.SECOND_PAGE = {
        SECTIONS: [
            {
                H2: 'Брови',
                UL: [
                    {
                        H3: 'Архитектура бровей',
                        P: '1100',
                        SPAN: 'моделирование + окрашивание краской/хной + коррекция'
                    },
                    {
                        H3: 'Архитектура + долговременная укладка/ламинирование бровей',
                        P: '1700',
                    },
                    {
                        H3: 'Долго­временная укладка/ламинирование бровей',
                        P: '1000',
                    },
                ]
            }],
        FOOTER: 'Источник картинки с первой страницы: https://unsplash.com/photos/hSlmasb-tuE',
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
