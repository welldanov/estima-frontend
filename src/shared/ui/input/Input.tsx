import type {InputHTMLAttributes, ReactNode, Ref} from "react";

import {cn} from "@src/shared/lib";

import styles from "./Input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  startSlot?: ReactNode;
  endSlot?: ReactNode;
  invalid?: boolean;
}

export function Input({
  ref,
  startSlot,
  endSlot,
  invalid,
  disabled,
  className,
  ...props
}: InputProps) {
  return (
    <div
      className={cn(
        styles.control,
        invalid && styles.invalid,
        disabled && styles.disabled,
        className,
      )}
      onMouseDown={(event) => {
        const target = event.target as Element;

        // Клик по рамке/слоту (не по input и не по кнопке) — фокусируем input
        if (!disabled && !target.closest("input, button")) {
          event.preventDefault();
          event.currentTarget.querySelector("input")?.focus();
        }
      }}
    >
      {startSlot && <span className={styles.slot}>{startSlot}</span>}

      <input
        ref={ref}
        className={cn(styles.input, Boolean(endSlot) && styles.fadeEnd)}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...props}
      />

      {endSlot && <span className={styles.slot}>{endSlot}</span>}
    </div>
  );
}
