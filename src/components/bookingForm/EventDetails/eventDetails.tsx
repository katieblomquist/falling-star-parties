import Dropdown from "@/components/form/Dropdown/dropdown";
import TextArea from "@/components/form/Text Area/textArea";
import TextInput from "@/components/form/Text Input/textInput";
import { truncate } from "fs";
import { useState } from "react";
import styles from "./eventDetails.module.css"
import { Controller } from "react-hook-form";

export const location = ["Indoor", "Outdoor", "No Preference"];
export const photos = ["Yes", "No"];

export default function EventDetails(props: { controller: any }) {

    

    return (
        <>
            <div>
                <h4 className={styles.header}>Child's Name and Age</h4>
                <div className={styles.nameAge}>
                    <Controller
                        control={props.controller}
                        name="ChildName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput type={"text"} placeholder={"Child's Name"} required={true} id={"childName"} label={"Child's Name"} input={value} onChange={onChange} />
                        )}
                    />
                    <Controller
                        control={props.controller}
                        name="ChildAge"
                        render={({ field: { onChange, value } }) => (
                            <TextInput type={"number"} placeholder={"Child's Age"} required={true} id={"childAge"} label={"Child's Age"} input={value} onChange={onChange} />
                        )}
                    />
                </div>
            </div>
            <div>
                <h4 className={styles.header}>Number of Children in Attendance</h4>
                <Controller
                    control={props.controller}
                    name="Attendance"
                    render={({ field: { onChange, value } }) => (
                        <TextInput type={"number"} placeholder={"Children in Attendance"} required={true} id={"attendance"} label={"Number of Children in Attendance"} input={value} onChange={onChange} />
                    )}
                />
            </div>
            <div>
                <h4 className={styles.header}>Location Preference</h4>
                <Controller
                    control={props.controller}
                    name="LocationPref"
                    render={({ field: { onChange, value } }) => (
                        <Dropdown options={location} selected={value} setData={onChange} />
                    )}
                />
            </div>
            <div>
                <h4 className={styles.header}>May we take photos of your event for our social media and website?</h4>
                <Controller
                    control={props.controller}
                    name="PhotoPref"
                    render={({ field: { onChange, value } }) => (
                        <Dropdown options={photos} selected={value} setData={onChange} />
                    )}
                />
            </div>
            <div>
                <h4 className={styles.header}>Additional Comments (Optional)</h4>
                <Controller
                    control={props.controller}
                    name="AdditionalInfo"
                    render={({ field: { onChange, value } }) => (
                        <TextArea placeholder={"Anything else we should know?"} required={false} id={"additionalInfo"} label={"Additional Info"} input={value} setInput={onChange} />
                    )}
                />
            </div>
        </>
    )
}