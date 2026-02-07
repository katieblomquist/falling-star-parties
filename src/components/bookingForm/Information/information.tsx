import Dropdown from "@/components/form/Dropdown/dropdown";
import TextInput from "@/components/form/Text Input/textInput";
import styles from "./information.module.css";
import { Control, Controller, FieldErrors, UseFormResetField } from "react-hook-form";
import { event } from "@/app/mockdata";
import { FormValues } from "@/app/book/page";


const errorTextStyle = { color: "#b3261e", fontSize: "0.875rem", marginTop: "0.25rem" };

export default function Information(props: { control: Control<FormValues, any>, resetField: UseFormResetField<FormValues>, errors: FieldErrors<FormValues> }) {

    function handleChangeEvnetType(value: string){
        props.resetField('ChildAge');
        props.resetField('ChildName');
        props.resetField('Extras');
        props.resetField('OrganizationName');
        props.resetField('Package');

        return(value);
    }

    return (
        <>
            <div>
                <h3 className={styles.header}>Name</h3>
                <div className={styles.nameInput}>
                    <Controller
                        control={props.control}
                        name="FirstName"
                        rules={{
                            required: "First name is required.",
                            validate: (value) => value?.trim().length > 0 || "First name is required."
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput type="text" placeholder="First Name" required={true} id="firstName" label="First Name" input={value} onChange={onChange} invalid={Boolean(props.errors.FirstName)} />
                        )}
                    />
                    {props.errors.FirstName?.message ? (
                        <p style={errorTextStyle}>{props.errors.FirstName.message}</p>
                    ) : null}
                    <Controller
                        control={props.control}
                        name="LastName"
                        rules={{
                            required: "Last name is required.",
                            validate: (value) => value?.trim().length > 0 || "Last name is required."
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput type="text" placeholder="Last Name" required={true} id="lastName" label={"Last Name"} input={value} onChange={onChange} invalid={Boolean(props.errors.LastName)} />
                        )}
                    />
                    {props.errors.LastName?.message ? (
                        <p style={errorTextStyle}>{props.errors.LastName.message}</p>
                    ) : null}
                </div>
            </div>

            <div>
                <h3 className={styles.header}>Email</h3>
                <Controller
                    control={props.control}
                    name="Email"
                    rules={{
                        required: "Email is required.",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address."
                        }
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput type="email" placeholder="Email" required={true} id="email" label="Email" input={value} onChange={onChange} invalid={Boolean(props.errors.Email)} />
                    )}
                />
                {props.errors.Email?.message ? (
                    <p style={errorTextStyle}>{props.errors.Email.message}</p>
                ) : null}
            </div>

            <div>
                <h3 className={styles.header}>Phone</h3>
                <Controller
                    control={props.control}
                    name="Phone"
                    rules={{
                        required: "Phone number is required.",
                        pattern: {
                            value: /^\+?[0-9\s().-]{7,}$/,
                            message: "Enter a valid phone number."
                        }
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput type="tel" placeholder="Phone" required={true} id="phone" label="Phone" input={value} onChange={onChange} invalid={Boolean(props.errors.Phone)} />
                    )}
                />
                {props.errors.Phone?.message ? (
                    <p style={errorTextStyle}>{props.errors.Phone.message}</p>
                ) : null}
            </div>

            <div>
                <h3 className={styles.header}>Event Type</h3>
                <Controller
                    control={props.control}
                    name="EventType"
                    rules={{ required: "Event type is required." }}
                    render={({ field: { onChange, value } }) => (
                            <Dropdown options={event} selected={value} invalid={Boolean(props.errors.EventType)} setData={(value) => {
                                onChange(handleChangeEvnetType(value))
                            }} />
                    )}
                />
                {props.errors.EventType?.message ? (
                    <p style={errorTextStyle}>{props.errors.EventType.message}</p>
                ) : null}

            </div>

        </>
    )
}