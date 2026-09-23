import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";

import type {PropertyType} from "@src/entities/property";
import type {SelectedAddress} from "@src/entities/address";
import type {Prediction} from "@src/entities/prediction";

export interface ApartmentDetails {
  areaM2: number | null;
  rooms: number | null;
  isStudio: boolean;
  floor: number | null;
  floorsTotal: number | null;
}

interface HouseDetails {
  houseAreaM2: number | null;
  landAreaM2: number | null;
}

interface LandDetails {
  landAreaM2: number | null;
  landType: string | null;
}

interface ValuationState {
  propertyType: PropertyType | null;

  cityId: number | null;

  address: SelectedAddress | null;

  apartment: ApartmentDetails;
  house: HouseDetails;
  land: LandDetails;

  // Результат всегда соответствует текущим вводным: любой сеттер ввода его сбрасывает.
  result: Prediction | null;

  setPropertyType: (
    propertyType: PropertyType,
  ) => void;

  setCityId: (cityId: number | null) => void;

  setAddress: (address: SelectedAddress | null) => void;

  setApartmentDetails: (
    details: Partial<ApartmentDetails>,
  ) => void;

  setHouseDetails: (
    details: Partial<HouseDetails>,
  ) => void;

  setLandDetails: (
    details: Partial<LandDetails>,
  ) => void;

  setResult: (
    result: Prediction | null,
  ) => void;

  reset: () => void;
}

const initialState = {
  propertyType: null,

  cityId: null,

  address: null,

  apartment: {
    areaM2: null,
    rooms: null,
    isStudio: false,
    floor: null,
    floorsTotal: null,
  },

  house: {
    houseAreaM2: null,
    landAreaM2: null,
  },

  land: {
    landAreaM2: null,
    landType: null,
  },

  result: null,
};

export const useValuationStore =
  create<ValuationState>()(
    persist(
      (set) => ({
        ...initialState,

        setPropertyType: (propertyType) =>
          set({
            propertyType,
            result: null,
          }),

        setCityId: (cityId) =>
          set((state) => (
            state.cityId === cityId
              ? state
              : {cityId, address: null, result: null}
          )),

        setAddress: (address) =>
          set({
            address,
            result: null,
          }),

        setApartmentDetails: (details) =>
          set((state) => ({
            apartment: {
              ...state.apartment,
              ...details,
            },
            result: null,
          })),

        setHouseDetails: (details) =>
          set((state) => ({
            house: {
              ...state.house,
              ...details,
            },
            result: null,
          })),

        setLandDetails: (details) =>
          set((state) => ({
            land: {
              ...state.land,
              ...details,
            },
            result: null,
          })),

        setResult: (result) =>
          set({
            result,
          }),

        reset: () =>
          set(initialState),
      }),
      {
        name: "estima-valuation",

        storage: createJSONStorage(
          () => sessionStorage,
        ),
      },
    ),
  );
