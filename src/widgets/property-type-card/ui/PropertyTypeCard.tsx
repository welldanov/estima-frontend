import type {ReactNode} from "react";
import type {PropertyType} from "../../../entities/property";

import {ArrowIcon} from "../../../shared/ui";

import styles from "./PropertyTypeCard.module.scss";

interface PropertyTypeCardProps {
    type: PropertyType;
    title: string;
    icon: ReactNode;
    onClick: (type: PropertyType) => void;
}

export function PropertyTypeCard({
                                     type,
                                     title,
                                     icon,
                                     onClick,
                                 }: PropertyTypeCardProps) {
    return (
        <button
            type="button"
            className={styles.card}
            onClick={() => onClick(type)}
        >
            <span className={styles.icon}>
                {icon}
            </span>

            <span className={styles.content}>
                <span className={styles.title}>
                    {title}
                </span>

                {type !== "apartment" && (
                    <span className={styles.beta}>
                        Beta
                    </span>
                )}
            </span>

            <span className={styles.arrow}>
                <ArrowIcon/>
             </span>
        </button>
    );
}