import React from "react";

import type {PropertyType} from "../../../entities/property";

import {PropertyTypeCard} from "../../../widgets/property-type-card";

import {
    ApartmentIcon,
    HouseIcon,
    LandIcon,
} from "../../../shared/ui";

import styles from "./PropertyTypeSelector.module.scss";

interface PropertyTypeSelectorProps {
    value: PropertyType | null;
    onChange: (value: PropertyType) => void;
}

interface propertyTypesProps {
    type: PropertyType;
    title: string;
    icon: React.ReactNode;
}


const propertyTypes: propertyTypesProps[] = [
    {
        type: "apartment",
        title: "Квартира",
        icon: <ApartmentIcon/>,
    },
    {
        type: "house",
        title: "Дом",
        icon: <HouseIcon/>,
    },
    {
        type: "land",
        title: "Земельный участок",
        icon: <LandIcon/>,
    },
]

export function PropertyTypeSelector({
                                         value,
                                         onChange,
                                     }: PropertyTypeSelectorProps) {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>
                Что хотите оценить?
            </h2>

            <div className={styles.list}>
                {propertyTypes.map((property) => (
                    <PropertyTypeCard
                        key={property.type}
                        type={property.type}
                        title={property.title}
                        icon={property.icon}
                        onClick={onChange}
                    />
                ))}
            </div>
        </section>
    );
}