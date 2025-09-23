'use client';

import styles from "./book.module.css"
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
import NavBar from "@/components/navbar/navbar";
import { CharacterSelection, formal_script, numberCharacters } from "../mockdata";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import Characters from "@/components/bookingForm/Characters/characters";

export type FormValues = {
    FirstName: string,
    LastName: string,
    Email: string,
    Phone: string,
    EventType: string,
    Date: DateTime,
    Time: string,
    Location: string,
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

    const EventOptionsValues = useWatch({ control, name: ["Package"] });
    const EventOptionsIsComplete = useMemo(() => {
        return EventOptionsValues.every(x => ((Array.isArray(x) && x.length > 0) || (typeof (x) == 'number' && x != null)));
    }, [EventOptionsValues]);

    const EventDetailsBirthdayValues = useWatch({ control, name: ["ChildName", "ChildAge", "Attendance", "LocationPref", "PhotoPref"] });
    const EventDetailsBirthdayIsComplete = useMemo(() => {
        return EventDetailsBirthdayValues.every(x => (x != null && x != ''));
    }, [EventDetailsBirthdayValues]);

    const EventDetailsPublicValues = useWatch({ control, name: ["OrganizationName", "Attendance", "LocationPref", "PhotoPref"] });
    const EventDetailsPublicIsComplete = useMemo(() => {
        return EventDetailsPublicValues.every(x => (x != null && x != ''));
    }, [EventDetailsPublicValues]);

    const CharacterSelectionValues = useWatch({ control, name: "Character" })
    const characterNumber = useWatch({ control, name: ["NumCharacters"] })
    const CharacterSelectionIsComplete = useMemo(() => {
        if (characterNumber !== undefined && CharacterSelectionValues !== undefined) {
            return CharacterSelectionValues.length === parseInt(characterNumber[0])
        } else {
            return false
        }

    }, [CharacterSelectionValues])

    const formIsValid = useCallback((x: unknown): x is FormValues => {
        // TODO(@kblomquist) replace this with actual validation
        const formIsValid = true;

        return formIsValid;
    }, []);

    function mapFormValuesToRequestBody(formValues: FormValues) {
        // Extract/transform fields
        const date = formValues.Date;
        const [hourStr, minuteStr] = formValues.Time.split(":");
        const dateTimeISO = date.set({
            hour: parseInt(hourStr, 10),
            minute: parseInt(minuteStr, 10),
        }).toISO();

        return {
            firstName: formValues.FirstName,
            lastName: formValues.LastName,
            email: formValues.Email,
            phone: formValues.Phone,

            dateTime: dateTimeISO,
            address: formValues.Location, // or your formatted address string

            packageId: formValues.Package,

            childName: formValues.ChildName ?? null,
            childAge: formValues.ChildAge ? parseInt(formValues.ChildAge) : null,
            orgName: formValues.OrganizationName ?? null,

            numGuests: parseInt(formValues.Attendance, 10),

            outdoor: formValues.LocationPref.toLowerCase() === "outdoor",
            photoRelease: formValues.PhotoPref.toLowerCase() === "yes",

            additionalInfo: formValues.AdditionalInfo ?? null,

            addOnIds: formValues.Extras || [],
        };
    }

    const submit = () => {
        if (formIsValid(formValues)) {
            console.log(formValues);
            fetch("/api/createEvent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mapFormValuesToRequestBody(formValues)),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            alert("Failed to submit: " + (err.error || "Unknown error"));
                            throw new Error(err.error || "Unknown error");
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Event submitted successfully! Event ID: " + data.eventId);
                    // optional: do other UI updates here
                })
                .catch(error => {
                    alert("Error submitting event: " + error.message);
                });
        }

    };

    const stepperTest = [
        { id: 0, title: "Your Information", completed: InformationIsComplete, content: <Information control={control} resetField={resetField} /> },
        { id: 1, title: "Time and Location", completed: TimeLocationIsComplete, content: <TimeLocation controller={control} setValue={setValue} /> },
        { id: 2, title: "Event Options", completed: EventOptionsIsComplete, content: <EventOptions controller={control} resetField={resetField} /> },
        { id: 3, title: "Character Selection", completed: CharacterSelectionIsComplete, content: <Characters controller={control} resetField={resetField} /> },
        { id: 4, title: "Event Details", completed: EventDetailsBirthdayIsComplete || EventDetailsPublicIsComplete, content: <EventDetails controller={control} eventType={formValues.EventType} /> },
        { id: 5, title: "Review Request", completed: InformationIsComplete && TimeLocationIsComplete && EventOptionsIsComplete && (EventDetailsBirthdayIsComplete || EventDetailsPublicIsComplete), content: formIsValid(formValues) ? <ReviewRequest values={formValues} /> : null }
    ];
    return (
        <>
            <NavBar location={"book"} />
            <div>
                <div className={styles.headerWrapper}>
                    <div>
                        <h1 className={styles.header}><span className={formal_script.className}>Enchant</span> Your Event</h1>
                    </div>
                    <Swoop top={true} color={'white'} direction={'center'} />
                </div>
                <form>
                    <div className={styles.booking}>
                        <div className={styles.stepper}>
                            <Stepper content={stepperTest} nextButtonText={"Continue"} primaryFinalStepButton={"Send Request"} secondaryFinalStepButton={"Edit Your Event"} backButtonText={"Back"} submit={submit} />
                        </div>

                        {/* <PriceEstimate controller={control} /> */}
                    </div>
                </form>
            </div>
            <Footer />
        </>
    )
}