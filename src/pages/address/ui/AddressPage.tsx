import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import {useValuationStore} from "../../../features/valuation/model/valuationStore.ts";

import styles from "./AddressPage.module.scss";

interface City {
    id: number;
    name: string;
}

interface AddressSuggestion {
    uri: string;
    title: string;
    subtitle?: string;
}

export function AddressPage() {
    const navigate = useNavigate();

    const cityId = useValuationStore((state) => state.cityId);
    const addressUri = useValuationStore((state) => state.addressUri);

    const setCityId = useValuationStore((state) => state.setCityId);
    const setAddressUri = useValuationStore((state) => state.setAddressUri);

    const [cities, setCities] = useState<City[]>([]);
    const [addressQuery, setAddressQuery] = useState("");
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(true);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCities = async () => {
            try {
                setIsLoadingCities(true);
                setError(null);

                const response = await fetch("/api/cities");

                if (!response.ok) {
                    throw new Error("Не удалось загрузить города");
                }

                const data: City[] = await response.json();

                setCities(data);
            } catch {
                setError("Не удалось загрузить список городов");
            } finally {
                setIsLoadingCities(false);
            }
        };

        loadCities().then();
    }, []);

    useEffect(() => {
        const query = addressQuery.trim();

        if (
            cityId == null ||
            addressUri ||
            query.length < 2
        ) {
            return;
        }

        const controller = new AbortController();

        const loadSuggestions = async () => {
            try {
                setIsLoadingAddresses(true);

                const params = new URLSearchParams({
                    city_id: String(cityId),
                    query: addressQuery.trim(),
                });

                const response = await fetch(
                    `/api/addresses/search?${params.toString()}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error("Не удалось загрузить адреса");
                }

                const data = await response.json();

                setSuggestions(data.items);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setSuggestions([]);
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        void loadSuggestions();

        return () => {
            controller.abort();
        };
    }, [cityId, addressQuery]);

    const handleCityChange = (value: number) => {
        setCityId(value);

        // При смене города старый адрес больше не подходит.
        setAddressUri("");
        setAddressQuery("");
        setSuggestions([]);
    };

    const handleAddressSelect = (suggestion: AddressSuggestion) => {
        setAddressUri(suggestion.uri);

        const address = [suggestion.title, suggestion.subtitle]
            .filter(Boolean)
            .join(", ");

        setAddressQuery(address);
        setSuggestions([]);
    };

    const handleContinue = () => {
        if (!cityId || !addressUri) {
            return;
        }

        navigate("/predict/details");
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    ← Назад
                </button>

                <div className={styles.content}>
                    <div className={styles.step}>
                        Шаг 2 из 4
                    </div>

                    <h1 className={styles.title}>
                        Где находится объект?
                    </h1>

                    <p className={styles.description}>
                        Укажите город и адрес объекта.
                    </p>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.field}>
                        <label
                            htmlFor="city"
                            className={styles.label}
                        >
                            Город
                        </label>

                        <select
                            id="city"
                            className={styles.select}
                            value={cityId ?? ""}
                            disabled={isLoadingCities}
                            onChange={(event) => {
                                const value = Number(event.target.value);

                                if (value) {
                                    handleCityChange(value);
                                }
                            }}
                        >
                            <option value="" disabled>
                                {isLoadingCities
                                    ? "Загрузка..."
                                    : "Выберите город"}
                            </option>

                            {cities.map((city) => (
                                <option
                                    key={city.id}
                                    value={city.id}
                                >
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label
                            htmlFor="address"
                            className={styles.label}
                        >
                            Адрес
                        </label>

                        <div className={styles.addressWrapper}>
                            <input
                                id="address"
                                type="text"
                                className={styles.input}
                                value={addressQuery}
                                disabled={!cityId}
                                placeholder={
                                    cityId
                                        ? "Начните вводить улицу или адрес"
                                        : "Сначала выберите город"
                                }
                                autoComplete="off"
                                onChange={(event) => {
                                    setAddressQuery(event.target.value);
                                    setAddressUri("");
                                }}
                            />

                            {isLoadingAddresses && (
                                <div className={styles.loader}>
                                    Поиск...
                                </div>
                            )}

                            {suggestions.length > 0 && (
                                <div className={styles.suggestions}>
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.uri}
                                            type="button"
                                            className={styles.suggestion}
                                            onClick={() =>
                                                handleAddressSelect(
                                                    suggestion,
                                                )
                                            }
                                        >
                                            <span className={styles.suggestionTitle}>
                                                {suggestion.title}
                                            </span>

                                            {suggestion.subtitle && (
                                                <span className={styles.suggestionSubtitle}>
                                                    {suggestion.subtitle}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.continueButton}
                        disabled={!cityId || !addressUri}
                        onClick={handleContinue}
                    >
                        Продолжить
                    </button>
                </div>
            </div>
        </main>
    );
}