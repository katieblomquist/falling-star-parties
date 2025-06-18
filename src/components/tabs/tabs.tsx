'use client';

import { useState } from "react";
import styles from './tabs.module.css'
import { TabArray } from "@/app/mockData";

export default function Tabs(props: { content: TabArray, blue: boolean}) {

    const [active, setActive] = useState(0);

    return (
        <>
            <div className={styles.tabs}>
                <div className={styles[`tabList${props.blue? "Blue": "White"}`]}>
                    {props.content.map((tab, index) => (
                        <div
                            key={tab.label}
                            className={`${styles.tabButton} ${active === index ? styles[`tabButtonActive${props.blue ? "Blue": "White"}`]: ""}`} // Combined classes
                            onClick={() => setActive(index)}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>
                <div className={styles.tabContent}>
                    {props.content[active].content}
                </div>
            </div>
        </>
    )
}