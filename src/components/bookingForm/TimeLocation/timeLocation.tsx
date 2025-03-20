import DateSelector from "@/components/form/DateSelector/dateSelector";
import Dropdown from "@/components/form/Dropdown/dropdown";
import styles from "./timeLocation.module.css";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { DateTime } from "luxon";
import PlacesAutocomplete, { Location } from "@/components/form/Places Autocomplete/placesAutocoomplet";
import { FormValues } from "@/app/book/page";

export const hour = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"];
export const minute = ["00", "15", "30", "45"];

//Need to add AM/PM and Location Autocomplete

export default function TimeLocation(props: { controller: Control<FormValues, any>, setValue: UseFormSetValue<FormValues> }) {

    function setAm() {
        props.setValue('AmPm', "AM");
    }

    function setPm() {
        props.setValue('AmPm', "PM");
    }

    return (
        <>
            <div>
                <h4 className={styles.header}>Date</h4>
                <Controller
                    control={props.controller}
                    name="Date"
                    render={({ field: { onChange, value } }) => (
                        <DateSelector date={value ?? DateTime.local()} selectDate={onChange} />
                    )}
                />
            </div>
            <div>
                <h4 className={styles.header}>Time</h4>
                <div className={styles.timeInput}>
                    <Controller
                        control={props.controller}
                        name="Hour"
                        render={({ field: { onChange, value } }) => (
                            <Dropdown options={hour} selected={value} setData={onChange} />
                        )}
                    />
                    <p>:</p>
                    <Controller
                        control={props.controller}
                        name="Minute"
                        render={({ field: { onChange, value } }) => (
                            <Dropdown options={minute} selected={value} setData={onChange} />
                        )}
                    />
                    <Controller
                        control={props.controller}
                        name="AmPm"
                        render={({ field: { value } }) => (
                            <div className={styles.amPmContainer}>
                                <p className={styles[`amPm${value === 'AM' ? "Active" : ""}`]} onClick={setAm}>AM</p>
                                <p className={styles[`amPm${value === 'PM' ? "Active" : ""}`]} onClick={setPm}>PM</p>
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
                        <PlacesAutocomplete placeSelection={onChange} />
                    )}
                />

            </div>
        </>
    )
}