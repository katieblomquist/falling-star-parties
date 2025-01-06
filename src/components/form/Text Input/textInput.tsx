import { useState } from "react";
import styles from "./textInput.module.css";

export default function TextInput(props: { type: string, placeholder: string, required: boolean, id: string, label: string, input: string, setInput: (data: string) => void }) {

    const type = props.type;
    const placeholder = props.placeholder;
    const required = props.required;
    const id = props.id;
    const label = props.label;

    const htmlInput = document.getElementById(id);
    htmlInput?.addEventListener("change", updateValue);

    function updateValue(e: any) {
        props.setInput(e.target.value);
    }

    function buildInput() {
        if (required) {
            return (
                <>
                    <div className={styles.textInput}>
                        <label>{label}</label>
                        <input className={styles.input} type={type} id={id} name={id} placeholder={placeholder} required></input>
                    </div>

                </>
            )

        }
        return (
            <>
                <label>{label}</label>
                <input type={type} id={id} name={id} placeholder={placeholder}></input>
            </>
        );
    }

    return (
        buildInput()
    )
}