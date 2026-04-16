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
    onLoadError?: () => void;
}

declare global {
    interface Window {
        google: typeof google;
        __mapsReady?: () => void;
        __mapsReadyCallbacks?: Array<() => void>;
        __mapsErrorCallbacks?: Array<() => void>;
    }
}

/** Inject pac-container overrides once into <head> */
function injectDropdownStyles() {
    if (document.getElementById("pac-custom-styles")) return;
    const style = document.createElement("style");
    style.id = "pac-custom-styles";
    style.textContent = `
        .pac-container {
            border: 1px solid #A4A8B0;
            border-radius: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            margin-top: 4px;
            overflow: hidden;
            font-family: var(--font-dhyana), sans-serif;
            font-size: 16px;
        }
        .pac-item {
            padding: 8px 20px;
            cursor: pointer;
            border-top: none;
            color: #333;
            font-family: var(--font-dhyana), sans-serif;
        }
        .pac-item:first-child {
            border-top: none;
        }
        .pac-item:hover,
        .pac-item-selected {
            background-color: #343B9510;
        }
        .pac-item-query {
            font-family: var(--font-dhyana), sans-serif;
            font-size: 16px;
            color: #333;
        }
        .pac-matched {
            font-weight: 600;
        }
        /* Hide the Google pin icon on the left of each item */
        .pac-icon {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

/** Queue cb to run once Maps JS is fully ready */
function loadMapsApi(apiKey: string, cb: () => void, onError?: () => void) {
    if (typeof window === "undefined") return;

    if (window.google && window.google.maps) {
        cb();
        return;
    }

    if (!window.__mapsReadyCallbacks) {
        window.__mapsReadyCallbacks = [];
    }
    window.__mapsReadyCallbacks.push(cb);

    if (!window.__mapsErrorCallbacks) {
        window.__mapsErrorCallbacks = [];
    }
    if (onError) {
        window.__mapsErrorCallbacks.push(onError);
    }

    if (!window.__mapsReady) {
        window.__mapsReady = () => {
            window.__mapsReadyCallbacks?.forEach((fn) => fn());
            window.__mapsReadyCallbacks = [];
        };
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (!existing) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__mapsReady`;
        script.async = true;
        script.onerror = () => {
            window.__mapsErrorCallbacks?.forEach((fn) => fn());
            window.__mapsErrorCallbacks = [];
        };
        document.head.appendChild(script);
    }
}

export default function PlacesAutocomplete({ value, onPlaceSelected, invalid, onLoadError }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;
        if (!apiKey) {
            console.error("NEXT_PUBLIC_GOOGLE_KEY is not set");
            onLoadError?.();
            return;
        }

        injectDropdownStyles();

        // Fire onLoadError if Maps hasn't initialised within 10 seconds
        const timeout = setTimeout(() => {
            if (!autocompleteRef.current) {
                onLoadError?.();
            }
        }, 10000);

        loadMapsApi(apiKey, () => {
            clearTimeout(timeout);
            if (!inputRef.current || autocompleteRef.current) return;

            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                inputRef.current,
                { types: ["address"], componentRestrictions: { country: "us" }, fields: ["address_components", "geometry", "formatted_address"] }
            );

            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current?.getPlace();
                if (!place?.geometry?.location || !place.address_components) return;

                const components = place.address_components;
                const get = (type: string) =>
                    components.find((c) => c.types.includes(type))?.short_name ?? "";
                const getLong = (type: string) =>
                    components.find((c) => c.types.includes(type))?.long_name ?? "";

                const streetNumber = get("street_number");
                const route = get("route");
                const city =
                    getLong("locality") ||
                    getLong("sublocality_level_1") ||
                    getLong("postal_town") || "";
                const state = get("administrative_area_level_1");
                const zip = get("postal_code");

                const location: Location = {
                    address: place.formatted_address ?? "",
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };

                const addressComponents: AddressComponents = {
                    streetNumber,
                    route,
                    city,
                    state,
                    zip,
                    formattedAddress: place.formatted_address ?? "",
                };

                onPlaceSelected(location, addressComponents);
            });
        }, onLoadError);

        return () => {
            clearTimeout(timeout);
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.wrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A4A8B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </span>
            <input
                ref={inputRef}
                className={`${styles.input}${invalid ? ` ${styles.invalid}` : ""}`}
                type="text"
                placeholder="Enter event address"
                defaultValue={value}
                aria-label="Event address"
            />
        </div>
    );
}
