function Defaults() {
    this.H1 = 'Заголовок страницы';
    this.H2 = 'Категория';
    this.H3 = 'Название услуги';
    this.P = 'Цена';
    this.SPAN = 'Описание услуги';
    this.FOOTER = 'Подпись страницы';
    this.LI = {H3: this.H3, P: this.P, SPAN: this.SPAN};
    this.SECTION = {H2: this.H2, UL: [this.LI, this.LI, this.LI]};
    this.PAGE = {H1: this.H1, SECTIONS: [this.SECTION], FOOTER: this.FOOTER};
}

export const DEFAULTS = new Defaults();