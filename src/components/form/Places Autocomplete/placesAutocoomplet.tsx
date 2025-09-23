// import { useLoadScript } from "@react-google-maps/api";
// import { useRef, useEffect } from "react";
// import styles from "./placesAutocomplete.module.css"

// const libraries = ['places'];
// const apiKey = "AIzaSyDrIu7-K0NjzMKOmnE6_JBjtoVJhYbtEXw";
// export type Location = {
//     address: string;
//     lat: number;
//     lng: number;
// }

export default function PlacesAutocomplete(props: { value: Location | undefined, placeSelection: (location: Location) => void }) {

//     if (!apiKey) {
//         console.error('Google Maps API key is missing');
//         return <div>Error: Google Maps API key is not set</div>;
//     }
//     const { isLoaded, loadError } = useLoadScript({
//         googleMapsApiKey: apiKey,
//         libraries: libraries as ['places'],
//     });

//     const inputRef = useRef<HTMLInputElement>(null);
//     const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

//     useEffect(() => {
//         if (isLoaded && inputRef.current) {
//             autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
//                 types: ['address'],
//             });

//             autocompleteRef.current.addListener('place_changed', () => {
//                 const place = autocompleteRef.current?.getPlace();
//                 if (place?.geometry?.location) {
//                     const location: Location = {
//                         address: place.formatted_address || '',
//                         lat: place.geometry.location.lat(),
//                         lng: place.geometry.location.lng(),
//                     };
//                     props.placeSelection(location);
//                 }
//             });

//             if (props.value) {
//                 inputRef.current.value = props.value.address;
//               }
//         }
//     }, [isLoaded, props.placeSelection, props.value?.address]);

//     if (loadError) return <div>Error loading maps</div>;
//     if (!isLoaded) return <div>Loading...</div>;

//     return (
//         <div className={styles.textInput}>
//             <input className={styles.input}
//                 ref={inputRef}
//                 type="text"
//                 placeholder="Enter an address"
//             />
//         </div>

//     );
};