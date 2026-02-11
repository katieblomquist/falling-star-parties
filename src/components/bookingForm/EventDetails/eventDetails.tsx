import Dropdown from "@/components/form/Dropdown/dropdown";
import TextArea from "@/components/form/Text Area/textArea";
import TextInput from "@/components/form/Text Input/textInput";
import styles from "./eventDetails.module.css"
import { Control, Controller, FieldErrors } from "react-hook-form";
import { FormValues } from "@/app/book/page";
import { photos, location } from "@/app/mockdata";

const errorTextStyle = { color: "#b3261e", fontSize: "0.875rem", marginTop: "0.25rem" };

export default function EventDetails(props: { controller: Control<FormValues, any>, eventType: string | undefined, errors: FieldErrors<FormValues> }) {



    return (
        <>
            {props.eventType === "Birthday Party" ? (
                <div>
                    <div>
                        <h3 className={styles.header}>Child&apos;s Name and Age</h3>
                        <div className={styles.nameAge}>
                            <Controller
                                control={props.controller}
                                name="ChildName"
                                rules={{
                                    validate: (value) => {
                                        if (props.eventType !== "Birthday Party") {
                                            return true;
                                        }
                                        return value && value.trim().length > 0 || "Child name is required.";
                                    }
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        type={"text"}
                                        placeholder={"Child's Name"}
                                        required={true}
                                        id={"childName"}
                                        label={"Child's Name"}
                                        input={value ? value : ''}
                                        onChange={onChange}
                                        invalid={Boolean(props.errors.ChildName)}
                                        errorMessage={props.errors.ChildName?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={props.controller}
                                name="ChildAge"
                                rules={{
                                    validate: (value) => {
                                        if (props.eventType !== "Birthday Party") {
                                            return true;
                                        }
                                        if (!value) {
                                            return "Child age is required.";
                                        }
                                        const age = Number(value);
                                        if (Number.isNaN(age) || age <= 0) {
                                            return "Enter a valid age.";
                                        }
                                        return true;
                                    }
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        type={"number"}
                                        placeholder={"Child's Age"}
                                        required={true}
                                        id={"childAge"}
                                        label={"Child's Age"}
                                        input={value ? value : ''}
                                        onChange={onChange}
                                        invalid={Boolean(props.errors.ChildAge)}
                                        errorMessage={props.errors.ChildAge?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

            ) : (
                <div>
                    <div>
                        <h3 className={styles.header}>Organization Name</h3>
                        <div className={styles.nameAge}>
                            <Controller
                                control={props.controller}
                                name="OrganizationName"
                                rules={{
                                    validate: (value) => {
                                        if (props.eventType === "Birthday Party") {
                                            return true;
                                        }
                                        return value && value.trim().length > 0 || "Organization name is required.";
                                    }
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        type={"text"}
                                        placeholder={"Organization Name"}
                                        required={true}
                                        id={"organizationName"}
                                        label={"Organization Name"}
                                        input={value ? value : ''}
                                        onChange={onChange}
                                        invalid={Boolean(props.errors.OrganizationName)}
                                        errorMessage={props.errors.OrganizationName?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h3 className={styles.header}>Number of Children in Attendance</h3>
                <Controller
                    control={props.controller}
                    name="Attendance"
                    rules={{
                        required: "Please enter attendance.",
                        validate: (value) => {
                            const count = Number(value);
                            if (Number.isNaN(count) || count <= 0) {
                                return "Enter a valid attendance count.";
                            }
                            return true;
                        }
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput type={"number"} placeholder={"Children in Attendance"} required={true} id={"attendance"} label={"Number of Children in Attendance"} input={value} onChange={onChange} invalid={Boolean(props.errors.Attendance)} />
                    )}
                />
                {props.errors.Attendance?.message ? (
                    <p style={errorTextStyle}>{props.errors.Attendance.message}</p>
                ) : null}
            </div>
            <div>
                <h3 className={styles.header}>Location Preference</h3>
                <Controller
                    control={props.controller}
                    name="LocationPref"
                    rules={{ required: "Please select a location preference." }}
                    render={({ field: { onChange, value } }) => (
                        <Dropdown options={location} selected={value} setData={onChange} />
                    )}
                />
                {props.errors.LocationPref?.message ? (
                    <p style={errorTextStyle}>{props.errors.LocationPref.message}</p>
                ) : null}
            </div>
            <div>
                <h3 className={styles.header}>May we take photos of your event for our social media and website?</h3>
                <Controller
                    control={props.controller}
                    name="PhotoPref"
                    rules={{ required: "Please select a photo preference." }}
                    render={({ field: { onChange, value } }) => (
                        <Dropdown options={photos} selected={value} setData={onChange} />
                    )}
                />
                {props.errors.PhotoPref?.message ? (
                    <p style={errorTextStyle}>{props.errors.PhotoPref.message}</p>
                ) : null}
            </div>
            <div>
                <h3 className={styles.header}>Additional Comments (Optional)</h3>
                <Controller
                    control={props.controller}
                    name="AdditionalInfo"
                    render={({ field: { onChange, value } }) => (
                        <TextArea placeholder={"Anything else we should know?"} required={false} id={"additionalInfo"} label={"Additional Info"} input={value ? value : ''} setInput={onChange} />
                    )}
                />
            </div>

        </>
    )
}