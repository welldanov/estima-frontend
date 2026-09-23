const SKIPPED_TYPES = new Set(["hidden", "radio", "checkbox", "submit", "button", "reset"]);

function getNextField(input: HTMLInputElement): HTMLInputElement | null {
  const fields = Array.from(input.form?.elements ?? []).filter(
    (element): element is HTMLInputElement =>
      element instanceof HTMLInputElement && !element.disabled && !SKIPPED_TYPES.has(element.type),
  );

  return fields.find(
    (field) => input.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING,
  ) ?? null;
}

/**
 * Enter в поле с enterKeyHint «next»/«done» (кнопка «Далее»/«Готово» на мобильной клавиатуре):
 * next — фокус в следующее текстовое поле формы (нет его — снять фокус), done — снять фокус.
 * Возвращает true, если Enter обработан — тогда вызывающий делает preventDefault, чтобы не отправить форму.
 */
export function handleEnterKeyHint(input: HTMLInputElement): boolean {
  const hint = input.enterKeyHint;

  if (hint !== "next" && hint !== "done") {
    return false;
  }

  // Ждём коммит React: следующее поле могло только что стать доступным (город → адрес)
  setTimeout(() => {
    const next = hint === "next" ? getNextField(input) : null;

    if (next) {
      next.focus();
    } else {
      input.blur();
    }
  });

  return true;
}
