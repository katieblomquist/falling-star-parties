'use client';

import { ChangeEvent } from "react";
import styles from "./textInput.module.css";

interface TextInputProps {
    type: string;
    placeholder: string;
    required: boolean;
    id: string;
    label: string;
    input: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    invalid?: boolean;
    errorMessage?: string;
}

export default function TextInput(props: TextInputProps) {

    const type = props.type;
    const placeholder = props.placeholder;
    const required = props.required;
    const id = props.id;

    const inputClassName = `${styles.input}${props.invalid ? ` ${styles.inputInvalid}` : ""}`;

    // Accept errorMessage prop for error text
    const errorMessage = (props as any).errorMessage;

    function buildInput() {
        return (
            <div className={styles.textInput}>
                <input
                    className={inputClassName}
                    type={type}
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    value={props.input}
                    onChange={props.onChange}
                    required={required}
                />
                {errorMessage && (
                    <div style={{ color: '#b3261e', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }

    return buildInput();
}