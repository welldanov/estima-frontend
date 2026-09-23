# estima-frontend

SPA для оценки рыночной стоимости недвижимости по городам. Пользователь проходит визард
(тип объекта → адрес → параметры → результат; расчёт идёт прямо на странице результата), бэкенд (ML-модель) возвращает цену.
Интерфейс на русском, mobile-first.

## Стек
- React 19 + TypeScript 6 + Vite 8, React Compiler (babel-плагин) — `useMemo`/`useCallback` обычно не нужны
- react-router-dom 7 (`BrowserRouter`, `<Routes>`), zustand 5 (`persist` → `sessionStorage`, ключ `estima-valuation`)
- SCSS Modules (`*.module.scss`, импорт как `styles`), шрифт Geometria (100/300/400/500/700/800, только normal; нет 600 — `font-weight: 600` рендерится как 700)
- Нет: тестов, i18n, внешних UI-/fetch-библиотек

## Команды
- Dev-сервер пользователь **уже держит запущенным** на http://localhost:5173 — не запускать второй, сразу открывать в браузере
- `npm run build` (tsc -b + vite build) — проверка типов; `npm run lint` — eslint
- API проксируется: `/api/*` → `http://127.0.0.1:8000` (бэкенд отдельный, может быть не запущен)

## Архитектура — Feature-Sliced Design
Слои (импорт только сверху вниз): `app → pages → widgets → features → entities → shared`
```
src/app/         App.tsx, router/AppRouter.tsx, layouts/Layout (max-width 600px, по центру; AppHeader + обёртка с `key={pathname}` — общий переход между страницами), styles/, index.scss
src/pages/       home, address, details (ApartmentDetailsPage), result — каждая: index.ts + ui/
src/widgets/     (пока пусто)
src/features/    select-property-type (PropertyTypeSelector + внутренняя PropertyTypeCard), select-city (CitySelect + useCities), search-address (AddressSearch + useAddressSuggestions),
                 valuation (store + usePrediction + steps.ts: VALUATION_STEPS, getStepNumber, VALUATION_STEPS_TOTAL
                 + stepNavigation.ts: useStepForward/useStepBack + apartment.ts: validateApartment, APARTMENT_AREA/FLOORS)
src/entities/    property (PropertyType), city (City, getCities), address (AddressSuggestion, SelectedAddress, searchAddresses, formatAddress),
                 prediction (Prediction, ApartmentPredictionParams, predictApartment — маппинг snake_case ↔ camelCase)
src/shared/      api/ (request<T>, ApiError, isAbortError), lib/ (cn, useDebouncedValue, useCountUp, handleEnterKeyHint),
                 ui/ (компоненты ниже + styles/_control.scss),
                 assets/ fonts/geometria/*.woff2 · images/*.webp · icons/*.svg + index.ts
public/          favicon.svg (отдаётся как есть, в index.html `href="/favicon.svg"`)
```
Иконки — `.svg` в `shared/assets/icons`, компоненты через `vite-plugin-svgr` (`?react`), импорт `{ArrowIcon, …} from "@src/shared/assets/icons"`.
Новая иконка: положить `.svg` (цвет через `currentColor`) и добавить строку в `icons/index.ts`. Иконки типов объектов — Lucide (ISC, stroke-width 1.75), новые брать оттуда же для единого стиля.
Слайс = `index.ts` (public API) + `ui/` / `model/` / `api/` / `lib/`. Импортировать слайс через его `index.ts`.
Импорты: между слайсами/слоями — алиас `@src/...` (`@src/shared/ui`, `@src/features/valuation`), внутри слайса — относительно (`../model/x`).
`../../` запрещён eslint (`no-restricted-imports`). Алиас задан в `tsconfig.app.json` (paths) и `vite.config.ts` (resolve.alias) — менять оба. В SCSS `url('@src/...')` тоже работает.
API-запросы — в `entities/*/api` через `shared/api/request`, загрузка/состояние — хуки в `features/*/model`. Страница только собирает.

