'use client';

import { useEffect, useRef } from "react";
import styles from "./placesAutocomplete.module.css";

export type Location = {
    address: string;
    lat: number;
    lng: number;
}

export type AddressComponents = {
    streetNumber: string;
    route: string;
    city: string;
    state: string;
    zip: string;
    formattedAddress: string;
}

type Props = {
    value: string;
    onPlaceSelected: (location: Location, components: AddressComponents) => void;
    invalid?: boolean;
}

declare global {
    interface Window {
        google: typeof google;
        __mapsReady?: () => void;
        __mapsReadyCallbacks?: Array<() => void>;
    }
}

/**
 * Loads the Maps JS API with loading=async (Google's recommended pattern).
 * Calls `cb` once window.google.maps is fully initialised.
 */
function loadMapsApi(apiKey: string, cb: () => void) {
    // Already loaded — call immediately
    if (typeof window !== "undefined" && window.google && window.google.maps) {
        cb();
        return;
    }

    // Queue the callback regardless of whether the script tag exists yet
    if (!window.__mapsReadyCallbacks) {
        window.__mapsReadyCallbacks = [];
    }
    window.__mapsReadyCallbacks.push(cb);

    // Install the global callback that Maps JS will invoke when ready
    if (!window.__mapsReady) {
        window.__mapsReady = () => {
            window.__mapsReadyCallbacks?.forEach((fn) => fn());
            window.__mapsReadyCallbacks = [];
        };
    }

    // Inject the script tag only once
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (!existing) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__mapsReady`;
        script.async = true;
        document.head.appendChild(script);
    }
}

export default function PlacesAutocomplete({ value, onPlaceSelected, invalid }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    // Keep a ref to the PlaceAutocompleteElement so we can clean up its listener
    const elementRef = useRef<HTMLElement | null>(null);
    const listenerRef = useRef<((e: Event) => void) | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;
        if (!apiKey) {
            console.error("NEXT_PUBLIC_GOOGLE_KEY is not set");
            return;
        }

        loadMapsApi(apiKey, async () => {
            if (!containerRef.current) return;

            // Use the new Places library
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { PlaceAutocompleteElement } =
                await window.google.maps.importLibrary("places") as any;

            // Don't add a second widget if already mounted (StrictMode double-invoke)
            if (elementRef.current) return;

            const autocompleteEl = new PlaceAutocompleteElement({
                componentRestrictions: { country: "us" },
                types: ["address"],
            }) as HTMLElement;

            // Apply matching styles inline so they work regardless of CSS Modules scoping
            Object.assign(autocompleteEl.style, {
                width: "100%",
                display: "block",
            });

            // Pre-fill with any existing value
            if (value) {
                (autocompleteEl as HTMLInputElement).value = value;
            }

            elementRef.current = autocompleteEl;
            containerRef.current.appendChild(autocompleteEl);

            const handleSelect = async (event: Event) => {
                const place = (event as google.maps.places.PlaceAutocompletePlaceSelectEvent).place;
                if (!place) return;

                await place.fetchFields({
                    fields: ["displayName", "formattedAddress", "addressComponents", "location"],
                });

                if (!place.location || !place.addressComponents) return;

                const components = place.addressComponents;
                const get = (type: string) =>
                    components.find((c: google.maps.places.AddressComponent) =>
                        c.types.includes(type)
                    )?.shortText ?? "";
                const getLong = (type: string) =>
                    components.find((c: google.maps.places.AddressComponent) =>
                        c.types.includes(type)
                    )?.longText ?? "";

                const streetNumber = get("street_number");
                const route = get("route");
                const city =
                    getLong("locality") ||
                    getLong("sublocality_level_1") ||
                    getLong("postal_town") || "";
                const state = get("administrative_area_level_1");
                const zip = get("postal_code");

                const location: Location = {
                    address: place.formattedAddress ?? "",
                    lat: place.location.lat(),
                    lng: place.location.lng(),
                };

                const addressComponents: AddressComponents = {
                    streetNumber,
                    route,
                    city,
                    state,
                    zip,
                    formattedAddress: place.formattedAddress ?? "",
                };

                onPlaceSelected(location, addressComponents);
            };

            listenerRef.current = handleSelect;
            autocompleteEl.addEventListener("gmp-placeselect", handleSelect);
        });

        return () => {
            if (elementRef.current && listenerRef.current) {
                elementRef.current.removeEventListener("gmp-placeselect", listenerRef.current);
            }
            // Remove the element from the DOM on unmount
            if (elementRef.current && containerRef.current?.contains(elementRef.current)) {
                containerRef.current.removeChild(elementRef.current);
            }
            elementRef.current = null;
            listenerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            className={`${styles.container}${invalid ? ` ${styles.invalid}` : ""}`}
        />
    );
}
