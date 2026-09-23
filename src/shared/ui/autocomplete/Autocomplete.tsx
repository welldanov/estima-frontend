import {useEffect, useId, useRef, useState, type KeyboardEvent} from "react";

import {CloseIcon} from "@src/shared/assets/icons";
import {cn, handleEnterKeyHint} from "@src/shared/lib";
import {Input, type InputProps} from "../input";
import {Spinner} from "../spinner";

import styles from "./Autocomplete.module.scss";

export interface AutocompleteProps<T>
  extends Omit<InputProps, "value" | "onChange" | "onSelect" | "role"> {
  value: string;
  onValueChange: (value: string) => void;

  items: T[];
  getItemKey: (item: T) => string;
  getItemLabel: (item: T) => string;
  getItemDescription?: (item: T) => string | undefined;
  onSelect: (item: T) => void;
  loading?: boolean;
  emptyText?: string;
  /** Показать крестик очистки (при непустом значении) */
  clearable?: boolean;
  onClear?: () => void;
  /** После очистки поставить фокус в поле и открыть список (иначе — просто сбросить) */
  focusOnClear?: boolean;
  /** Снимать фокус после выбора тапом/кликом — на телефоне закрывается клавиатура */
  blurOnSelect?: boolean;
}

// Отступ списка от нижнего края видимой области (над клавиатурой)
const LIST_VIEWPORT_GAP = 12;
const LIST_MIN_HEIGHT = 120;

export function Autocomplete<T>({
  value,
  onValueChange,
  items,
  getItemKey,
  getItemLabel,
  getItemDescription,
  onSelect,
  loading,
  emptyText,
  endSlot,
  clearable,
  onClear,
  focusOnClear = true,
  blurOnSelect = true,
  onFocus,
  onBlur,
  ...inputProps
}: AutocompleteProps<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasItems = items.length > 0;
  const isListVisible = isOpen && (hasItems || Boolean(emptyText));
  const safeActiveIndex = activeIndex < items.length ? activeIndex : -1;

  const isClearVisible = Boolean(clearable && onClear && value && !inputProps.disabled);
  const endContent = loading ? <Spinner label="Поиск"/> : endSlot;

  const getOptionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (safeActiveIndex < 0) {
      return;
    }

    document
      .getElementById(getOptionId(safeActiveIndex))
      ?.scrollIntoView({block: "nearest"});
  });

  // Список не должен уходить под клавиатуру: ограничиваем высоту видимой областью (visualViewport)
  useEffect(() => {
    const list = listRef.current;
    const viewport = window.visualViewport;

    if (!isListVisible || !list || !viewport) {
      return;
    }

    const update = () => {
      const visibleBottom = viewport.offsetTop + viewport.height;
      const available = visibleBottom - list.getBoundingClientRect().top - LIST_VIEWPORT_GAP;

      list.style.setProperty("--available-height", `${Math.max(available, LIST_MIN_HEIGHT)}px`);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("scroll", update);
    };
  }, [isListVisible]);

  const getInput = () => rootRef.current?.querySelector("input") ?? null;

  const selectItem = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Enter") {
      const activeItem = isListVisible && safeActiveIndex >= 0 ? items[safeActiveIndex] : undefined;

      // Выбран стрелками — выбираем и остаёмся в поле (навигация с клавиатуры)
      if (activeItem) {
        event.preventDefault();
        selectItem(activeItem);
        return;
      }

      // «Далее»/«Готово» на мобильной клавиатуре: единственный вариант выбираем сразу
      const input = event.currentTarget;

      if (input.enterKeyHint === "next" || input.enterKeyHint === "done") {
        event.preventDefault();

        if (isListVisible && items.length === 1) {
          selectItem(items[0]);
        }

        handleEnterKeyHint(input);
      }

      return;
    }

    if (!hasItems) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((safeActiveIndex + 1) % items.length);
        break;

      case "ArrowUp":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex(safeActiveIndex <= 0 ? items.length - 1 : safeActiveIndex - 1);
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={styles.autocomplete}
      onClick={(event) => {
        if (inputProps.disabled || (event.target as Element).closest("[role='listbox']")) {
          return;
        }

        // Клик по любой части поля (в т.ч. стрелке) открывает список, даже если фокус уже внутри
        setIsOpen(true);
      }}
    >
      <Input
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="sentences"
        spellCheck={false}
        {...inputProps}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isListVisible}
        aria-controls={listId}
        aria-activedescendant={
          isListVisible && safeActiveIndex >= 0 ? getOptionId(safeActiveIndex) : undefined
        }
        value={value}
        endSlot={(isClearVisible || endContent) && (
          <>
            {isClearVisible && (
              <button
                type="button"
                className={styles.clear}
                aria-label="Очистить"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  onClear?.();
                  setActiveIndex(-1);

                  const input = getInput();

                  if (focusOnClear) {
                    input?.focus();
                    return;
                  }

                  // Не даём клику всплыть до обёртки, которая открывает список
                  event.stopPropagation();
                  input?.blur();
                  setIsOpen(false);
                }}
              >
                <CloseIcon aria-hidden/>
              </button>
            )}

            {endContent}
          </>
        )}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={(event) => {
          setIsOpen(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsOpen(false);
          onBlur?.(event);
        }}
        onKeyDown={handleKeyDown}
      />

      {isListVisible && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={styles.list}
          onMouseDown={(event) => event.preventDefault()}
        >
          {hasItems ? (
            items.map((item, index) => {
              const description = getItemDescription?.(item);

              return (
                <li
                  key={getItemKey(item)}
                  id={getOptionId(index)}
                  role="option"
                  aria-selected={index === safeActiveIndex}
                  className={cn(styles.option, index === safeActiveIndex && styles.optionActive)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    selectItem(item);

                    // Фокус держался в поле (preventDefault на mousedown списка). Если его оставить,
                    // Android после смены значения снова открывает клавиатуру, даже если её скрыли.
                    if (blurOnSelect) {
                      getInput()?.blur();
                    }
                  }}
                >
                  <span className={styles.optionLabel}>{getItemLabel(item)}</span>

                  {description && (
                    <span className={styles.optionDescription}>{description}</span>
                  )}
                </li>
              );
            })
          ) : (
            <li className={styles.empty}>{emptyText}</li>
          )}
        </ul>
      )}
    </div>
  );
}
