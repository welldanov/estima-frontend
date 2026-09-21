import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import {useValuationStore} from "../../../features/valuation/model/valuationStore.ts";

import styles from "./CalculatingPage.module.scss";

interface PredictionResponse {
    property_type: "apartment";

    predicted_price: number;

    address: {
        formatted_address: string;
        lat: number;
        lon: number;
        distance_to_center_km: number;
    };
}

const STEPS = [
    "Получаем данные об адресе",
    "Рассчитываем расстояние до центра",
    "Анализируем характеристики объекта",
    "Прогнозируем цену",
];

export function CalculatingPage() {
    const navigate = useNavigate();

    const propertyType = useValuationStore(
        (state) => state.propertyType,
    );

    const cityId = useValuationStore(
        (state) => state.cityId,
    );

    const addressUri = useValuationStore(
        (state) => state.addressUri,
    );

    const apartment = useValuationStore(
        (state) => state.apartment,
    );

    const setResult = useValuationStore(
        (state) => state.setResult,
    );

    const [activeStep, setActiveStep] = useState(0);

    const [error, setError] = useState<string | null>(
        null,
    );

    useEffect(() => {
        const controller = new AbortController();

        let isMounted = true;

        const startPrediction = async () => {
            try {
                setError(null);

                if (
                    propertyType !== "apartment" ||
                    cityId == null ||
                    !addressUri
                ) {
                    throw new Error(
                        "Недостаточно данных для расчёта",
                    );
                }

                if (
                    apartment.areaM2 == null ||
                    apartment.floor == null ||
                    apartment.floorsTotal == null
                ) {
                    throw new Error(
                        "Не заполнены характеристики квартиры",
                    );
                }

                const stepTimer = window.setInterval(() => {
                    setActiveStep((current) => {
                        if (current >= STEPS.length - 1) {
                            return current;
                        }

                        return current + 1;
                    });
                }, 900);

                try {
                    const response = await fetch(
                        "/api/predict",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            signal: controller.signal,

                            body: JSON.stringify({
                                property_type:
                                    "apartment",

                                city_id: cityId,
                                address: {
                                    uri: addressUri,
                                },

                                area_m2:
                                apartment.areaM2,

                                rooms:
                                apartment.rooms,

                                is_studio:
                                apartment.isStudio,

                                floor:
                                apartment.floor,

                                floors_total:
                                apartment.floorsTotal,
                            }),
                        },
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Не удалось рассчитать стоимость",
                        );
                    }

                    const data: PredictionResponse =
                        await response.json();

                    if (!isMounted) {
                        return;
                    }

                    window.clearInterval(
                        stepTimer,
                    );

                    // Когда backend реально ответил,
                    // показываем завершение всех этапов.
                    setActiveStep(
                        STEPS.length,
                    );

                    setResult({
                        propertyType: "apartment",

                        predictedPrice:
                        data.predicted_price,

                        address: {
                            formattedAddress:
                            data.address
                                .formatted_address,

                            lat: data.address.lat,

                            lon: data.address.lon,

                            distanceToCenterKm:
                            data.address
                                .distance_to_center_km,
                        },
                    });

                    navigate(
                        "/predict/result",
                        {
                            replace: true,
                        },
                    );
                } finally {
                    window.clearInterval(
                        stepTimer,
                    );
                }
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                if (!isMounted) {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : "Не удалось рассчитать стоимость",
                );
            }
        };

        void startPrediction();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [
        propertyType,
        cityId,
        addressUri,
        apartment,
        setResult,
        navigate,
    ]);

    if (error) {
        return (
            <main className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.errorIcon}>
                        !
                    </div>

                    <h1 className={styles.title}>
                        Не удалось рассчитать стоимость
                    </h1>

                    <p className={styles.description}>
                        {error}
                    </p>

                    <button
                        type="button"
                        className={
                            styles.backButton
                        }
                        onClick={() =>
                            navigate(
                                "/predict/details",
                            )
                        }
                    >
                        Вернуться к данным объекта
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div
                        className={
                            styles.illustration
                        }
                    >
                        <div
                            className={
                                styles.illustrationRing
                            }
                        />

                        <div
                            className={
                                styles.illustrationRingSmall
                            }
                        />

                        <div
                            className={
                                styles.pin
                            }
                        >
                            <span/>
                        </div>
                    </div>

                    <h1 className={styles.title}>
                        Рассчитываем стоимость
                    </h1>

                    <p
                        className={
                            styles.description
                        }
                    >
                        Это займёт всего несколько секунд
                    </p>

                    <div className={styles.steps}>
                        {STEPS.map(
                            (step, index) => {
                                const completed =
                                    index <
                                    activeStep;

                                const active =
                                    index ===
                                    activeStep;

                                return (
                                    <div
                                        key={step}
                                        className={`${styles.step} ${
                                            active
                                                ? styles.stepActive
                                                : ""
                                        } ${
                                            completed
                                                ? styles.stepCompleted
                                                : ""
                                        }`}
                                    >
                                        <div
                                            className={
                                                styles.stepIcon
                                            }
                                        >
                                            {completed
                                                ? "✓"
                                                : active
                                                    ? "✓"
                                                    : ""}
                                        </div>

                                        <span>
                                            {step}
                                        </span>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}