'use client';

import { useState, useEffect } from "react";
import styles from "./accordian.module.css";
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { FaqArray } from "@/app/content";


export default function Accordian(props: { content: FaqArray }) {

    const [open, setOpen] = useState(-1);
    const [width, setWidth] = useState(0);

useEffect(() => {
    function handleResize() {
        setWidth(window.innerWidth);
    }

    // Set width initially
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);

    function handleClick(index: number) {
        if (index === open) {
            setOpen(-1);
        } else {
            setOpen(index)
        }

    }

    if (width > 750) {
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
    } else {
        return (
            <>
                <div className={styles.accordionContainer}>
                    {props.content.map((item, index) => (
                        <div className={styles.item} key={index}>
                            <div className={styles.button}>
                                <h4>{item.question}</h4>
                            </div>
                            <div className={styles.open} >{item.answer}</div>
                        </div>
                    ))}
                </div>
            </>
        )
    }


}