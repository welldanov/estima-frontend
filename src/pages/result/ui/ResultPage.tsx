import {useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";

import {usePrediction, useValuationStore, validateApartment} from "@src/features/valuation";
import {SparklesIcon} from "@src/shared/assets/icons";
import {cn, useCountUp} from "@src/shared/lib";
import {Button, Spinner} from "@src/shared/ui";

import styles from "./ResultPage.module.scss";

const COUNT_UP_MS = 900;

const priceFormat = new Intl.NumberFormat("ru-RU", {maximumFractionDigits: 0});
const decimalFormat = new Intl.NumberFormat("ru-RU", {maximumFractionDigits: 1});

function roundPrice(value: number): number {
  return Math.round(value / 1000) * 1000;
}

export function ResultPage() {
  const navigate = useNavigate();

  const propertyType = useValuationStore((state) => state.propertyType);
  const address = useValuationStore((state) => state.address);
  const apartment = useValuationStore((state) => state.apartment);
  const reset = useValuationStore((state) => state.reset);

  const prediction = usePrediction();
  const result = prediction.status === "success" ? prediction.result : null;

  const [animate] = useState(() => useValuationStore.getState().result == null);

  const price = result ? roundPrice(result.predictedPrice) : 0;
  const displayedPrice = useCountUp(price, COUNT_UP_MS, animate);

  if (propertyType !== "apartment") {
    return <Navigate to="/" replace/>;
  }

  if (!address) {
    return <Navigate to="/predict/address" replace/>;
  }

  const {areaM2, rooms, isStudio, floor, floorsTotal} = apartment;

  // Не только заполненность: «вперёд» в браузере открывает результат и после невалидной правки деталей
  if (areaM2 == null || floor == null || floorsTotal == null || !validateApartment(apartment).isValid) {
    return <Navigate to="/predict/details" replace/>;
  }

  const loading = prediction.status === "loading";

  const roomsLabel = isStudio ? "Студия" : rooms != null && rooms >= 5 ? "5 и более" : String(rooms);

  const handleRestart = () => {
    reset();
    navigate("/", {replace: true});
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header>
          <h1 className={styles.title}>Оценка квартиры</h1>
          <p className={styles.description}>{result?.address.formattedAddress ?? address.label}</p>
        </header>

        <div className={styles.content}>
          <section className={styles.priceCard} aria-live="polite" aria-busy={loading}>
            <span className={styles.caption}>Рыночная стоимость</span>

            {prediction.status === "loading" && (
              <>
                <span className={cn(styles.skeleton, styles.priceSkeleton)}/>
                <span className={cn(styles.skeleton, styles.perMeterSkeleton)}/>

                <p className={cn(styles.footer, styles.status)}>
                  <Spinner className={styles.statusSpinner} label="Рассчитываем стоимость"/>
                  Рассчитываем стоимость…
                </p>
              </>
            )}

            {prediction.status === "success" && (
              <div className={cn(styles.state, animate && styles.reveal)}>
                <p className={styles.price}>
                  {priceFormat.format(displayedPrice)}
                  <span className={styles.currency}> ₽</span>
                </p>

                <p className={cn(styles.footer, styles.perMeter)}>
                  {priceFormat.format(roundPrice(price / areaM2))} ₽ за м²
                </p>
              </div>
            )}

            {prediction.status === "error" && (
              <div className={cn(styles.state, styles.error)}>
                <p className={styles.errorTitle}>Не удалось рассчитать</p>
                <p className={styles.errorText}>Проверьте подключение к интернету и попробуйте ещё раз</p>

                <div className={styles.footer}>
                  <Button variant="soft" size="sm" onClick={prediction.retry}>
                    Повторить
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className={styles.params} aria-labelledby="result-params-title">
            <h2 id="result-params-title" className={styles.paramsTitle}>Параметры</h2>

            <dl className={styles.list}>
              <div className={styles.row}>
                <dt>Комнаты</dt>
                <dd>{roomsLabel}</dd>
              </div>

              <div className={styles.row}>
                <dt>Площадь</dt>
                <dd>{decimalFormat.format(areaM2)} м²</dd>
              </div>

              <div className={styles.row}>
                <dt>Этаж</dt>
                <dd>{floor} из {floorsTotal}</dd>
              </div>

              <div className={styles.row}>
                <dt>До центра</dt>
                <dd>
                  {result
                    ? `${decimalFormat.format(result.address.distanceToCenterKm)} км`
                    : loading
                      ? <span className={cn(styles.skeleton, styles.valueSkeleton)}/>
                      : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <aside className={styles.disclaimer} aria-labelledby="result-disclaimer-title">
            <span className={styles.disclaimerIcon} aria-hidden="true">
              <SparklesIcon/>
            </span>

            <div>
              <h2 id="result-disclaimer-title" className={styles.disclaimerTitle}>
                Оценку рассчитал ИИ
              </h2>

              <p className={styles.disclaimerText}>
                Модель учитывает расположение и параметры квартиры, но не видит ремонт,
                вид из окон и состояние дома. Используйте результат как ориентир —
                это не заключение профессионального оценщика.
              </p>
            </div>
          </aside>
        </div>

        <Button fullWidth className={styles.restart} onClick={handleRestart}>
          Оценить другой объект
        </Button>
      </div>
    </main>
  );
}
