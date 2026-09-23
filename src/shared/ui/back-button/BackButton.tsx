import type {ButtonHTMLAttributes} from "react";

import {cn} from "@src/shared/lib";
import {ArrowIcon} from "@src/shared/assets/icons";

import styles from "./BackButton.module.scss";

interface BackButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label?: string;
}

export function BackButton({label = "Назад", className, type = "button", ...props}: BackButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.backButton, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      <ArrowIcon className={styles.icon} aria-hidden/>
    </button>
  );
}
