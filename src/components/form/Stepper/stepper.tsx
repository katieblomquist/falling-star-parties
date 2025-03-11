'use client'

import { StepperContent } from "@/app/book/page";
import { Content } from "next/font/google";
import { useState, useEffect, useRef } from "react"
import styles from "./stepper.module.css";
import { IconCircleCheckFilled } from '@tabler/icons-react'
import Button from "@/components/Button/button";

export default function Stepper(props: { content: StepperContent[], nextButtonText: string, primaryFinalStepButton: string, secondaryFinalStepButton: string}) {



    const [current, setCurrent] = useState(0);
    const [inReview, setReview] = useState(false);
    const stepperContent = props.content;
    const last = stepperContent.length - 1

    const handleNext = () => {
        if (current < stepperContent.length) {
            setCurrent(current + 1);
        }
        if (current === stepperContent.length - 2) {
            setReview(false);
        }
    }

    const handleEdit = () => {
        setCurrent(0);
        setReview(true);
    }

    const handleClick = (id: number) => {
        if (inReview) {
            setCurrent(id);
        }
        if (id === stepperContent.length - 1) {
            setReview(false);
        }

    }

    const handleSubmit = () => {

    }

    function buildStepper(step: StepperContent) {
        let content;
        if (step.id === current) {
            content =
                <div className={styles.stepContent}>
                    <div className={styles.stepContentInput}>{step.content}</div>
                    {/* This needs to be refactored to make it generic.  */}
                    {step.id === last ? (
                        <div className={styles.stepFiveButtons}>
                            <Button text={props.secondaryFinalStepButton} action={handleEdit} variant={2} icon={0} />
                            <Button text={props.primaryFinalStepButton} action={handleSubmit} variant={1} icon={2} />
                        </div>
                    ) : (<div className={styles.buttons}><Button text={props.nextButtonText} action={handleNext} variant={1} icon={1} /></div>)}
                </div>
        }
        
        return (
            <div key={step.id} className={styles.step}>
                <div className={styles.header} onClick={() => handleClick(step.id)}>
                    {step.completed ? (
                        <IconCircleCheckFilled width={34} height={34} strokeWidth={1} />
                    ) : (
                        <h5 className={styles.number}>{step.id + 1}</h5>
                    )}
                    <h4 className={styles.title}>{step.title}</h4>
                </div>
                <div>
                    {content}
                </div>

            </div >
        )

    };

    return (
        <div id="stepper">{stepperContent.map((step) => {
            return buildStepper(step)
        })}</div>
    )
}
