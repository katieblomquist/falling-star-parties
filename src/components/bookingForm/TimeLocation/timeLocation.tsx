import DateSelector from "@/components/form/DateSelector/dateSelector";
import Dropdown from "@/components/form/Dropdown/dropdown";
import styles from "./timeLocation.module.css";
import { Control, Controller, FieldErrors } from "react-hook-form";
// import PlacesAutocomplete, { Location } from "@/components/form/Places Autocomplete/placesAutocoomplet";
import { FormValues } from "@/app/book/page";
import { time } from "@/app/mockdata";
import TextInput from "@/components/form/Text Input/textInput";

//Need to add AM/PM and Location Autocomplete

const errorTextStyle = { color: "#b3261e", fontSize: "0.875rem", marginTop: "0.25rem" };

export default function TimeLocation(props: { controller: Control<FormValues, any>, errors: FieldErrors<FormValues> }) {

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
                        <div className={styles.addressGroup}>
                            <Controller
                                control={props.controller}
                                name="StreetAddress"
                                rules={{
                                    required: "Street address is required.",
                                    validate: (value) => value && value.trim().length > 0 || "Street address is required."
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput type={"text"} placeholder={"Street Address"} required={true} id={"streetAddress"} label={"Street Address"} input={value ? value : ''} onChange={onChange} invalid={Boolean(props.errors.StreetAddress)} />
                                )}
                            />
                            {props.errors.StreetAddress?.message ? (
                                <p style={errorTextStyle}>{props.errors.StreetAddress.message}</p>
                            ) : null}
                            <div className={styles.addressRow}>
                                <div className={styles.addressField}>
                                    <Controller
                                        control={props.controller}
                                        name="City"
                                        rules={{
                                            required: "City is required.",
                                            validate: (value) => value && value.trim().length > 0 || "City is required."
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput type={"text"} placeholder={"City"} required={true} id={"city"} label={"City"} input={value ? value : ''} onChange={onChange} invalid={Boolean(props.errors.City)} />
                                        )}
                                    />
                                    {props.errors.City?.message ? (
                                        <p style={errorTextStyle}>{props.errors.City.message}</p>
                                    ) : null}
                                </div>
                                <div className={styles.addressField}>
                                    <Controller
                                        control={props.controller}
                                        name="State"
                                        rules={{
                                            required: "State is required.",
                                            validate: (value) => value && value.trim().length > 0 || "State is required."
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput type={"text"} placeholder={"State"} required={true} id={"state"} label={"State"} input={value ? value : ''} onChange={onChange} invalid={Boolean(props.errors.State)} />
                                        )}
                                    />
                                    {props.errors.State?.message ? (
                                        <p style={errorTextStyle}>{props.errors.State.message}</p>
                                    ) : null}
                                </div>
                                <div className={styles.addressField}>
                                    <Controller
                                        control={props.controller}
                                        name="Zip"
                                        rules={{
                                            required: "Zip is required.",
                                            validate: (value) => value && value.trim().length > 0 || "Zip is required."
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput type={"text"} placeholder={"Zip"} required={true} id={"zip"} label={"Zip"} input={value ? value : ''} onChange={onChange} invalid={Boolean(props.errors.Zip)} />
                                        )}
                                    />
                                    {props.errors.Zip?.message ? (
                                        <p style={errorTextStyle}>{props.errors.Zip.message}</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
        </>
    )
}