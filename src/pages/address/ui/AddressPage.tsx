import type {SubmitEventHandler} from "react";
import {Navigate} from "react-router-dom";

import {AddressSearch} from "@src/features/search-address";
import {CitySelect} from "@src/features/select-city";
import {getStepNumber, useStepForward, useValuationStore, VALUATION_STEPS_TOTAL} from "@src/features/valuation";
import {Button, StepIndicator} from "@src/shared/ui";

import styles from "./AddressPage.module.scss";

export function AddressPage() {
  const stepForward = useStepForward();

  const propertyType = useValuationStore((state) => state.propertyType);
  const cityId = useValuationStore((state) => state.cityId);
  const address = useValuationStore((state) => state.address);

  const setCityId = useValuationStore((state) => state.setCityId);
  const setAddress = useValuationStore((state) => state.setAddress);

  if (!propertyType) {
    return <Navigate to="/" replace/>;
  }

  const canContinue = cityId != null && address != null;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (canContinue) {
      stepForward("/predict/details");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header>
          <StepIndicator current={getStepNumber("address")} total={VALUATION_STEPS_TOTAL}/>

          <h1 className={styles.title}>Где находится объект?</h1>
          <p className={styles.description}>Укажите город и адрес объекта</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <CitySelect value={cityId} onChange={setCityId}/>

            <AddressSearch
              key={cityId ?? "no-city"}
              cityId={cityId}
              value={address}
              onChange={setAddress}
            />
          </div>

          <Button type="submit" fullWidth disabled={!canContinue} className={styles.submit}>
            Продолжить
          </Button>
        </form>
      </div>
    </main>
  );
}
