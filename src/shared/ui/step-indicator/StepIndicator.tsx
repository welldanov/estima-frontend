import {cn} from "@src/shared/lib";

import styles from "./StepIndicator.module.scss";

interface StepIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function StepIndicator({current, total, className}: StepIndicatorProps) {
  return (
    <div className={cn(styles.stepIndicator, className)}>
      <span className={styles.label}>
        Шаг {current} из {total}
      </span>

      <div className={styles.track} aria-hidden="true">
        {Array.from({length: total}, (_, index) => (
          <span
            key={index}
            className={cn(styles.segment, index < current && styles.segmentDone)}
          />
        ))}
      </div>
    </div>
  );
}
