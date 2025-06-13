import { FaqArray } from "@/mocdata";
import { useState } from "react";
import styles from "./accordian.module.css";
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

export default function Accordian(props: { content: FaqArray }) {

    const [open, setOpen] = useState(-1);

    function handleClick(index: number) {
        setOpen(open > -1 ? -1 : index)
    }

    return (
        <>
            <div className={styles.accordionContainer}>
                {props.content.map((item, index) => (
                    <div className={styles.item} key={index}>
                        <div
                            className={styles.button}
                            onClick={() => handleClick(index)}
                        >
                            <div>
                                {item.question}
                            </div>
                            {open > -1 ? (
                                <IconChevronUp />
                            ) : (
                                <IconChevronDown />
                            )}
                        </div>
                        {open === index && <div className={styles.open} >{item.answer}</div>}
                    </div>
                ))}
            </div>
        </>
    )
}