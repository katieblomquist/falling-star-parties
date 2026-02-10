'use client';

import styles from "./book.module.css"
import { useMemo, useState } from "react";
import Stepper from "@/components/form/Stepper/stepper";
import Information from "@/components/bookingForm/Information/information";
import TimeLocation from "@/components/bookingForm/TimeLocation/timeLocation";
import ThankYou from "@/components/bookingForm/ThankYou/thankYou";
import EventOptions from "@/components/bookingForm/EventOptions/eventOptions";
import EventDetails from "@/components/bookingForm/EventDetails/eventDetails";
import { useForm, useWatch } from "react-hook-form";
import ReviewRequest from "@/components/bookingForm/ReviewRequest/reviewRequest";
import { DateTime } from "luxon";
import NavBar from "@/components/navbar/navbar";
import { CharacterSelection, formal_script } from "../mockdata";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import Characters from "@/components/bookingForm/Characters/characters";
import { useRecaptcha } from "@/components/recaptcha/useRecaptcha";

export type FormValues = {
    FirstName: string,
    LastName: string,
    Email: string,
    Phone: string,
    EventType: string,
    Date: DateTime,
    Time: string,
    StreetAddress: string,
    City: string,
    State: string,
    Zip: string,
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

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [requestId, setRequestId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const recaptcha = useRecaptcha();

    const {
        handleSubmit,
        control,
        resetField,
        formState: { errors, isValid }
    } = useForm<FormValues>({ mode: "onChange" })

    const formValues = useWatch({ control }) as FormValues;

    const InformationValues = useWatch({ control, name: ["FirstName", "LastName", "Email", "Phone", "EventType"] });
    const informationHasErrors = Boolean(errors.FirstName || errors.LastName || errors.Email || errors.Phone || errors.EventType);
    const InformationIsComplete = useMemo(() => {
        return InformationValues.every(x => (x != null && x != '')) && !informationHasErrors;
    }, [InformationValues, informationHasErrors]);

    const TimeLocationValues = useWatch({ control, name: ["Date", "Time", "StreetAddress", "City", "State", "Zip"] });
    const timeLocationHasErrors = Boolean(errors.Date || errors.Time || errors.StreetAddress || errors.City || errors.State || errors.Zip);
    const TimeLocationIsComplete = useMemo(() => {
        return TimeLocationValues.every(x => (x != null && x != '')) && !timeLocationHasErrors;
    }, [TimeLocationValues, timeLocationHasErrors]);

    const EventOptionsValues = useWatch({ control, name: ["Package"] });
    const eventOptionsHasErrors = Boolean(errors.Package);
    const EventOptionsIsComplete = useMemo(() => {
        return EventOptionsValues.every(x => ((Array.isArray(x) && x.length > 0) || (typeof (x) == 'number' && x != null))) && !eventOptionsHasErrors;
    }, [EventOptionsValues, eventOptionsHasErrors]);

    const EventDetailsBirthdayValues = useWatch({ control, name: ["ChildName", "ChildAge", "Attendance", "LocationPref", "PhotoPref"] });
    const eventDetailsBirthdayHasErrors = Boolean(errors.ChildName || errors.ChildAge || errors.Attendance || errors.LocationPref || errors.PhotoPref);
    const EventDetailsBirthdayIsComplete = useMemo(() => {
        return EventDetailsBirthdayValues.every(x => (x != null && x != '')) && !eventDetailsBirthdayHasErrors;
    }, [EventDetailsBirthdayValues, eventDetailsBirthdayHasErrors]);

    const EventDetailsPublicValues = useWatch({ control, name: ["OrganizationName", "Attendance", "LocationPref", "PhotoPref"] });
    const eventDetailsPublicHasErrors = Boolean(errors.OrganizationName || errors.Attendance || errors.LocationPref || errors.PhotoPref);
    const EventDetailsPublicIsComplete = useMemo(() => {
        return EventDetailsPublicValues.every(x => (x != null && x != '')) && !eventDetailsPublicHasErrors;
    }, [EventDetailsPublicValues, eventDetailsPublicHasErrors]);

    const CharacterSelectionValues = useWatch({ control, name: "Character" })
    const characterNumber = useWatch({ control, name: "NumCharacters" })
    const CharacterSelectionIsComplete = useMemo(() => {
        if (characterNumber !== undefined && CharacterSelectionValues !== undefined) {
            return CharacterSelectionValues.length === parseInt(characterNumber) && !errors.Character && !errors.NumCharacters;
        } else {
            return false
        }

    }, [CharacterSelectionValues, characterNumber, errors.Character, errors.NumCharacters])

    const formIsValid = isValid;

    function mapFormValuesToRequestBody(formValues: FormValues) {
        const dateInZone = formValues.Date.setZone("America/New_York", { keepLocalTime: true });
        const parsedTime = DateTime.fromFormat(formValues.Time, "h:mm a", { zone: "America/New_York" });
        const dateTimeISO = dateInZone.set({
            hour: parsedTime.isValid ? parsedTime.hour : 0,
            minute: parsedTime.isValid ? parsedTime.minute : 0,
        }).toISO();

        return {
            firstName: formValues.FirstName,
            lastName: formValues.LastName,
            email: formValues.Email,
            phone: formValues.Phone,

            dateTime: dateTimeISO,
            address: `${formValues.StreetAddress}, ${formValues.City}, ${formValues.State} ${formValues.Zip}`,

            packageId: formValues.Package,
            characterSelections: formValues.Character ?? [],
            extrasIds: formValues.Extras || [],
            eventType: formValues.EventType,

            childName: formValues.ChildName ?? null,
            childAge: formValues.ChildAge ? parseInt(formValues.ChildAge, 10) : null,
            orgName: formValues.OrganizationName ?? null,

            numChildren: parseInt(formValues.Attendance, 10),

            locationPref: formValues.LocationPref,
            photoPref: formValues.PhotoPref.toLowerCase() === "yes",

            additionalInfo: formValues.AdditionalInfo ?? null,
        };
    }

    const submit = handleSubmit((data) => {
        if (!recaptcha.isVerified || !recaptcha.captchaToken) {
            alert("Please complete the captcha verification before submitting.");
            return;
        }
        setIsLoading(true);
        const body = {
            ...mapFormValuesToRequestBody(data),
            captchaToken: recaptcha.captchaToken,
            captchaVersion: recaptcha.captchaVersion,
        };
        fetch("/api/createEvent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
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
            .then(responseData => {
                setRequestId(responseData.pageId);
                setIsSubmitted(true);
                setIsLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(error => {
                setIsLoading(false);
                alert("Error submitting event: " + error.message);
            });
    });

    const stepperTest = [
        { id: 0, title: "Your Information", completed: InformationIsComplete, content: <Information control={control} resetField={resetField} errors={errors} /> },
        { id: 1, title: "Time & Location", completed: TimeLocationIsComplete, content: <TimeLocation controller={control} errors={errors} /> },
        { id: 2, title: "Event Options", completed: EventOptionsIsComplete, content: <EventOptions controller={control} resetField={resetField} errors={errors} /> },
        { id: 3, title: "Characters", completed: CharacterSelectionIsComplete, content: <Characters controller={control} resetField={resetField} errors={errors} /> },
        { id: 4, title: "Event Details", completed: EventDetailsBirthdayIsComplete || EventDetailsPublicIsComplete, content: <EventDetails controller={control} eventType={formValues.EventType} errors={errors} /> },
        { id: 5, title: "Review Request", completed: InformationIsComplete && TimeLocationIsComplete && EventOptionsIsComplete && (EventDetailsBirthdayIsComplete || EventDetailsPublicIsComplete), content: formIsValid ? <ReviewRequest values={formValues} /> : null }
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
                        {isLoading ? (
                            <div style={{textAlign: 'center', padding: '40px 0'}}>
                                <div className={styles.spinner}></div>
                                <p style={{marginTop: 16}}>Sending your request...</p>
                            </div>
                        ) : isSubmitted ? (
                            <ThankYou requestId={requestId} firstName={formValues.FirstName} />
                        ) : (
                            <div className={styles.stepper}>
                                <Stepper content={stepperTest} nextButtonText={"Next"} primaryFinalStepButton={"Send Request"} secondaryFinalStepButton={"Edit Your Event"} backButtonText={"Back"} submit={submit} recaptcha={recaptcha} />
                            </div>
                        )}

                        {/* <PriceEstimate controller={control} /> */}
                    </div>
                </form>
            </div>
            <Footer />
        </>
    )
}