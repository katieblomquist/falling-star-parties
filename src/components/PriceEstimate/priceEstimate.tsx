import { Control, useWatch } from "react-hook-form"
import { FormValues } from "@/app/book/page"
import { packages, extras } from "@/app/mockData"
import styles from "./priceEstimate.module.css"
import { useState } from "react"

export default function PriceEstimate(props: { controller: Control<FormValues, any> }) {

    const [eventCost, updateEventCost] = useState(0);

    const control = props.controller
    const eventPackage = useWatch({ control, name: "Package" });
    const eventExtras = useWatch({ control, name: "Extras" });
    const numCharacters = useWatch({ control, name: "NumCharacters" });

    function calculateExtraCost() {
        let total = 0;
        if (eventExtras) {
            eventExtras.forEach(extra => {
                total += extras[extra].cost;
            });
        }

        return total;
    }

    function calculateCharacterCost() {
        let total = 0;
        if (numCharacters && eventPackage) {
            total = packages[eventPackage].additionalCharacterCost * (parseInt(numCharacters) - 1);
        }

        return total;
    }

    function calculateTotal() {
        let total = 0;
        total += calculateCharacterCost();
        total += calculateExtraCost();
        total+= packages[eventPackage].cost;

        return total;
    }

    return (
        <>
            <div className={styles.estimate}>
                <h3 className={styles.header}>Your Estimate</h3>
                {eventPackage ? (
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
                                    <p>${extras[item].cost}</p>
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

                {eventPackage ? (
                    <>
                        <hr className={styles.equals}></hr>

                        <div className={styles.lineItem}>
                            <h4>Total: </h4>
                            <h4>${calculateTotal()}</h4>
                        </div>
                    </>

                ) : null}



                <p className={styles.disclaimer}>Please note that estimates may not be exact and are subject to change. Our Fairy Godmother will contact you in the next 48 hours to finalize your booking and provide an exact quote.  </p>
            </div>


        </>
    )
}