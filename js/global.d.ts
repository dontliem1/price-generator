declare type html2canvasOptions = Partial<{backgroundColor: CSSStyleDeclaration.color, scale: number, windowWidth: number, windowHeight: number}>;
declare function html2canvas(element: Element, options?: html2canvasOptions): Promise<HTMLCanvasElement>;
declare interface CSSStyleDeclaration {
    'backdropFilter': string;
}
declare type Category = {type: 'CATEGORY'; H2?: string};
declare type Service = {type: 'SERVICE'; H3?: string; SPAN?: string; P?: string;};
declare type Items = (Category | Service)[];
declare type PageStyle = Partial<{backgroundColor: string, backgroundImage: string, color: string, justifyContent: string, opacity: string}>;
declare type PagesStyle = Partial<{aspectRatio: string}>;
declare type Page = Partial<{H1: string, ITEMS: Items, FOOTER: string, STYLE: PageStyle}>;
declare type Pages = Partial<{PAGES: Page[]; STYLE: PagesStyle}>;
declare type EditableTags = 'H1' | 'H2' | 'H3' | 'P' | 'FOOTER' | 'SPAN';