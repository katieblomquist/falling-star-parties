import { ChangeEvent, useState } from "react";
import styles from "./textInput.module.css";

export default function TextInput(props: { type: string, placeholder: string, required: boolean, id: string, label: string, input: string, onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {

    const type = props.type;
    const placeholder = props.placeholder;
    const required = props.required;
    const id = props.id;

    // function updateValue(e: ChangeEvent<HTMLInputElement>) {
    //     props.setInput(e.target.value);
    // }

    function buildInput() {
        if (required) {
            return (
                <>
                    <div className={styles.textInput}>
                        <input className={styles.input} type={type} id={id} name={id} placeholder={placeholder} value={props.input} onChange={props.onChange} required></input>
                    </div>

                </>
            )

        }
        return <input type={type} id={id} name={id} placeholder={placeholder} value={props.input} onChange={props.onChange} />;
    }

    return (
        buildInput()
    )
}