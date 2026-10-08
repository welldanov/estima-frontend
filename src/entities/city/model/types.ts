import type {PropertyType} from "@src/entities/property";

export interface City {
  id: number;
  name: string;
  /** Типы объектов, для которых в городе есть модель (Казань — только apartment). */
  propertyTypes: PropertyType[];
}
