'use client'

import { StepperContent } from "@/app/book/page";
import { Content } from "next/font/google";
import { useState, useEffect, useRef } from "react"
import styles from "./stepper.module.css";
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react'

export default function Stepper(props: { content: StepperContent[] }) {



    const [current, setCurrent] = useState(0);
    const stepperContent = props.content;

    const handleNext = () => {
        if (current < stepperContent.length) {
            stepperContent[current].completed = true;
            setCurrent(current + 1);
        } else {
            handleSubmit();
        }
    }

    const handleSubmit = () => {

    }

    function buildStepper(step: StepperContent) {
        return (
            <div key={step.id} className={styles.step}>
                <div className={styles.header}>
                    {step.completed ? (
                        <IconCircleCheckFilled />
                        
                    ) : (
                        <IconCircle />
                    )}
                    <h4 className={styles.title}>{step.title}</h4>

                </div>
                {step.id === current ? (
                    <p onClick={handleNext}>This Step is Current</p>
                ) : null}
            </div>
        )

    };

    return (
        <div id="stepper">{stepperContent.map((step) => {
            return buildStepper(step)
        })}</div>
    )
}
