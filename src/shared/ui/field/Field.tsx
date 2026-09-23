import type {ReactNode} from "react";

import {cn} from "@src/shared/lib";

import styles from "./Field.module.scss";

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({label, htmlFor, hint, error, className, children}: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>

      {children}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}
