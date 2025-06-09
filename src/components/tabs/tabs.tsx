import { TabArray, booking } from "@/mocdata";
import Accordian from "../accordian/accordian";
import { useState } from "react";
import styles from './tabs.module.css'

export default function Tabs(props: { content: TabArray }) {

    const [active, setActive] = useState(0);

    return (
        <>
            <div className={styles.tabs}>
                <div className={styles.tabList}>
                    {props.content.map((tab, index) => (
                        <div
                            key={tab.label}
                            className={`${styles.tabButton} ${active === index ? styles.tabButtonActive : ""}`} // Combined classes
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