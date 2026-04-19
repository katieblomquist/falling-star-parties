'use client';

import { Control, useWatch } from "react-hook-form";
import { FormValues } from "@/app/book/BookClient";
import styles from "./priceEstimate.module.css";
import { useState, useEffect, useMemo } from "react";
import { useRecaptchaV3 } from "@/lib/useRecaptchaV3";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { packages, extras } from "@/app/content";
import { DateTime, Interval } from "luxon";

export default function PriceEstimate(props: { controller: Control<FormValues, any> }) {

    const [popupActive, activate] = useState(false);

    const control = props.controller;
    const selectedEventType = useWatch({ control, name: "EventType" });
    const date = useWatch({ control, name: "Date" });
    const eventPackage = useWatch({ control, name: "Package" });
    const eventExtras = useWatch({ control, name: "Extras" });
    const numCharacters = useWatch({ control, name: "NumCharacters" });
    const numGuests = useWatch({ control, name: "Attendance" });
    const locationLat = useWatch({ control, name: "LocationLat" });
    const locationLng = useWatch({ control, name: "LocationLng" });
    const isManualAddress = useWatch({ control, name: "IsManualAddress" });

    const [isMobile, setIsMobile] = useState(false);
    const [inactiveBottom, setInactiveBottom] = useState<number | undefined>(undefined);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [travelCost, setTravelCost] = useState(0);
    const [total, setTotal] = useState(0);
    const [lastMinuteFee, setLastMinuteFee] = useState(0);
    const getRecaptchaToken = useRecaptchaV3("travel_fee");

    // SSR-safe responsive check
    useEffect(() => {
        function checkWidth() {
            setIsMobile(window.innerWidth <= 1100);
        }
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return () => window.removeEventListener("resize", checkWidth);
    }, []);

    // On iOS, fixed-bottom elements jump above the keyboard when it opens.
    // visualViewport tracks the actual visible area; we offset the inactive bar
    // downward by the gap between the layout viewport and the visual viewport
    // so it stays pinned to the real bottom of the screen (under the keyboard).
    useEffect(() => {
        if (!isMobile || popupActive) return;
        const vv = window.visualViewport;
        if (!vv) return;

        function updateBottom() {
            const offsetFromBottom =
                window.innerHeight - (vv!.height + vv!.offsetTop);
            setInactiveBottom(offsetFromBottom > 0 ? offsetFromBottom : 0);
            setIsKeyboardOpen(window.innerHeight - vv!.height > 150);
        }

        updateBottom();
        vv.addEventListener("resize", updateBottom);
        vv.addEventListener("scroll", updateBottom);
        return () => {
            vv.removeEventListener("resize", updateBottom);
            vv.removeEventListener("scroll", updateBottom);
            setInactiveBottom(undefined);
            setIsKeyboardOpen(false);
        };
    }, [isMobile, popupActive]);

    function isInNextWeek(day: DateTime) {
        const now = DateTime.now();
        const oneWeekFromNow = now.plus({ days: 7 });
        const interval = Interval.fromDateTimes(now, oneWeekFromNow);
        return interval.contains(day);
    }

    // Filter packages and extras by selected event type
    const packageOptions = useMemo(() => {
        return packages.filter((pkg) => pkg.type === selectedEventType);
    }, [selectedEventType]);

    const extrasOptions = useMemo(() => {
        return extras.filter((e) => e.type === selectedEventType);
    }, [selectedEventType]);

    const selectedPackage = useMemo(() => {
        return packageOptions.find((pkg) => pkg.id === eventPackage);
    }, [packageOptions, eventPackage]);

    // Fetch travel cost when lat/lng are available
    useEffect(() => {
        async function fetchTravelCost() {
            if (locationLat != null && locationLng != null) {
                try {
                    const captchaToken = await getRecaptchaToken();
                    const res = await fetch(
                        `/api/travelfee?lat=${locationLat}&lng=${locationLng}&captchaToken=${captchaToken}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        setTravelCost(data.fee ?? 0);
                    } else {
                        setTravelCost(0);
                    }
                } catch {
                    setTravelCost(0);
                }
            } else {
                setTravelCost(0);
            }
        }
        fetchTravelCost();
    }, [locationLat, locationLng]);

    // Recalculate total whenever dependencies change
    useEffect(() => {
        function calculateCharacterCost(): number {
            if (numCharacters && selectedPackage !== undefined) {
                return selectedPackage.additionalCharacterCost * (parseInt(numCharacters) - 1);
            }
            return 0;
        }

        function calculateExtraCost(): number {
            let cost = 0;
            if (eventExtras) {
                eventExtras.forEach((extraId) => {
                    const extra = extrasOptions.find((e) => e.id === extraId);
                    if (!extra) return;
                    if (extra.title === "Gift Bags" && numGuests) {
                        cost += extra.cost * parseInt(numGuests);
                    } else {
                        cost += extra.cost;
                    }
                });
            }
            return cost;
        }

        function calculateTotal() {
            let t = 0;
            if (selectedPackage !== undefined) {
                t += selectedPackage.cost;
                t += calculateCharacterCost();
                t += calculateExtraCost();
                t += travelCost;
            }
            let surcharge = 0;
            if (date && isInNextWeek(date)) {
                surcharge = Math.floor(t * 0.3);
                t += surcharge;
            }
            setLastMinuteFee(surcharge);
            setTotal(Math.floor(t));
        }

        calculateTotal();
    }, [selectedPackage, eventExtras, numCharacters, numGuests, travelCost, extrasOptions, date]);

    // Escape key closes mobile popup + lock background scroll while open
    useEffect(() => {
        if (!popupActive) return;
        document.body.style.overflow = 'hidden';
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                activate(false);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [popupActive]);

    function activatePopup() {
        activate((prev) => !prev);
    }

    const lineItems = (
        <>
            {selectedPackage === undefined && (
                <p className={styles.emptyState}>Select a package to see your estimate.</p>
            )}

            {selectedPackage !== undefined ? (
                <div className={styles.lineItem}>
                    <p>Base Visit: </p>
                    <p>${selectedPackage.cost}</p>
                </div>
            ) : null}

            {eventExtras
                ? eventExtras.map((extraId) => {
                      const extra = extrasOptions.find((e) => e.id === extraId);
                      if (!extra) return null;
                      return (
                          <div key={extraId} className={styles.lineItem}>
                              <p>{extra.title}:</p>
                              {extra.title === "Gift Bags" ? (
                                  numGuests ? (
                                      <p>${extra.cost * parseInt(numGuests)}</p>
                                  ) : (
                                      <p>--</p>
                                  )
                              ) : (
                                  <p>${extra.cost}</p>
                              )}
                          </div>
                      );
                  })
                : null}

            {parseInt(numCharacters) > 1 && selectedPackage !== undefined ? (
                <div className={styles.lineItem}>
                    <p>Additional Characters: </p>
                    <p>${selectedPackage ? selectedPackage.additionalCharacterCost * (parseInt(numCharacters) - 1) : 0}</p>
                </div>
            ) : null}

            {travelCost > 0 && selectedPackage !== undefined ? (
                <div className={styles.lineItem}>
                    <p>Travel Fee: </p>
                    <p>${travelCost}</p>
                </div>
            ) : null}

            {isManualAddress ? (
                <p className={styles.disclaimer}>
                    We couldn&apos;t verify this address, so travel fees may apply.
                </p>
            ) : null}

            {lastMinuteFee > 0 ? (
                <div className={styles.lineItem}>
                    <p>Last-Minute Booking (30%): </p>
                    <p>${lastMinuteFee}</p>
                </div>
            ) : null}

            <hr className={styles.equals} />

            <div className={styles.lineItem}>
                <h4>Total: </h4>
                <h4>${total}</h4>
            </div>

            <p className={styles.disclaimer}>
                Please note that estimates may not be exact and are subject to change.
                Our Fairy Godmother will contact you in the next 72 hours to finalize
                your booking and provide an exact quote.
            </p>
        </>
    );

    return (
        <>
            {!isMobile ? (
                <div className={styles.estimate}>
                    <h3 className={styles.header}>Your Estimate</h3>
                    {lineItems}
                </div>
            ) : (
                <>
                    {popupActive ? (
                        <div
                            className={styles.popupActiveBackground}
                            onClick={activatePopup}
                        />
                    ) : null}

                    {!popupActive && isKeyboardOpen ? null : (
                    <div
                        className={popupActive ? styles.active : styles.inactive}
                        style={!popupActive && inactiveBottom !== undefined ? { bottom: inactiveBottom } : undefined}
                    >
                        <div className={styles.mobileHeader} onClick={activatePopup}>
                            <h4>{popupActive ? "Your Estimate" : `Your Estimate: $${total}`}</h4>
                            {popupActive ? <IconChevronDown /> : <IconChevronUp />}
                        </div>
                        {popupActive ? (
                            <div className={styles.estimateMobile} onClick={activatePopup}>
                                {lineItems}
                            </div>
                        ) : null}
                    </div>
                    )}
                </>
            )}
        </>
    );
}
