'use strict';

const MESSAGES = {
    H1: 'Заголовок',
    H2: 'Категория',
    B: 'Название услуги',
    P: 'Цена',
    SPAN: 'Описание услуги',
    FOOTER: 'Дополнительный текст',
    COPY: " копия",
    FILE_LOAD_ERROR: "Не удалось загрузить файл",
    REMOVE_SERVICE: 'Удалить услугу целиком?',
    REMOVE_PAGE: 'Удалить страницу?',
    IMPORT_CONFIRM: 'Это сотрёт текущий прайс. Продолжить?',
    LOAD_CONFIRM: 'Загрузить последний прайс, над которым вы работали? Он будет без картинок.',
    PAGES: '{"PAGES":[{"STYLE":{"backgroundColor":"rgb(0, 0, 0)","color":"rgb(255, 255, 255)","justifyContent":"flex-end","opacity":"0","textAlign":"right"},"H1":"РУТИНА","FOOTER":"Инструкция в карусели →"},{"STYLE":{"backgroundColor":"rgb(50, 50, 50)","color":"rgb(255, 255, 255)","opacity":"0.5"},"ITEMS":[{"type":"SERVICE","B":"Составьте свой прайс лист","P":"Нажмите на текст, чтобы его изменить, или добавьте ещё элементов"},{"type":"SERVICE","B":"Делитесь результатом","SPAN":"🖼"},{"type":"SERVICE","B":"Сохраните в JSON-файл","SPAN":"📄","P":"Чтобы потом вновь загрузить и поправить"},{"type":"SERVICE","B":"Выберите формат","SPAN":"4:5","P":"В ленту или для сторис"},{"type":"SERVICE","B":"Меняйте пункты местами","SPAN":"⇅"},{"type":"SERVICE","B":"Выберите цвета, шрифт и фоновую картинку","SPAN":"Aa","P":"Нажав на свободное место на странице ↓"}]},{"STYLE":{"backgroundColor":"rgb(0, 0, 0)","color":"rgb(230, 228, 200)","opacity":"0.3"},"H1":"Пример прайса","ITEMS":[{"type":"CATEGORY","H2":"Брови"},{"type":"SERVICE","B":"Архитектура бровей","SPAN":"1400","P":"моделирование + окрашивание + коррекция"},{"type":"SERVICE","B":"Долговременная укладка","SPAN":"2000"},{"type":"CATEGORY","H2":"Ресницы"},{"type":"SERVICE","B":"Окрашивание ресниц","SPAN":"400"},{"type":"SERVICE","B":"Снятие наращённых ресниц","SPAN":"300"}],"FOOTER":"Записывайтесь в директ"}],"STYLE":{"aspectRatio":"4 / 5"}}',
};

/** @type {Page[]} */
const PAGES = [
    {
        H1: 'РУТИНА',
        FOOTER: "Инструкция в карусели →",
        STYLE: {
            backgroundImage: 'linear-gradient(180deg, #ffd200 0, #ffbf00 12.5%, #ffaa00 25%, #ff9314 37.5%, #f37b1f 50%, #e26426 62.5%, #d3502c 75%, #c53f30 87.5%, #b93035 100%)',
            justifyContent: 'flex-end',
            textAlign: 'right'
        },
    },
    {
        ITEMS: [
            {
                type: "SERVICE",
                B: "Составьте свой прайс лист",
                P: "Нажмите на текст, чтобы его изменить, или добавьте ещё элементов"
            },
            {
                type: "SERVICE",
                B: "Делитесь результатом",
                SPAN: "🖼"
            },
            {
                type: "SERVICE",
                B: "Сохраните в JSON-файл",
                SPAN: "📄",
                P: "Чтобы потом вновь загрузить и поправить"
            },
            {
                type: "SERVICE",
                B: "Выберите формат",
                SPAN: "4:5",
                P: "В ленту или для сторис"
            },
            {
                type: "SERVICE",
                B: "Меняйте пункты местами",
                SPAN: "⇅"
            },
            {
                type: "SERVICE",
                B: "Выберите цвета, шрифт и фоновую картинку",
                SPAN: "Aa",
                P: "Нажав на свободное место на странице ↓"
            }
        ],
        STYLE: {
            backgroundColor: 'rgb(50, 50, 50)',
            color: 'rgb(255, 255, 255)',
            opacity: '0.5'
        },
    },
    {
        H1: 'Пример прайса',
        ITEMS: [
            {
                type: "CATEGORY",
                H2: "Брови"
            },
            {
                type: "SERVICE",
                B: "Архитектура бровей",
                SPAN: "1400",
                P: "моделирование + окрашивание + коррекция"
            },
            {
                type: "SERVICE",
                B: "Долговременная укладка",
                SPAN: "2000"
            },
            {
                type: "CATEGORY",
                H2: "Ресницы"
            },
            {
                type: "SERVICE",
                B: "Окрашивание ресниц",
                SPAN: "400"
            },
            {
                type: "SERVICE",
                B: "Снятие наращённых ресниц",
                SPAN: "300"
            }
        ],
        FOOTER: "Записывайтесь в директ",
        STYLE: {
            backgroundColor: 'rgb(0, 0, 0)',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, 0) 100%), radial-gradient(at left bottom, rgba(0, 200, 255, 1) 0%, rgba(0, 200, 255, 0) 80%), linear-gradient(135deg, rgba(50, 50, 120, 0) 0%, rgba(50, 50, 120, 0) 75%, rgba(50, 50, 120, 1) 100%), linear-gradient(75deg, rgba(100, 100, 0, 1) 0%, rgba(200, 100, 100, 1) 17%, rgba(200, 150, 40, 1) 74%, rgba(200, 100, 30, 1) 100%)',
            color: 'rgb(230, 228, 200)',
            opacity: '0.3',
        },
    }
];
