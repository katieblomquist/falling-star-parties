'use client';

import styles from "./textArea.module.css";

export default function TextArea(props: { placeholder: string, required: boolean, id: string, label: string, input: string, setInput: (data: string) => void, invalid?: boolean }) {

    const placeholder = props.placeholder;
    const required = props.required;
    const id = props.id;
    const label = props.label;

    // const htmlInput = document.getElementById(id);
    // htmlInput?.addEventListener("change", updateValue);

    function updateValue(e: any) {
        props.setInput(e.target.value);
    }

    const inputClassName = `${styles.input}${props.invalid ? ` ${styles.inputInvalid}` : ""}`;

    function buildInput() {
        if (required) {
            return (
                <>
                    <div className={styles.area}>
                        <textarea className={inputClassName} id={id} name={id} placeholder={placeholder} value={props.input} required></textarea>
                    </div>

                </>
            )

        }
        return (
            <>
                <textarea className={inputClassName} id={id} name={id} placeholder={placeholder} value={props.input} onChange={updateValue}></textarea>
            </>
        );
    }

    return (
        buildInput()
    )
}