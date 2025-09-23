'use client';

import { Control, useWatch } from "react-hook-form"
import { FormValues } from "@/app/book/page"
import styles from "./priceEstimate.module.css"
import { useState, useEffect, useMemo } from "react"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Packages } from "@/db/entities/packages";
import { AddOns } from "@/db/entities/addOns";
import { DateTime, Interval } from "luxon";

export default function PriceEstimate(props: { controller: Control<FormValues, any> }) {

    // const [popupActive, activate] = useState(false);

    // const control = props.controller
    // const selectedEventType = useWatch({ control, name: "EventType" });
    // const date = useWatch({control, name: "Date"})
    // const eventPackage = useWatch({ control, name: "Package" });
    // const eventExtras = useWatch({ control, name: "Extras" });
    // const numCharacters = useWatch({ control, name: "NumCharacters" });
    // const numGuests = useWatch({ control, name: "Attendance" });
    // const address = useWatch({ control, name: "Location" });
    // const [width, setWidth] = useState(window.innerWidth);
    // const [packageOptions, setPackages] = useState<Packages[]>([]);
    // const [extrasOptions, setExtrasOptions] = useState<AddOns[]>([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);

    // function isInNextWeek(day: DateTime) {
    //     const now = DateTime.now();
    //     const oneWeekFromNow = now.plus({ days: 7 });
    //     const interval = Interval.fromDateTimes(now, oneWeekFromNow);

    //     return interval.contains(day);
    // }


    // const selectedPackage = useMemo(() => {
    //     console.log("in selected pacakage", "event Package", eventPackage, "package options", packageOptions)
    //     return packageOptions.find(pkg => pkg.id === eventPackage);
    // }, [packageOptions, eventPackage]);

    // const [total, setTotal] = useState(0);
    // const [travelCost, setTravelCost] = useState(0);

    // useEffect(() => {
    //     async function fetchTravelCost() {
    //         if (address) {
    //             const res = await fetch(`/api/travelfee/${address}`);
    //             if (res.ok) {
    //                 const obj = await res.json();
    //                 setTravelCost(obj);
    //             } else {
    //                 setTravelCost(0); // or handle error
    //             }
    //         }
    //     }


    //     fetchTravelCost();
    // }, [address]);

    // useEffect(() => {
    //     const fetchPackages = async () => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const res = await fetch(`api/packages/${selectedEventType}`);
    //             if (!res.ok) throw new Error("Failed to fetch packages");
    //             const data: Packages[] = await res.json();
    //             setPackages(data);
    //         } catch (err: any) {
    //             setError(err.message || "Unknown error");
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     const fetchExtras = async () => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const res = await fetch(`api/addons/${selectedEventType}`);
    //             if (!res.ok) throw new Error("Failed to fetch Extras");
    //             const data: AddOns[] = await res.json();
    //             setExtrasOptions(data)
    //         } catch (err: any) {
    //             setError(err.message || "Unknown error");
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     fetchPackages();
    //     fetchExtras();
    // }, [selectedEventType])

    // useEffect(() => {
    //     function calculateTotal() {
    //         let total = 0;
    //         if (selectedPackage !== undefined) {
    //             total += calculateCharacterCost();
    //             total += calculateExtraCost();
    //             total += travelCost;
    //             total += selectedPackage.cost;
    //         }

    //         if(date && isInNextWeek(date)){
    //             total += (total*0.3)
    //         }
    //         setTotal(parseFloat(total.toFixed(2)));
    //     }

    //     calculateTotal();

    // }, [selectedPackage, eventExtras, numCharacters, numGuests, travelCost, extrasOptions]);



    // useEffect(() => {
    //     if (!popupActive) return;

    //     function handleKeyDown(e: KeyboardEvent) {
    //         if (e.key === "Escape") {
    //             activatePopup();
    //         }
    //     }

    //     window.addEventListener("keydown", handleKeyDown);
    //     return () => window.removeEventListener("keydown", handleKeyDown);
    // }, [popupActive]);

    // function calculateExtraCost() {
    //     let total = 0;
    //     if (eventExtras) {
    //         eventExtras.forEach(extra => {
    //             if (extrasOptions[extra - 1].title === 'Gift Bags' && (numGuests !== undefined && numGuests !== '')) {
    //                 total += extrasOptions[extra - 1].cost * parseInt(numGuests);
    //             } else {
    //                 total += extrasOptions[extra - 1].cost;
    //             }

    //         });
    //     }

    //     return total;
    // }

    // function calculateCharacterCost() {
    //     if (numCharacters && selectedPackage !== undefined) {

    //         return selectedPackage.additionalcharactercost * (parseInt(numCharacters) - 1);

    //     } else {
    //         return 0
    //     }
    // }

    // function activatePopup() {
    //     activate(!popupActive);
    // }

    // useEffect(() => {
    //     const handleResize = () => setWidth(window.innerWidth);
    //     window.addEventListener('resize', handleResize);
    //     // return () => window.removeEventListener('resize', handleResize);
    // }, []);

    // return (
    //     <>
    //         {width > 1100 ? (
    //             <div className={styles.estimate}>
    //                 <h3 className={styles.header}>Your Estimate</h3>
    //                 {selectedPackage !== undefined ? (
    //                     <div className={styles.lineItem}>
    //                         <p>Base Visit: </p>
    //                         <p>${selectedPackage?.cost}</p>
    //                     </div>

    //                 ) : null}

    //                 {eventExtras ? (

    //                     eventExtras.map((item) => {
    //                         return (
    //                             <>
    //                                 <div className={styles.lineItem}>
    //                                     <p>{extrasOptions[item - 1].title}:</p>
    //                                     {extrasOptions[item - 1].title === "Gift Bags" ? (
    //                                         numGuests ? (
    //                                             <p>${extrasOptions[item - 1].cost * parseInt(numGuests)}</p>
    //                                         ) : (
    //                                             <p> -- </p>
    //                                         )

    //                                     ) : (
    //                                         <p>${extrasOptions[item - 1].cost}</p>
    //                                     )}

    //                                 </div>
    //                             </>
    //                         )
    //                     })


    //                 ) : null}

    //                 {parseInt(numCharacters) > 1 ? (
    //                     <div className={styles.lineItem}>
    //                         <p>Additional Characters: </p>
    //                         <p>${calculateCharacterCost()}</p>
    //                     </div>
    //                 ) : null}

    //                 {travelCost !== 0 && selectedPackage !== undefined ? (
    //                     <div className={styles.lineItem}>
    //                         <p>Travel Fee: </p>
    //                         <p>${travelCost}</p>
    //                     </div>
    //                 ) : null}

    //                 <hr className={styles.equals}></hr>

    //                 <div className={styles.lineItem}>
    //                     <h4>Total: </h4>
    //                     <h4>${total}</h4>
    //                 </div>



    //                 <p className={styles.disclaimer}>Please note that estimates may not be exact and are subject to change. Our Fairy Godmother will contact you in the next 48 hours to finalize your booking and provide an exact quote.  </p>
    //             </div>
    //         ) : (
    //             <>
    //                 {popupActive ? (
    //                     <div className={styles.popupActiveBackground} onClick={activatePopup}></div>
    //                 ) : null}

    //                 <div className={popupActive ? styles.active : styles.inactive}>
    //                     <div className={styles.mobileHeader} onClick={activatePopup}>
    //                         <h4>Your Estimate</h4>
    //                         {popupActive ? (
    //                             <IconChevronDown />
    //                         ) : (
    //                             <IconChevronUp />
    //                         )}

    //                     </div>
    //                     {popupActive ? (
    //                         <div className={styles.estimateMobile} onClick={activatePopup}>
    //                             {selectedPackage !== undefined ? (
    //                                 <div className={styles.lineItem}>
    //                                     <p>Base Visit: </p>
    //                                     <p>${selectedPackage?.cost}</p>
    //                                 </div>
    //                             ) : null}

    //                             {eventExtras ? (

    //                                 eventExtras.map((item) => {
    //                                     return (
    //                                         <>
    //                                             <div className={styles.lineItem}>
    //                                                 <p>{extrasOptions[item - 1].title}:</p>
    //                                                 {extrasOptions[item - 1].title === "Gift Bags" ? (
    //                                                     numGuests ? (
    //                                                         <p>${extrasOptions[item - 1].cost * parseInt(numGuests)}</p>
    //                                                     ) : (
    //                                                         <p> -- </p>
    //                                                     )

    //                                                 ) : (
    //                                                     <p>${extrasOptions[item - 1].cost}</p>
    //                                                 )}

    //                                             </div>
    //                                         </>
    //                                     )
    //                                 })


    //                             ) : null}

    //                             {parseInt(numCharacters) > 1 ? (
    //                                 <div className={styles.lineItem}>
    //                                     <p>Additional Characters: </p>
    //                                     <p>${calculateCharacterCost()}</p>
    //                                 </div>
    //                             ) : null}
    //                             <hr className={styles.equals}></hr>

    //                             <div className={styles.lineItem}>
    //                                 <h4>Total: </h4>
    //                                 <h4>${total}</h4>
    //                             </div>



    //                             <p className={styles.disclaimer}>Please note that estimates may not be exact and are subject to change. Our Fairy Godmother will contact you in the next 48 hours to finalize your booking and provide an exact quote.  </p>
    //                         </div>

    //                     ) : null}

    //                 </div>
    //             </>
    //         )}



    //     </>
    // )
}