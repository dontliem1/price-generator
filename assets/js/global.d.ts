declare interface CSSStyleDeclaration {
    'backdropFilter': string;
}
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