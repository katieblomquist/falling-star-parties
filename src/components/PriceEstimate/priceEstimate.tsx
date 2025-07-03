'use client';

import { Control, useWatch } from "react-hook-form"
import { FormValues } from "@/app/book/page"
import styles from "./priceEstimate.module.css"
import { useState, useEffect } from "react"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { extras, packages } from "@/app/mockData";

export default function PriceEstimate(props: { controller: Control<FormValues, any> }) {

    const [popupActive, activate] = useState(false);

    const control = props.controller
    const eventPackage = useWatch({ control, name: "Package" });
    const eventExtras = useWatch({ control, name: "Extras" });
    const numCharacters = useWatch({ control, name: "NumCharacters" });
    const numGuests = useWatch({ control, name: "Attendance" });
    const address = useWatch({ control, name: "Location.address" });
    const [width, setWidth] = useState(window.innerWidth);

    const [travelCost, setTravelCost] = useState(0);

    useEffect(() => {
        async function fetchTravelCost() {
            if (address) {
                const res = await fetch(`/api/travelfee/${address}`);
                if (res.ok) {
                    const obj = await res.json();
                    setTravelCost(obj);
                } else {
                    setTravelCost(0); // or handle error
                }
            }
        }
        fetchTravelCost();
    }, [address]);

    useEffect(() => {
        if (!popupActive) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                activatePopup();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [popupActive]);

    function calculateExtraCost() {
        let total = 0;
        if (eventExtras) {
            eventExtras.forEach(extra => {
                if (extras[extra].title === 'Gift Bags' && (numGuests !== undefined && numGuests !== '')) {
                    total += extras[extra].cost * parseInt(numGuests);
                } else {
                    total += extras[extra].cost;
                }

            });
        }

        return total;
    }

    function calculateCharacterCost() {
        if (numCharacters && eventPackage !== undefined) {

            return packages[eventPackage].additionalCharacterCost * (parseInt(numCharacters) - 1);

        } else {
            return 0
        }
    }

    function calculateTotal() {
        let total = 0;
        if (eventPackage !== undefined) {
            total += calculateCharacterCost();
            total += calculateExtraCost();
            total += travelCost;
            total += packages[eventPackage].cost;
        }


        return total;
    }

    function activatePopup() {
        activate(!popupActive);
    }

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        // return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {width > 1100 ? (
                <div className={styles.estimate}>
                    <h3 className={styles.header}>Your Estimate</h3>
                    {eventPackage > -1 ? (
                        <div className={styles.lineItem}>
                            <p>Base Visit: </p>
                            <p>${packages[eventPackage].cost}</p>
                        </div>
                    ) : null}

                    {eventExtras ? (

                        eventExtras.map((item) => {
                            return (
                                <>
                                    <div className={styles.lineItem}>
                                        <p>{extras[item].title}:</p>
                                        {extras[item].title === "Gift Bags" ? (
                                            numGuests ? (
                                                <p>${extras[item].cost * parseInt(numGuests)}</p>
                                            ) : (
                                                <p> -- </p>
                                            )

                                        ) : (
                                            <p>${extras[item].cost}</p>
                                        )}

                                    </div>
                                </>
                            )
                        })


                    ) : null}

                    {parseInt(numCharacters) > 1 ? (
                        <div className={styles.lineItem}>
                            <p>Additional Characters: </p>
                            <p>${calculateCharacterCost()}</p>
                        </div>
                    ) : null}

                    {eventPackage > -1 && travelCost !== 0 ? (
                            <div className={styles.lineItem}>
                                <p>Travel Fee: </p>
                                <p>${travelCost}</p>
                            </div>
                        ) : null}

                    <hr className={styles.equals}></hr>

                    <div className={styles.lineItem}>
                        <h4>Total: </h4>
                        <h4>${calculateTotal()}</h4>
                    </div>



                    <p className={styles.disclaimer}>Please note that estimates may not be exact and are subject to change. Our Fairy Godmother will contact you in the next 48 hours to finalize your booking and provide an exact quote.  </p>
                </div>
            ) : (
                <>
                    {popupActive ? (
                        <div className={styles.popupActiveBackground} onClick={activatePopup}></div>
                    ) : null}

                    <div className={popupActive ? styles.active : styles.inactive}>
                        <div className={styles.mobileHeader} onClick={activatePopup}>
                            <h4>Your Estimate</h4>
                            {popupActive ? (
                                <IconChevronDown />
                            ) : (
                                <IconChevronUp />
                            )}

                        </div>
                        {popupActive ? (
                            <div className={styles.estimateMobile} onClick={activatePopup}>
                                {eventPackage > -1 ? (
                                    <div className={styles.lineItem}>
                                        <p>Base Visit: </p>
                                        <p>${packages[eventPackage].cost}</p>
                                    </div>
                                ) : null}

                                {eventExtras ? (

                                    eventExtras.map((item) => {
                                        return (
                                            <>
                                                <div className={styles.lineItem}>
                                                    <p>{extras[item].title}:</p>
                                                    {extras[item].title === "Gift Bags" ? (
                                                        numGuests ? (
                                                            <p>${extras[item].cost * parseInt(numGuests)}</p>
                                                        ) : (
                                                            <p> -- </p>
                                                        )

                                                    ) : (
                                                        <p>${extras[item].cost}</p>
                                                    )}

                                                </div>
                                            </>
                                        )
                                    })


                                ) : null}

                                {parseInt(numCharacters) > 1 ? (
                                    <div className={styles.lineItem}>
                                        <p>Additional Characters: </p>
                                        <p>${calculateCharacterCost()}</p>
                                    </div>
                                ) : null}
                                <hr className={styles.equals}></hr>

                                <div className={styles.lineItem}>
                                    <h4>Total: </h4>
                                    <h4>${calculateTotal()}</h4>
                                </div>



                                <p className={styles.disclaimer}>Please note that estimates may not be exact and are subject to change. Our Fairy Godmother will contact you in the next 48 hours to finalize your booking and provide an exact quote.  </p>
                            </div>

                        ) : null}

                    </div>
                </>
            )}



        </>
    )
}