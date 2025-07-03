'use client';

import { useState } from "react";
import { IconChevronLeft, IconCircleFilled, IconCircle, IconChevronRight } from '@tabler/icons-react'
import styles from "./carousel.module.css"
import { ReactNode } from "react";

export default function Carousel(props: { content: Array<ReactNode> }) {

    const [selected, setSelected] = useState(0);
    const content = props.content;

    return (
        <>
            <div className={styles.content}>
                {content[selected]}
            </div>
            
            <div className={styles.navigation}>
                {selected === 0 ? (<div className={styles.placeholder}></div>) : (<IconChevronLeft className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected - 1)} />)}
                <div>
                    {content.map((item, index) => (
                        index === selected ? (
                            <IconCircleFilled className={styles.navItem} width="16" height="16" color="#A4A8B0" />
                        ) : (
                            < IconCircle className={styles.navItem} width="16" height="16" color="#A4A8B0" onClick={() => setSelected(index)} />
                        )
                    ))}
                </div>

                {selected === content.length - 1 ? (<div className={styles.placeholder}></div>) : (<IconChevronRight className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected + 1)} />)}
            </div>

        </>
    )
}