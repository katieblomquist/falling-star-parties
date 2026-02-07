'use client';

import { ChangeEvent } from "react";
import styles from "./textInput.module.css";

export default function TextInput(props: { type: string, placeholder: string, required: boolean, id: string, label: string, input: string, onChange: (event: ChangeEvent<HTMLInputElement>) => void, invalid?: boolean }) {

    const type = props.type;
    const placeholder = props.placeholder;
    const required = props.required;
    const id = props.id;

    const inputClassName = `${styles.input}${props.invalid ? ` ${styles.inputInvalid}` : ""}`;

    function buildInput() {
        if (required) {
            return (
                <>
                    <div className={styles.textInput}>
                        <input className={inputClassName} type={type} id={id} name={id} placeholder={placeholder} value={props.input} onChange={props.onChange} required></input>
                    </div>

                </>
            )

        }
        return <input className={inputClassName} type={type} id={id} name={id} placeholder={placeholder} value={props.input} onChange={props.onChange} />;
    }

    return (
        buildInput()
    )
}