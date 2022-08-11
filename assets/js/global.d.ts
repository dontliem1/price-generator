declare type HtmlToCanvasOptions = Partial<{ backgroundColor: CSSStyleDeclaration["color"], scale: number, windowWidth: number, windowHeight: number }>;
//@ts-ignore
declare function html2canvas(element: Element, options?: HtmlToCanvasOptions): Promise<HTMLCanvasElement>;
declare type Category = { type: 'CATEGORY'; H2?: string };
declare type Service = { type: 'SERVICE'; H3?: string; SPAN?: string; P?: string; };
declare type Items = (Category | Service)[];
declare type PagesStyle = Partial<{ aspectRatio: CSSStyleDeclaration["aspectRatio"] }>;
declare type Page = Partial<{ H1: string, ITEMS: Items, FOOTER: string, STYLE: Partial<CSSStyleDeclaration> }>;
declare type Pages = Partial<{ PAGES: Page[]; STYLE: PagesStyle }>;
declare type EditableTags = 'H1' | 'H2' | 'H3' | 'P' | 'FOOTER' | 'SPAN';
declare const messages: {
    H1: string;
    H2: string;
    H3: string;
    P: string;
    SPAN: string;
    FOOTER: string;
    PRICE: string;
    ITEMS: Items;
    EXAMPLE_FOOTER: string;
    FILE_LOAD_ERROR: string;
    REMOVE_ELEMENT: string;
    REMOVE_PAGE: string;
    IMPORT_CONFIRM: string;
    LOAD_CONFIRM: string;
    PAGES: string;
};