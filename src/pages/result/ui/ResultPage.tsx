import {Navigate, useNavigate} from "react-router-dom";

import {useValuationStore} from "../../../features/valuation/model/valuationStore.ts";

import styles from "./ResultPage.module.scss";

function formatPrice(value: number): string {
    return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDistance(value: number): string {
    return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 1,
    }).format(value);
}

export function ResultPage() {
    const navigate = useNavigate();

    const result = useValuationStore(
        (state) => state.result,
    );

    const propertyType = useValuationStore(
        (state) => state.propertyType,
    );

    const apartment = useValuationStore(
        (state) => state.apartment,
    );

    if (!result) {
        return (
            <Navigate
                to="/predict"
                replace
            />
        );
    }

    const isApartment =
        result.propertyType === "apartment";

    const roomsLabel = apartment.isStudio
        ? "Студия"
        : apartment.rooms != null
            ? `${apartment.rooms} ${
                apartment.rooms === 1
                    ? "комната"
                    : apartment.rooms >= 2 &&
                    apartment.rooms <= 4
                        ? "комнаты"
                        : "комнат"
            }`
            : null;

    const handleRestart = () => {
        useValuationStore.getState().reset();

        navigate("/", {
            replace: true,
        });
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.successIcon}>
                        <span>✓</span>
                    </div>

                    <div className={styles.eyebrow}>
                        Предварительная оценка
                    </div>

                    <h1 className={styles.title}>
                        Стоимость объекта
                    </h1>

                    <div className={styles.price}>
                        {formatPrice(
                            result.predictedPrice,
                        )}

                        <span className={styles.currency}>
                            ₽
                        </span>
                    </div>

                    <p className={styles.address}>
                        {result.address.formattedAddress}
                    </p>

                    <section
                        className={
                            styles.detailsCard
                        }
                    >
                        <div
                            className={
                                styles.detailsHeader
                            }
                        >
                            <span>
                                Параметры объекта
                            </span>

                            <span
                                className={
                                    styles.propertyType
                                }
                            >
                                {propertyType ===
                                "apartment"
                                    ? "Квартира"
                                    : propertyType ===
                                    "house"
                                        ? "Дом"
                                        : "Участок"}
                            </span>
                        </div>

                        {isApartment && (
                            <>
                                {roomsLabel && (
                                    <div
                                        className={
                                            styles.detailRow
                                        }
                                    >
                                        <span>
                                            Комнаты
                                        </span>

                                        <strong>
                                            {roomsLabel}
                                        </strong>
                                    </div>
                                )}

                                {apartment.areaM2 !=
                                    null && (
                                        <div
                                            className={
                                                styles.detailRow
                                            }
                                        >
                                        <span>
                                            Площадь
                                        </span>

                                            <strong>
                                                {
                                                    apartment.areaM2
                                                }{" "}
                                                м²
                                            </strong>
                                        </div>
                                    )}

                                {apartment.floor !=
                                    null &&
                                    apartment.floorsTotal !=
                                    null && (
                                        <div
                                            className={
                                                styles.detailRow
                                            }
                                        >
                                            <span>
                                                Этаж
                                            </span>

                                            <strong>
                                                {
                                                    apartment.floor
                                                }{" "}
                                                из{" "}
                                                {
                                                    apartment.floorsTotal
                                                }
                                            </strong>
                                        </div>
                                    )}
                            </>
                        )}

                        <div
                            className={
                                styles.detailRow
                            }
                        >
                            <span>
                                До центра
                            </span>

                            <strong>
                                {formatDistance(
                                    result.address
                                        .distanceToCenterKm,
                                )}{" "}
                                км
                            </strong>
                        </div>
                    </section>

                    <div className={styles.note}>
                        <span
                            className={
                                styles.noteIcon
                            }
                        >
                            i
                        </span>

                        <p>
                            Это ориентировочная оценка
                            на основе данных модели.
                            Фактическая стоимость может
                            отличаться.
                        </p>
                    </div>

                    <div
                        className={
                            styles.actions
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.primaryButton
                            }
                            onClick={handleRestart}
                        >
                            Рассчитать другой объект
                        </button>

                        <button
                            type="button"
                            className={
                                styles.secondaryButton
                            }
                            onClick={() =>
                                navigate(
                                    "/predict/details",
                                )
                            }
                        >
                            Изменить данные
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}