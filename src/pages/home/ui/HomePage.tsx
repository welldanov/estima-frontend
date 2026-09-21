import {useNavigate} from "react-router-dom";

import {useValuationStore} from "../../../features/valuation/model/valuationStore";
import type {PropertyType} from "../../../entities/property";

import {PropertyTypeSelector} from "../../../features/select-property-type";

import {EstimaLogo} from "../../../shared/ui/icons/EstimaLogo.tsx";
import homeImage from "../../../shared/assets/img/home-page-img.png";

import styles from "./HomePage.module.scss";

export function HomePage() {

    const navigate = useNavigate();

    const setPropertyType =
        useValuationStore(
            (state) => state.setPropertyType,
        );

    const handlePropertyTypeChange = (
        type: PropertyType,
    ) => {
        setPropertyType(type);

        navigate("/predict/address");
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <EstimaLogo/>
                        </div>
                    </div>

                    <h1 className={styles.heading}>
                        Оценка недвижимости
                    </h1>

                    <p className={styles.description}>
                        Узнайте примерную стоимость
                        вашего объекта за несколько минут
                    </p>
                </header>

                <div className={styles.illustration}>
                    <div className={styles.illustrationHouse}>
                        <img src={homeImage} alt="House Picture"/>
                    </div>
                </div>

                <PropertyTypeSelector
                    value={null}
                    onChange={handlePropertyTypeChange}
                />
            </div>
        </main>
    );
}