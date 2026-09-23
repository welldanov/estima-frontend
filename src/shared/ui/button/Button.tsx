import type {ButtonHTMLAttributes, ReactNode, Ref} from "react";

import {cn} from "@src/shared/lib";
import {Spinner} from "../spinner";

import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "soft" | "ghost";
type ButtonSize = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  ref,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  icon,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner/>
      ) : (
        icon && <span className={styles.icon} aria-hidden="true">{icon}</span>
      )}

      {children}
    </button>
  );
}
