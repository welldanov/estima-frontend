import {
    useMemo,
    type ChangeEvent,
} from "react";
import {useNavigate} from "react-router-dom";

import {useValuationStore} from "../../../features/valuation/model/valuationStore.ts";

import styles from "./ApartmentDetailsPage.module.scss";

const ROOM_OPTIONS = [
    {
        label: "Студия",
        value: "studio",
    },
    {
        label: "1",
        value: 1,
    },
    {
        label: "2",
        value: 2,
    },
    {
        label: "3",
        value: 3,
    },
    {
        label: "4",
        value: 4,
    },
    {
        label: "5+",
        value: 5,
    },
] as const;

export function ApartmentDetailsPage() {
    const navigate = useNavigate();

    // const address = useValuationStore(
    //     (state) => state.address,
    // );

    const address = "Рандомный адрес";

    const apartment = useValuationStore(
        (state) => state.apartment,
    );

    const setApartmentDetails = useValuationStore(
        (state) => state.setApartmentDetails,
    );

    const isValid = useMemo(() => {
        const {
            areaM2,
            floor,
            floorsTotal,
        } = apartment;

        if (!areaM2 || areaM2 <= 0) {
            return false;
        }

        if (apartment.isStudio) {
            if (!floor || !floorsTotal) {
                return false;
            }
        } else {
            if (!apartment.rooms || apartment.rooms <= 0) {
                return false;
            }

            if (!floor || !floorsTotal) {
                return false;
            }
        }

        if (floor > floorsTotal) {
            return false;
        }

        return true;
    }, [apartment]);

    const handleRoomsChange = (
        value: (typeof ROOM_OPTIONS)[number]["value"],
    ) => {
        if (value === "studio") {
            setApartmentDetails({
                isStudio: true,
                rooms: null,
            });

            return;
        }

        setApartmentDetails({
            isStudio: false,
            rooms: value,
        });
    };

    const handleNumberChange = (
        field: "areaM2" | "floor" | "floorsTotal",
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value;

        if (value === "") {
            setApartmentDetails({
                [field]: null,
            });

            return;
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return;
        }

        setApartmentDetails({
            [field]: number,
        });
    };

    const handleIncrement = (
        field: "areaM2" | "floor" | "floorsTotal",
        step = 1,
    ) => {
        const currentValue = apartment[field] ?? 0;

        setApartmentDetails({
            [field]: currentValue + step,
        });
    };

    const handleDecrement = (
        field: "areaM2" | "floor" | "floorsTotal",
        step = 1,
        min = 1,
    ) => {
        const currentValue = apartment[field];

        if (currentValue == null) {
            setApartmentDetails({
                [field]: min,
            });

            return;
        }

        setApartmentDetails({
            [field]: Math.max(min, currentValue - step),
        });
    };

    const handleContinue = () => {
        if (!isValid) {
            return;
        }

        navigate("/predict/calculating");
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                    aria-label="Назад"
                >
                    ←
                </button>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.icon}>
                            🏢
                        </div>

                        <h1 className={styles.title}>
                            Квартира
                        </h1>

                        <p className={styles.description}>
                            Укажите характеристики объекта
                        </p>
                    </div>

                    <section className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Адрес
                            </label>

                            <div className={styles.address}>
                                <span>
                                    {address || "Адрес не указан"}
                                </span>

                                <button
                                    type="button"
                                    className={styles.clearButton}
                                    onClick={() => navigate(-1)}
                                    aria-label="Изменить адрес"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <div className={styles.label}>
                                Количество комнат
                            </div>

                            <div className={styles.rooms}>
                                {ROOM_OPTIONS.map((option) => {
                                    const selected =
                                        option.value === "studio"
                                            ? apartment.isStudio
                                            : !apartment.isStudio &&
                                            apartment.rooms === option.value;

                                    return (
                                        <button
                                            key={String(option.value)}
                                            type="button"
                                            className={`${styles.roomButton} ${
                                                selected
                                                    ? styles.roomButtonActive
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleRoomsChange(
                                                    option.value,
                                                )
                                            }
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label
                                htmlFor="area"
                                className={styles.label}
                            >
                                Общая площадь, м²
                            </label>

                            <div className={styles.numberInput}>
                                <input
                                    id="area"
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={apartment.areaM2 ?? ""}
                                    onChange={(event) =>
                                        handleNumberChange(
                                            "areaM2",
                                            event,
                                        )
                                    }
                                />

                                <div className={styles.numberActions}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDecrement(
                                                "areaM2",
                                            )
                                        }
                                        aria-label="Уменьшить площадь"
                                    >
                                        −
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleIncrement(
                                                "areaM2",
                                            )
                                        }
                                        aria-label="Увеличить площадь"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <div className={styles.label}>
                                Этаж
                            </div>

                            <div className={styles.floorRow}>
                                <div className={styles.numberInput}>
                                    <input
                                        type="number"
                                        min={1}
                                        max={
                                            apartment.floorsTotal ??
                                            undefined
                                        }
                                        value={
                                            apartment.floor ?? ""
                                        }
                                        onChange={(event) =>
                                            handleNumberChange(
                                                "floor",
                                                event,
                                            )
                                        }
                                        aria-label="Этаж"
                                    />

                                    <div
                                        className={
                                            styles.numberActions
                                        }
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDecrement(
                                                    "floor",
                                                )
                                            }
                                            aria-label="Уменьшить этаж"
                                        >
                                            −
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleIncrement(
                                                    "floor",
                                                )
                                            }
                                            aria-label="Увеличить этаж"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <span className={styles.floorDivider}>
                                    из
                                </span>

                                <div className={styles.numberInput}>
                                    <input
                                        type="number"
                                        min={1}
                                        value={
                                            apartment.floorsTotal ??
                                            ""
                                        }
                                        onChange={(event) =>
                                            handleNumberChange(
                                                "floorsTotal",
                                                event,
                                            )
                                        }
                                        aria-label="Этажей в доме"
                                    />

                                    <div
                                        className={
                                            styles.numberActions
                                        }
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDecrement(
                                                    "floorsTotal",
                                                )
                                            }
                                            aria-label="Уменьшить количество этажей"
                                        >
                                            −
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleIncrement(
                                                    "floorsTotal",
                                                )
                                            }
                                            aria-label="Увеличить количество этажей"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {apartment.floor &&
                                apartment.floorsTotal &&
                                apartment.floor >
                                apartment.floorsTotal && (
                                    <p className={styles.validationError}>
                                        Этаж не может быть выше
                                        этажности дома
                                    </p>
                                )}
                        </div>
                    </section>

                    <button
                        type="button"
                        className={styles.continueButton}
                        disabled={!isValid}
                        onClick={handleContinue}
                    >
                        Продолжить
                    </button>
                </div>
            </div>
        </main>
    );
}