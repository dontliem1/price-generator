declare function html2canvas(el: HTMLElement): Promise<HTMLCanvasElement>;
declare interface CSSStyleDeclaration {
    'backdropFilter': string;
}
declare type Category = {type: 'CATEGORY'; H2?: string};
declare type Service = {type: 'SERVICE'; H3?: string; SPAN?: string; P?: string;};
declare type Items = (Category | Service)[];
declare type PageStyle = {backgroundColor?: string, backgroundImage?: string, color?: string, justifyContent?: string, opacity?: string};
declare type PagesStyle = {aspectRatio?: string};
declare type Page = {H1?: string, ITEMS?: Items, FOOTER?: string, STYLE?: PageStyle};
declare type Pages = {PAGES?: Page[]; STYLE?: PagesStyle};
declare type EditableTags = 'H1' | 'H2' | 'H3' | 'P' | 'FOOTER' | 'SPAN';