import DateSelector from "@/components/form/DateSelector/dateSelector";
import Dropdown from "@/components/form/Dropdown/dropdown";
import styles from "./timeLocation.module.css";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";
import { DateTime } from "luxon";
import PlacesAutocomplete, { Location } from "@/components/form/Places Autocomplete/placesAutocoomplet";
import { FormValues } from "@/app/book/page";

export const time = ["10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM", "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM", "12:00 PM", "12:15 PM", "12:30 PM",
    "12:45 PM", "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM", "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM", "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
    "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM", "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM", "6:00 PM"
]

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
                        <PlacesAutocomplete value={value} placeSelection={onChange} />
                    )}
                />

            </div>
        </>
    )
}