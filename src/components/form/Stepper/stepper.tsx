'use client'

import { Content } from "next/font/google";
import { useState, useEffect, useRef } from "react"
import styles from "./stepper.module.css";
import { IconCircleCheckFilled } from '@tabler/icons-react'
import Button from "@/components/Button/button";
import { StepperContent } from "@/app/mockData";

export default function Stepper(props: { content: StepperContent[], nextButtonText: string, primaryFinalStepButton: string, secondaryFinalStepButton: string, backButtonText: string }) {



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

    const handlePrevious = () => {
        if (current !== 0) {
            setCurrent(current - 1);
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
        if (step.id === current && step.id === last) {
            content =
                <div className={styles.stepContent}>
                    <div className={styles.stepContentInput}>{step.content}</div>
                    <div className={styles.stepFiveButtons}>
                        <Button text={props.secondaryFinalStepButton} action={handleEdit} variant={2} icon={0} enabled={true} />
                        <Button text={props.primaryFinalStepButton} action={handleSubmit} variant={1} icon={2} enabled={stepperContent.every((x) => x.completed)} />
                    </div>
                </div>
        } else if (step.id === current && step.id === 0) {
            content =
                <div className={styles.stepContent}>
                    <div className={styles.stepContentInput}>{step.content}</div>
                    <div className={styles.buttonsInitial}>
                        <Button text={props.nextButtonText} action={handleNext} variant={1} icon={1} enabled={stepperContent[stepperContent.map(item => item.id).indexOf(current)].completed} />
                    </div>
                </div>
        } else if(step.id === current){
            content =
                <div className={styles.stepContent}>
                    <div className={styles.stepContentInput}>{step.content}</div>
                    <div className={styles.buttons}>
                        <Button text={props.backButtonText} action={handlePrevious} variant={3} icon={3} enabled={true} />
                        <Button text={props.nextButtonText} action={handleNext} variant={1} icon={1} enabled={stepperContent[stepperContent.map(item => item.id).indexOf(current)].completed} />
                    </div>
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
                <div className={styles.stepperContent}>
                    {content}
                </div>

            </div >
        )

    };

    return (
        <div id="stepper" className={styles.stepper}>{stepperContent.map((step) => {
            return buildStepper(step)
        })}</div>
    )
}
