'use client';

import styles from "./book.module.css"
import { Content, Petit_Formal_Script } from "next/font/google";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Stepper from "@/components/form/Stepper/stepper";
import Information from "@/components/bookingForm/Information/information";
import TimeLocation from "@/components/bookingForm/TimeLocation/timeLocation";
import EventOptions from "@/components/bookingForm/EventOptions/eventOptions";
import EventDetails from "@/components/bookingForm/EventDetails/eventDetails";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import ReviewRequest from "@/components/bookingForm/ReviewRequest/reviewRequest";
import { DateTime } from "luxon";
import { Location } from "@/components/form/Places Autocomplete/placesAutocoomplet";
import PriceEstimate from "@/components/PriceEstimate/priceEstimate";
import NavBsr from "@/components/navbar/navbar";

export type StepperContent = { id: number, title: String, completed: boolean, content: ReactNode };
export type Services = { id: number, type: string, title: String, description: String, duration: String, cost: number, additionalCharacterCost: number};
export type CharacterDress = {id: number, name: String, img: String, characterId: number};
export type Character = {id: number, name: String, img:String};
export type CharacterSelection = {characterId: number, dressId: number}

export const formal_script = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: '--formal-script', preload: false });

export type FormValues = {
    FirstName: string,
    LastName: string,
    Email: string,
    Phone: string,
    EventType: string,
    Date: DateTime,
    Time: string,
    Location: Location,
    Package: number,
    Extras?: number[],
    NumCharacters: string,
    Character: CharacterSelection[],
    ChildName?: string,
    ChildAge?: string,
    OrganizationName?: string,
    Attendance: string,
    LocationPref: string,
    PhotoPref: string,
    AdditionalInfo?: string
}

export default function Book() {

    const { handleSubmit, control, resetField, setValue } = useForm<FormValues>()

    const formValues = useWatch({ control });

    const InformationValues = useWatch({ control, name: ["FirstName", "LastName", "Email", "Phone", "EventType"] });
    const InformationIsComplete = useMemo(() => {
        return InformationValues.every(x => (x != null && x != ''));
    }, [InformationValues]);

    const TimeLocationValues = useWatch({ control, name: ["Date", "Time", "Location"] });
    const TimeLocationIsComplete = useMemo(() => {
        return TimeLocationValues.every(x => (x != null && x != ''));
    }, [TimeLocationValues]);

    const EventOptionsValues = useWatch({control, name: ["Package", "Character"]});
    const EventOptionsIsComplete = useMemo(() => {
        return EventOptionsValues.every(x => ((Array.isArray(x) && x.length > 0) || (typeof(x) == 'number' && x != null  )));
    }, [EventOptionsValues]);

    const EventDetailsBirthdayValues = useWatch({control, name:["ChildName", "ChildAge", "Attendance", "LocationPref", "PhotoPref"]});
    const EventDetailsBirthdayIsComplete = useMemo(() => {
        return EventDetailsBirthdayValues.every(x => (x != null && x !=  ''));
    }, [EventDetailsBirthdayValues]);

    const EventDetailsPublicValues = useWatch({control, name: ["OrganizationName", "Attendance", "LocationPref", "PhotoPref"]});
    const EventDetailsPublicIsComplete = useMemo(() => {
        return EventDetailsPublicValues.every(x => (x != null && x != ''));
    }, [EventDetailsPublicValues]);

    const formIsValid = useCallback((x: unknown): x is FormValues => {
        // TODO(@kblomquist) replace this with actual validation
        const formIsValid = true;

        return formIsValid;
    }, []);


    const stepperTest = [
        { id: 0, title: "Your Information", completed: InformationIsComplete, content: <Information control={control} /> },
        { id: 1, title: "Time and Location", completed: TimeLocationIsComplete, content: <TimeLocation controller={control} setValue={setValue} /> },
        { id: 2, title: "Event Options", completed: EventOptionsIsComplete, content: <EventOptions controller={control} resetField={resetField} /> },
        { id: 3, title: "Event Details", completed: EventDetailsBirthdayIsComplete || EventDetailsPublicIsComplete , content: <EventDetails controller={control} eventType={formValues.EventType} /> },
        { id: 4, title: "Review Request", completed: InformationIsComplete && TimeLocationIsComplete && EventOptionsIsComplete && (EventDetailsBirthdayIsComplete || EventDetailsPublicIsComplete), content: formIsValid(formValues) ? <ReviewRequest values={formValues} /> : null }
    ];
    return (
        <>
        <NavBsr />
        <div>
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
            <form>
                <div className={styles.booking}>
                    <div className={styles.stepper}>
                        <Stepper content={stepperTest} nextButtonText={"Continue"} primaryFinalStepButton={"Send Request"} secondaryFinalStepButton={"Edit Your Event"} />
                    </div>
                
                <PriceEstimate controller={control} />
                </div>
            </form>
        </div>
            
        </>
    )
}