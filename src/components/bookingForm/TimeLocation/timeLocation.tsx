import DateSelector from "@/components/form/DateSelector/dateSelector";
import Dropdown from "@/components/form/Dropdown/dropdown";
import styles from "./timeLocation.module.css";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";
import PlacesAutocomplete, { Location } from "@/components/form/Places Autocomplete/placesAutocoomplet";
import { FormValues } from "@/app/book/page";
import { time } from "@/app/mockdata";
import TextInput from "@/components/form/Text Input/textInput";

//Need to add AM/PM and Location Autocomplete

export default function TimeLocation(props: { controller: Control<FormValues, any>, setValue: UseFormSetValue<FormValues> }) {

    const control = props.controller

    return (
        <>
            <div>
                <h4 className={styles.header}>Date</h4>
                <Controller
                    control={props.controller}
                    name="Date"
                    render={({ field: { onChange, value } }) => (
                        <DateSelector date={value ?? null} selectDate={onChange} />
                    )}
                />
            </div>
            <div>
                <h4 className={styles.header}>Time</h4>
                <div className={styles.timeInputContainer}>
                    <Controller
                        control={props.controller}
                        name="Time"
                        render={({ field: { onChange, value } }) => (
                            <div className={styles.timeInput}>
                            <Dropdown options={time} selected={value} setData={onChange} />
                            </div>
                        )}
                    />
                </div>
            </div>
            <div>
                <h4 className={styles.header}>Location</h4>
                <Controller
                    control={props.controller}
                    name="Location"
                    render={({ field: { onChange, value } }) => (
                        <TextInput type={"text"} placeholder={"Full Event Address"} required={true} id={"address"} label={"Address"} input={value ? value : ''} onChange={onChange} />
                    )}
                />

            </div>
        </>
    )
}