import Dropdown from "@/components/form/Dropdown/dropdown";
import TextInput from "@/components/form/Text Input/textInput";
import { useState } from "react";
import styles from "./information.module.css";
import { FormValues } from "@/app/book/page";
import { Controller } from "react-hook-form";

export const event = ["Birthday Party", "Public Event"];

export default function Information(props: { control: any }) {

    return (
        <>
            <div>
                <h4 className={styles.header}>Name</h4>
                <div className={styles.nameInput}>
                    <Controller
                        control={props.control}
                        name="FirstName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput type="text" placeholder="First Name" required={true} id="firstName" label="First Name" input={value} onChange={onChange} />
                        )}
                    />
                    <Controller
                        control={props.control}
                        name="LastName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput type="text" placeholder="Last Name" required={true} id="lastName" label={"Last Name"} input={value} onChange={onChange} />
                        )}
                    />
                </div>
            </div>

            <div>
                <h4 className={styles.header}>Email</h4>
                <Controller
                    control={props.control}
                    name="Email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput type="email" placeholder="Email" required={true} id="email" label="Email" input={value} onChange={onChange} />
                    )}
                />
            </div>

            <div>
                <h4 className={styles.header}>Phone</h4>
                <Controller
                    control={props.control}
                    name="Phone"
                    render={({ field: { onChange, value } }) => (
                        <TextInput type="tel" placeholder="Phone" required={true} id="phone" label="Phone" input={value} onChange={onChange} />
                    )}
                />
            </div>

            <div>
                <h4 className={styles.header}>Event Type</h4>
                <Controller
                    control={props.control}
                    name="EventType"
                    render={({ field: { onChange, value } }) => (
                            <Dropdown options={event} selected={value} setData={onChange} />
                    )}
                />

            </div>

        </>
    )
}