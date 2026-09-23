import {cn} from "@src/shared/lib";

import styles from "./Spinner.module.scss";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({className, label = "Загрузка"}: SpinnerProps) {
  return (
    <span
      className={cn(styles.spinner, className)}
      role="status"
      aria-label={label}
    />
  );
}