## UI-кит (`shared/ui`, всё из `shared/ui/index.ts`)
- `Input` — рамка + `<input>`; `startSlot`/`endSlot` (лоадер, «м²», кнопки ±), `invalid`; `className` → на рамку, прочие пропсы → на input; клик по рамке/слоту фокусирует input
- `NumberInput` — Input + кнопки ± (`value: number | null`, `min/max/step`, `fractionDigits`, `suffix`, `stepLabel` для aria); `type="text"` + inputMode, запятая как разделитель, ↑↓ с клавиатуры
- `Field` — label + контрол + `hint`/`error` (связь через `htmlFor`/`useId`)
- `Autocomplete<T>` — Input + listbox (ARIA combobox, ↑↓ Enter Esc), `items/getItemKey/getItemLabel/getItemDescription/onSelect`, `loading`, `emptyText`; открывается по фокусу и клику по полю; `clearable` + `onClear` — крестик очистки при непустом значении. На телефоне: выбор тапом снимает фокус (`blurOnSelect`, иначе Android снова открывает клавиатуру), высота списка ограничена `visualViewport` (не уходит под клавиатуру); по умолчанию `autoCorrect="off"`, `spellCheck={false}`. Выбор из списка (город) — тоже через него, нативного select в ките нет
- `Button` — `variant` primary|secondary|soft (второстепенное, синяя рамка)|ghost, `size` md|sm, `fullWidth`, `loading`, `icon`; `BackButton` (только шеврон 40×40, без рамки; используется в AppHeader); `Spinner`; `StepIndicator current/total`
- Стили полей — миксины `shared/ui/styles/_control.scss` (`control`, `control-invalid`, `control-disabled`, `control-native`); новые контролы строить на них
- Мобильная клавиатура: `enterKeyHint="next"` (Enter → следующее текстовое поле формы) / `"done"` (Enter → снять фокус) обрабатывают `Autocomplete` и `NumberInput` через `handleEnterKeyHint`; в Autocomplete Enter при единственном варианте выбирает его
- Для стейта формы через `key` пересоздаём компонент (пример: `<AddressSearch key={cityId}>`)

## Роуты и поток данных
| Роут | Страница | Что делает |
|---|---|---|
| `/` | HomePage | выбор типа → `setPropertyType` → `/predict/address` |
| `/predict/address` | AddressPage | `GET /api/cities`, `GET /api/addresses/search?city_id&query` → `{items}` (debounce 300мс, от 2 символов) → `cityId`, `address: {uri, label}` (смена города сбрасывает адрес в сторе) |
| `/predict/details` | ApartmentDetailsPage | комнаты/студия, площадь, этаж/этажность → `apartment` → `/predict/result`; без `propertyType=apartment` → `/`, без адреса → `/predict/address` |
| `/predict/result` | ResultPage | `usePrediction`: если `result` в сторе нет — `POST /api/predict` (мин. 800мс загрузки), скелетон → цена с count-up; ошибка + «Повторить»; `reset()`. Без данных — редирект на нужный шаг |
| `*` | → `/` | |

Шапка `app/layouts/AppHeader` (шеврон «назад» слева, логотип по центру — ссылка на `/` с `reset()` стора, «начать заново») — в Layout вне `key={pathname}`, не перемонтируется. Куда ведёт «назад» — таблица `BACK_ROUTES` там же (нет записи → шеврон скрыт, как на `/`); новый шаг визарда = новая запись.
Переходы по визарду — только через `useStepForward(to)` (кладёт `state.from`) и `useStepBack(backTo)`: `navigate(-1)`, если пришли с `backTo` кнопкой визарда, иначе `navigate(backTo, {replace})` — без циклов при заходе по ссылке/после редиректа. У каждого шага guard с `<Navigate replace>` на недостающий шаг (адрес — без `propertyType`; результат — `validateApartment(...).isValid`, та же проверка в форме деталей и `usePrediction`).
Layout при PUSH/REPLACE сбрасывает прокрутку (`behavior: "instant"` — в reset глобальный `scroll-behavior: smooth`), при POP прокрутку восстанавливает браузер. В страницах своей кнопки «назад» и логотипа нет.
Высота: Layout — `min-height: 100dvh` + flex-колонка, страница (`main.page` и `.container`) растягивается через `flex: 1`. **Не ставить `min-height: 100dvh` в страницах** — вместе с шапкой появится лишний скролл.

