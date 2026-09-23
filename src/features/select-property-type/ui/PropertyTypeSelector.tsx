import type {ReactNode} from "react";

import type {PropertyType} from "@src/entities/property";

import {ApartmentIcon, HouseIcon, LandIcon} from "@src/shared/assets/icons";
import {cn} from "@src/shared/lib";

import {PropertyTypeCard} from "./PropertyTypeCard";
import styles from "./PropertyTypeSelector.module.scss";

interface PropertyTypeSelectorProps {
  onChange: (type: PropertyType) => void;
  className?: string;
}

interface PropertyTypeOption {
  type: PropertyType;
  title: string;
  description: string;
  icon: ReactNode;
  beta?: boolean;
}

const propertyTypes: PropertyTypeOption[] = [
  {
    type: "apartment",
    title: "Квартира",
    description: "Новостройка или вторичка",
    icon: <ApartmentIcon/>,
  },
  {
    type: "house",
    title: "Дом",
    description: "Дом, коттедж, таунхаус",
    icon: <HouseIcon/>,
    beta: true,
  },
  {
    type: "land",
    title: "Участок",
    description: "ИЖС, СНТ, ЛПХ",
    icon: <LandIcon/>,
    beta: true,
  },
];

export function PropertyTypeSelector({
  onChange,
  className,
}: PropertyTypeSelectorProps) {
  return (
    <section className={cn(styles.section, className)}>
      <h2 className={styles.title}>Что хотите оценить?</h2>

      <div className={styles.list}>
        {propertyTypes.map((property) => (
          <PropertyTypeCard
            key={property.type}
            type={property.type}
            title={property.title}
            description={property.description}
            icon={property.icon}
            beta={property.beta}
            onClick={onChange}
          />
        ))}
      </div>
    </section>
  );
}
