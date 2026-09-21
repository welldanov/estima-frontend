import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";

import type {PropertyType} from "../../../entities/property";

interface ApartmentDetails {
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

interface PredictionResult {
    propertyType: PropertyType;
    predictedPrice: number;
    address: {
        formattedAddress: string;
        lat: number;
        lon: number;
        distanceToCenterKm: number;
    };
}

interface ValuationState {
    propertyType: PropertyType | null;

    cityId: number | null;

    addressUri: string | null;

    apartment: ApartmentDetails;
    house: HouseDetails;
    land: LandDetails;

    result: PredictionResult | null;

    setPropertyType: (
        propertyType: PropertyType,
    ) => void;

    setCityId: (cityId: number) => void;

    setAddressUri: (uri: string) => void;

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
        result: PredictionResult,
    ) => void;

    reset: () => void;
}

const initialState = {
    propertyType: null,

    cityId: null,

    addressUri: null,

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
                    }),

                setCityId: (cityId) =>
                    set({
                        cityId,
                    }),

                setAddressUri: (addressUri) =>
                    set({
                        addressUri,
                    }),

                setApartmentDetails: (details) =>
                    set((state) => ({
                        apartment: {
                            ...state.apartment,
                            ...details,
                        },
                    })),

                setHouseDetails: (details) =>
                    set((state) => ({
                        house: {
                            ...state.house,
                            ...details,
                        },
                    })),

                setLandDetails: (details) =>
                    set((state) => ({
                        land: {
                            ...state.land,
                            ...details,
                        },
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