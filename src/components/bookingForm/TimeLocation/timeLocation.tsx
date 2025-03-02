import DateSelector from "@/components/form/DateSelector/dateSelector";
import Dropdown from "@/components/form/Dropdown/dropdown";
import styles from "./timeLocation.module.css";
import { Controller } from "react-hook-form";
import { DateTime } from "luxon";

export const hour = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"];
export const minute = ["00", "15", "30", "45"];

//Need to add AM/PM and Location Autocomplete

export default function TimeLocation(props: { controller: any }) {

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
                </div>
            </div>
            <div>
                <h4 className={styles.header}>Location</h4>
            </div>
        </>
    )
}