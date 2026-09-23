
import {useStepForward, useValuationStore} from "@src/features/valuation";
import {PropertyTypeSelector} from "@src/features/select-property-type";
import type {PropertyType} from "@src/entities/property";

import homeImage from "@src/shared/assets/images/home-illustration.webp";

import styles from "./HomePage.module.scss";

export function HomePage() {
  const stepForward = useStepForward();

  const setPropertyType = useValuationStore((state) => state.setPropertyType);

  const handlePropertyTypeChange = (type: PropertyType) => {
    setPropertyType(type);

    stepForward("/predict/address");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header>
          <h1 className={styles.title}>Оценка недвижимости</h1>
          <p className={styles.description}>
            Узнайте примерную стоимость вашего объекта за&nbsp;пару минут
          </p>
        </header>

        <div className={styles.illustration}>
          <img src={homeImage} alt="" width={800} height={500} fetchPriority="high"/>
        </div>

        <PropertyTypeSelector
          onChange={handlePropertyTypeChange}
          className={styles.selector}
        />
      </div>
    </main>
  );
}
