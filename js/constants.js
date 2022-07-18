function Defaults() {
    this.ASPECT_RATIO = '4 / 5';
    this.BG_COLOR = '#333333';
    this.COLOR = '#ffffff';
    this.FONT_FAMILY = 'system-ui, sans-serif';
    this.H1 = 'Заголовок страницы';
    this.H2 = 'Категория';
    this.H3 = 'Название услуги';
    this.P = 'Цена';
    this.SPAN = 'Описание услуги';
    this.FOOTER = 'Подпись страницы';
    this.LI = {H3: this.H3, P: this.P, SPAN: this.SPAN};
    this.SECTION = {H2: this.H2, UL: [this.LI, this.LI]};
    this.STYLE = {
        aspectRatio: this.ASPECT_RATIO,
        backgroundColor: this.BG_COLOR,
        color: this.COLOR,
        fontFamily: this.FONT_FAMILY,
    };
    this.FIRST_PAGE = {H1: 'ПРАЙС', STYLE: this.STYLE};
    this.PAGE = {
        H1: this.H1,
        SECTIONS: [this.SECTION],
        FOOTER: this.FOOTER,
        STYLE: this.STYLE,
    };
}

export const DEFAULTS = new Defaults();
