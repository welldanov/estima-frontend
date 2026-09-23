import type {ReactNode} from "react";

import type {PropertyType} from "@src/entities/property";
import {ArrowIcon} from "@src/shared/assets/icons";

import styles from "./PropertyTypeCard.module.scss";

interface PropertyTypeCardProps {
  type: PropertyType;
  title: string;
  description?: string;
  icon: ReactNode;
  beta?: boolean;
  onClick: (type: PropertyType) => void;
}

export function PropertyTypeCard({
  type,
  title,
  description,
  icon,
  beta = false,
  onClick,
}: PropertyTypeCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      // Бета-типы пока без страниц деталей — показываем, но не даём выбрать
      disabled={beta}
      onClick={() => onClick(type)}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>

      <span className={styles.content}>
        <span className={styles.heading}>
          <span className={styles.title}>{title}</span>
          {beta && <span className={styles.beta}>Beta</span>}
        </span>

        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </span>

      {!beta && <ArrowIcon className={styles.arrow} aria-hidden="true"/>}
    </button>
  );
}
