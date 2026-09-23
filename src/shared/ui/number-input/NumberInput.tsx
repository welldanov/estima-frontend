import {useState, type ChangeEvent, type InputHTMLAttributes, type KeyboardEvent} from "react";

import {handleEnterKeyHint} from "@src/shared/lib";

import {Input} from "../input";

import styles from "./NumberInput.module.scss";

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "inputMode"
>;

export interface NumberInputProps extends NativeProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Сколько знаков после запятой можно ввести; 0 — только целые. */
  fractionDigits?: number;
  invalid?: boolean;
  /** Подпись справа от значения, например «м²». */
  suffix?: string;
  /** Для aria-label кнопок ±: «Уменьшить {name}». */
  stepLabel?: string;
}

function parse(draft: string): number | null {
  if (draft === "" || draft === ".") {
    return null;
  }

  return Number(draft);
}

function format(value: number | null): string {
  return value == null ? "" : String(value);
}

// Точность шага: 0.1 + 0.2 не должно давать 0.30000000000000004.
function roundTo(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits;
  return Math.round(value * factor) / factor;
}

/**
 * Числовое поле: type="text" + inputMode вместо type="number" —
 * без смены значения колёсиком, без «e»/«-», с запятой на русской клавиатуре.
 * Черновик хранится локально, чтобы можно было набрать «45,» перед «5».
 */
export function NumberInput({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  fractionDigits = 0,
  invalid,
  suffix,
  stepLabel,
  disabled,
  onBlur,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState(() => format(value));

  // Значение поменяли снаружи (кнопки ±, сброс стора) — показываем его, а не черновик.
  const displayed = parse(draft) === value ? draft.replace(".", ",") : format(value).replace(".", ",");

  const pattern = fractionDigits > 0
    ? new RegExp(String.raw`^\d*(\.\d{0,${fractionDigits}})?$`)
    : /^\d*$/;

  const commit = (next: number | null) => {
    setDraft(format(next));
    onChange(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(",", ".").replace(/\s/g, "");

    if (!pattern.test(next)) {
      return;
    }

    const parsed = parse(next);

    if (parsed != null && parsed > max) {
      return;
    }

    setDraft(next);
    onChange(parsed);
  };

  const stepBy = (direction: 1 | -1) => {
    const base = value ?? (direction > 0 ? min - step : min + step);
    const next = roundTo(base + direction * step, fractionDigits);

    commit(Math.min(max, Math.max(min, next)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && handleEnterKeyHint(event.currentTarget)) {
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(event.key === "ArrowUp" ? 1 : -1);
    }
  };

  const canDecrement = !disabled && (value == null || value > min);
  const canIncrement = !disabled && (value == null || value < max);

  return (
    <Input
      {...props}
      type="text"
      inputMode={fractionDigits > 0 ? "decimal" : "numeric"}
      autoComplete="off"
      value={displayed}
      disabled={disabled}
      invalid={invalid}
      className={styles.control}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        // «45,» → «45»
        setDraft(format(value));
        onBlur?.(event);
      }}
      endSlot={
        <>
          {suffix && <span className={styles.suffix}>{suffix}</span>}

          {/* tabIndex -1: с клавиатуры шаг делается стрелками ↑↓ прямо в поле */}
          <span className={styles.stepper}>
            <button
              type="button"
              tabIndex={-1}
              className={styles.stepButton}
              disabled={!canDecrement}
              aria-label={stepLabel ? `Уменьшить ${stepLabel}` : "Уменьшить"}
              onClick={() => stepBy(-1)}
            >
              −
            </button>

            <button
              type="button"
              tabIndex={-1}
              className={styles.stepButton}
              disabled={!canIncrement}
              aria-label={stepLabel ? `Увеличить ${stepLabel}` : "Увеличить"}
              onClick={() => stepBy(1)}
            >
              +
            </button>
          </span>
        </>
      }
    />
  );
}