Бэкенд отдаёт snake_case, в сторе camelCase — маппинг в `entities/*/api`.
`result` в сторе всегда соответствует вводным: любой сеттер ввода (тип, город, адрес, детали) сбрасывает его в `null`.
Статусы этапов расчёта с бэкенда (стрим NDJSON) — задача на будущее, пока не делаем.

## Стили
- Палитра — 23 токена по назначению в `src/app/styles/_config.scss`. В компонентах **только токены, никаких hex**; новый цвет = новый токен
  - бренд: `--primary` `--primary-hover` `--on-primary` `--primary-text` `--primary-soft(-hover)` `--primary-border(-hover)`
  - текст: `--text` (основной), `--text-secondary` (подзаголовки, подписи), `--text-muted` (плейсхолдеры, иконки)
  - поверхности: `--bg` (страница), `--surface` (карточки, поля), `--surface-muted` (неактивное)
  - рамки: `--border`, `--border-subtle`, `--border-strong` (hover)
  - статусы: `--danger(-bg)`, `--success(-bg)`; эффекты: `--focus-ring` (кнопки, карточки — только `:focus-visible`), `--shadow-popover`. Поля ввода колец не имеют: фокус = рамка `--primary`, ошибка = рамка `--danger`
- Анимация — токены `--motion-fast` 150ms / `--motion-base` 220ms / `--motion-slow` 450ms, `--ease-out`. Уровни: переход страниц — только общий из Layout (только fade: translate даёт мелькание скролла), в страницах своё появление блоков не делать; микро-реакции (hover/press/focus) — везде; выразительное движение — только на результате (скелетон, count-up) и иллюстрация на home. Всегда `prefers-reduced-motion: reduce` → `animation: none`
- Reset глобально убирает `outline` — для интерактивных элементов нужен свой `:focus-visible`
- Карточки: `border 1px var(--border-subtle)`, `radius 16px`, фон `var(--surface)`; body `letter-spacing: -0.5px`, weight 500

## Код-стайл
- `.editorconfig`: 2 пробела, LF. Старые файлы местами с 4 пробелами — в правках следовать editorconfig, файлы целиком не переформатировать без просьбы
- Именованные экспорты, `function Component()` для страниц; `type`-импорты (`verbatimModuleSyntax`)
- Селекторы стора по одному полю: `useValuationStore((s) => s.x)`
- Тексты UI на русском, общение с пользователем — на русском

## Известные проблемы / TODO (не чинить без запроса, но учитывать)
- Реально поддерживается только `apartment`: house/land помечены BETA и на главной неактивны (`disabled`), для них нет страниц деталей, predict шлёт только apartment
- `images/home-illustration.webp` — обрезан по контенту (800×500, 58 КБ); исходник 1386×1135 PNG есть в первом коммите (`src/shared/assets/img/home-page-img.png`)
- Vite может закешировать файл пустым, если он перезаписан через `cat >` во время работы dev-сервера → `touch` файла и перезагрузка

## Правила работы (экономия токенов)
- Этот файл — источник правды о структуре; не пересканировать весь проект заново, читать только нужные файлы
- Файлы страниц большие (250–450 строк tsx/scss) — читать точечно (Grep/offset), а не целиком
- Не читать: `node_modules`, `package-lock.json`, `.idea`, шрифты, `public/`
- Для визуальной проверки — браузер на localhost:5173, viewport mobile (375×812), основной таргет — телефон
- Не коммитить без явной просьбы; ветка `main`
- При изменении структуры (новый слайс, роут, эндпоинт, токен) — обновить этот файл
