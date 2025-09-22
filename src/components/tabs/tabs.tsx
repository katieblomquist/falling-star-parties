'use client';

import { useState, useEffect } from "react";
import styles from './tabs.module.css'
import { TabArray } from "@/app/content";
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react'


export default function Tabs(props: { content: TabArray, blue: boolean }) {

    const [active, setActive] = useState(0);
    const [width, setWidth] = useState(window.innerWidth);
    const [home, setHome] = useState(true);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
    }, []);

    function setMobile(index: number){
        if(index === -1){
            setHome(true)
        }
        else{
            setHome(false);
            setActive(index);
        }
    }

    if (width > 750) {
        return (
            <>
                <div className={styles.tabs}>
                    <div className={styles[`tabList${props.blue ? "Blue" : "White"}`]}>
                        {props.content.map((tab, index) => (
                            <div
                                key={tab.label}
                                className={`${styles.tabButton} ${active === index ? styles[`tabButtonActive${props.blue ? "Blue" : "White"}`] : ""}`} // Combined classes
                                onClick={() => setMobile(index)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                    {active === -1 ? (
                        <div className={styles.tabContent}>
                            {props.content[0].content}
                        </div>
                    ) : (
                        <div className={styles.tabContent}>
                            {props.content[active].content}
                        </div>
                    )}

                </div >
            </>
        )
    } else {

        if (home) {
            return (
                <>
                    {props.content.map((tab, index) => (
                        <div className={styles.mobileTab} onClick={() => setMobile(index)}>
                            <h3>{tab.label}</h3>
                            <IconChevronRight />
                        </div>
                    ))}
                </>
            )
        } else {
            return (
                <>
                    <div>
                        <div className={styles.mobileTab} onClick={() => setMobile(-1)}>
                            <IconChevronLeft />
                            <h3 className={styles.header}>{props.content[active].label}</h3>
                        </div>
                        <div className={styles.tabContent}>
                            {props.content[active].content}
                        </div>
                    </div>
                </>
            )
        }
    }


}