'use client';

import DateSelector from "@/components/form/DateSelector/dateSelector";
import Dropdown from "@/components/form/Dropdown/dropdown";
import styles from "./timeLocation.module.css";
import { Control, Controller, FieldErrors, useFormContext } from "react-hook-form";
import PlacesAutocomplete, { Location, AddressComponents } from "@/components/form/Places Autocomplete/placesAutocoomplet";
import { FormValues } from "@/app/book/BookClient";
import { time } from "@/app/mockdata";

const errorTextStyle = { color: "#b3261e", fontSize: "0.875rem", marginTop: "0.25rem" };

export default function TimeLocation(props: { controller: Control<FormValues, any>, errors: FieldErrors<FormValues> }) {
    const { setValue, watch } = useFormContext<FormValues>();

    const addressDisplay = watch("StreetAddress")
        ? [watch("StreetAddress"), watch("City"), watch("State"), watch("Zip")]
              .filter(Boolean)
              .join(", ")
        : "";

    function handlePlaceSelected(location: Location, components: AddressComponents) {
        const street = [components.streetNumber, components.route].filter(Boolean).join(" ");
        setValue("StreetAddress", street || location.address, { shouldValidate: true });
        setValue("City", components.city, { shouldValidate: true });
        setValue("State", components.state, { shouldValidate: true });
        setValue("Zip", components.zip, { shouldValidate: true });
        setValue("LocationLat", location.lat, { shouldValidate: true });
        setValue("LocationLng", location.lng, { shouldValidate: true });
    }

    const addressInvalid = Boolean(
        props.errors.StreetAddress || props.errors.City || props.errors.State || props.errors.Zip
    );

    return (
        <>
            <div>
                <h4 className={styles.header}>Date</h4>
                <Controller
                    control={props.controller}
                    name="Date"
                    rules={{
                        validate: (value) => value != null || "Please select a date."
                    }}
                    render={({ field: { onChange, value } }) => (
                        <DateSelector date={value ?? null} selectDate={onChange} invalid={Boolean(props.errors.Date)} />
                    )}
                />
                {props.errors.Date?.message ? (
                    <p style={errorTextStyle}>{props.errors.Date.message}</p>
                ) : null}
            </div>
            <div>
                <h4 className={styles.header}>Time</h4>
                <div className={styles.timeInputContainer}>
                    <Controller
                        control={props.controller}
                        name="Time"
                        rules={{ required: "Please select a time." }}
                        render={({ field: { onChange, value } }) => (
                            <div className={styles.timeInput}>
                                <Dropdown options={time} selected={value} setData={onChange} invalid={Boolean(props.errors.Time)} />
                            </div>
                        )}
                    />
                    {props.errors.Time?.message ? (
                        <p style={errorTextStyle}>{props.errors.Time.message}</p>
                    ) : null}
                </div>
            </div>
            <div>
                <h4 className={styles.header}>Location</h4>
                {/* Hidden fields to register address parts with react-hook-form */}
                <Controller
                    control={props.controller}
                    name="StreetAddress"
                    rules={{ required: "Please select an address." }}
                    render={() => <></>}
                />
                <Controller
                    control={props.controller}
                    name="City"
                    rules={{ required: true }}
                    render={() => <></>}
                />
                <Controller
                    control={props.controller}
                    name="State"
                    rules={{ required: true }}
                    render={() => <></>}
                />
                <Controller
                    control={props.controller}
                    name="Zip"
                    rules={{ required: true }}
                    render={() => <></>}
                />
                <PlacesAutocomplete
                    value={addressDisplay}
                    onPlaceSelected={handlePlaceSelected}
                    invalid={addressInvalid}
                />
                {addressInvalid && !addressDisplay ? (
                    <p style={errorTextStyle}>Please select an address.</p>
                ) : null}
            </div>
        </>
    );
}
