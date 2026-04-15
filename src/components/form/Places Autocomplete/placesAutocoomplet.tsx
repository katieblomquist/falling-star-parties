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
    }
}

export default function PlacesAutocomplete({ value, onPlaceSelected, invalid }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;
        if (!apiKey) {
            console.error("NEXT_PUBLIC_GOOGLE_KEY is not set");
            return;
        }

        // If Maps JS is already loaded, initialize immediately
        if (window.google?.maps?.places) {
            initAutocomplete();
            return;
        }

        // Otherwise load the script once
        const existingScript = document.querySelector(
            `script[src*="maps.googleapis.com/maps/api/js"]`
        );
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = initAutocomplete;
            document.head.appendChild(script);
        } else {
            existingScript.addEventListener("load", initAutocomplete);
        }

        function initAutocomplete() {
            if (!inputRef.current) return;
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                inputRef.current,
                { types: ["address"], componentRestrictions: { country: "us" } }
            );

            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current?.getPlace();
                if (!place?.geometry?.location || !place.address_components) return;

                const components = place.address_components;
                const get = (type: string) =>
                    components.find((c) => c.types.includes(type))?.short_name ?? "";

                const streetNumber = get("street_number");
                const route = get("route");
                const city =
                    components.find((c) => c.types.includes("locality"))?.long_name ??
                    components.find((c) =>
                        c.types.includes("sublocality_level_1")
                    )?.long_name ?? "";
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
        }

        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(
                    autocompleteRef.current
                );
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.textInput}>
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
