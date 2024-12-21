'use client';

import Image from "next/image";
import styles from "./book.module.css"
import { Petit_Formal_Script } from "next/font/google";
import { useState } from "react";
import { title } from "process";
import Stepper from "@/components/form/Stepper/stepper";

export type StepperContent = { id: number, title: String, completed: boolean };

export const formal_script = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: '--formal-script', preload: false });

const stepperTest = [{id: 0, title: "Your Information", completed: false}, {id:1, title: "Time and Location", completed: false}, 
    {id: 2, title: "Event Options", completed: false}, {id: 3, title: "Event Details", completed: false}, 
    {id: 4, title: "Review Request", completed: false}];

export default function Book() {
    return (
        <>
            <div>
                <div>
                    <h1 className={styles.header}><span className={formal_script.className}>Enchant</span> Your Event</h1>
                </div>
                <div>
                    <div className={styles.headerBackground}></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" viewBox="0 0 1728 297" fill="none">
                        <path d="M0 0H1728V225.539C1569.89 225.539 1412.01 237.487 1255.71 261.282L1173.82 273.749C972.455 304.403 767.591 304.102 566.32 272.858L519.905 265.652C347.891 238.95 174.075 225.539 0 225.539V0Z" fill="#343B95" />
                    </svg>
                </div>
            </div>
            <Stepper content={stepperTest}/>
        </>
    )
}