declare type HtmlToCanvasOptions = Partial<{ allowTaint: boolean, backgroundColor: CSSStyleDeclaration["color"]|null, scale: number, windowWidth: number, windowHeight: number }>;
declare function ym(counter: number, event: string, id: string): void;
declare function html2canvas(element: Element, options?: HtmlToCanvasOptions): Promise<HTMLCanvasElement>;
declare type Category = { type: 'CATEGORY'; [CATEGORY_TAG]?: string };
declare type Service = { type: 'SERVICE'; [SERVICE_NAME_TAG]?: string; [SERVICE_DESCRIPTION_TAG]?: string; [SERVICE_PRICE_TAG]?: string; };
declare type PagesStyle = Partial<Pick<CSSStyleDeclaration, "aspectRatio">>;
declare type Page = Partial<{ [TITLE_TAG]: string, ITEMS: (Category | Service)[], [FOOTER_TAG]: string, STYLE: Partial<CSSStyleDeclaration> }>;
declare type Pages = Partial<{ PAGES: Page[]; STYLE: PagesStyle }>;
declare type MESSAGES = {
    [TITLE_TAG]: string;
    [CATEGORY_TAG]: string;
    [SERVICE_NAME_TAG]: string;
    [SERVICE_PRICE_TAG]: string;
    [SERVICE_DESCRIPTION_TAG]: string;
    [FOOTER_TAG]: string;
    COPY: string;
    FILE_LOAD_ERROR: string;
    REMOVE_SERVICE: string;
    REMOVE_PAGE: string;
    IMPORT_CONFIRM: string;
    LOAD_CONFIRM: string;
    PAGES: string;
};
