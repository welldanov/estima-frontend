import {useState, type SubmitEventHandler} from "react";
import {Navigate} from "react-router-dom";

import {
  APARTMENT_AREA as AREA,
  APARTMENT_FLOORS as FLOORS,
  getStepNumber,
  useStepBack,
  useStepForward,
  useValuationStore,
  validateApartment,
  VALUATION_STEPS_TOTAL,
} from "@src/features/valuation";
import {cn} from "@src/shared/lib";
import {Button, Field, NumberInput, StepIndicator} from "@src/shared/ui";

import styles from "./ApartmentDetailsPage.module.scss";

const ROOM_OPTIONS = [
  {label: "Студия", value: "studio"},
  {label: "1", value: 1},
  {label: "2", value: 2},
  {label: "3", value: 3},
  {label: "4", value: 4},
  {label: "5+", value: 5},
] as const;

type RoomValue = (typeof ROOM_OPTIONS)[number]["value"];
type NumberField = "areaM2" | "floor" | "floorsTotal";

export function ApartmentDetailsPage() {
  const stepForward = useStepForward();
  const stepBack = useStepBack();

  const propertyType = useValuationStore((state) => state.propertyType);
  const address = useValuationStore((state) => state.address);
  const apartment = useValuationStore((state) => state.apartment);
  const setApartmentDetails = useValuationStore((state) => state.setApartmentDetails);

  const [touched, setTouched] = useState<Partial<Record<NumberField, boolean>>>(() => ({
    areaM2: apartment.areaM2 != null,
    floor: apartment.floor != null,
    floorsTotal: apartment.floorsTotal != null,
  }));

  if (propertyType !== "apartment") {
    return <Navigate to="/" replace/>;
  }

  if (!address) {
    return <Navigate to="/predict/address" replace/>;
  }

  const {areaM2, rooms, isStudio, floor, floorsTotal} = apartment;

  const {areaError, floorError, floorsTotalError, isValid: canContinue} = validateApartment(apartment);

  const floorTouched = touched.floor || touched.floorsTotal;

  const touch = (field: NumberField) => () => {
    setTouched((prev) => ({...prev, [field]: true}));
  };

  const handleRoomsChange = (value: RoomValue) => {
    setApartmentDetails(
      value === "studio"
        ? {isStudio: true, rooms: null}
        : {isStudio: false, rooms: value},
    );
  };


  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (canContinue) {
      stepForward("/predict/result");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header>
          <StepIndicator current={getStepNumber("details")} total={VALUATION_STEPS_TOTAL}/>

          <h1 className={styles.title}>Параметры квартиры</h1>
          <p className={styles.description}>Чем точнее данные, тем точнее оценка</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <section className={styles.address} aria-label="Адрес объекта">
              <div className={styles.addressText}>
                <span className={styles.addressCaption}>Адрес</span>
                <span className={styles.addressLabel} title={address.label}>{address.label}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={() => stepBack("/predict/address")}>
                Изменить
              </Button>
            </section>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Количество комнат</legend>

              <div className={styles.rooms}>
                {ROOM_OPTIONS.map((option) => {
                  const checked = option.value === "studio"
                    ? isStudio
                    : !isStudio && rooms === option.value;

                  return (
                    <label key={option.value} className={cn(styles.room, checked && styles.roomChecked)}>
                      <input
                        type="radio"
                        name="rooms"
                        className={styles.roomInput}
                        checked={checked}
                        onChange={() => handleRoomsChange(option.value)}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Общая площадь" htmlFor="area" error={touched.areaM2 ? areaError : null}>
              <NumberInput
                id="area"
                stepLabel="площадь"
                enterKeyHint="next"
                placeholder="Например, 45"
                suffix="м²"
                value={areaM2}
                onChange={(value) => setApartmentDetails({areaM2: value})}
                onBlur={touch("areaM2")}
                min={AREA.min}
                max={AREA.max}
                fractionDigits={1}
                invalid={touched.areaM2 && areaError != null}
              />
            </Field>

            <div className={styles.floorRow}>
              <Field label="Этаж" htmlFor="floor" error={floorTouched ? floorError : null}>
                <NumberInput
                  id="floor"
                  stepLabel="этаж"
                  enterKeyHint="next"
                  value={floor}
                  onChange={(value) => setApartmentDetails({floor: value})}
                  onBlur={touch("floor")}
                  min={FLOORS.min}
                  max={FLOORS.max}
                  invalid={floorTouched && floorError != null}
                />
              </Field>

              <Field label="Этажей в доме" htmlFor="floors-total" error={floorTouched ? floorsTotalError : null}>
                <NumberInput
                  id="floors-total"
                  stepLabel="этажность"
                  enterKeyHint="done"
                  value={floorsTotal}
                  onChange={(value) => setApartmentDetails({floorsTotal: value})}
                  onBlur={touch("floorsTotal")}
                  min={FLOORS.min}
                  max={FLOORS.max}
                  invalid={floorTouched && (floorsTotalError ?? floorError) != null}
                />
              </Field>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={!canContinue} className={styles.submit}>
            Рассчитать стоимость
          </Button>
        </form>
      </div>
    </main>
  );
}
