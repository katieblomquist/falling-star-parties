'use client';

import { useState } from "react";
import styles from "./accordian.module.css";
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { FaqArray } from "@/app/content";


export default function Accordian(props: { content: FaqArray }) {

    const [open, setOpen] = useState(-1);

    function handleClick(index: number) {
        if(index === open){
            setOpen(-1);
        } else {
           setOpen(index) 
        }
        
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
                            {open === index ? (
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