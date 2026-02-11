'use client';

import { useEffect, useRef, useState } from "react"
import Calendar from "./calendar";
import { IconCalendarStar } from "@tabler/icons-react";
import { DateTime } from "luxon";
import styles from "./dateSelector.module.css";

export default function DateSelector(props: { date: DateTime, selectDate: (date: DateTime) => void, invalid?: boolean }) {
    const [calendarToggle, toggleCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);

    function handleTouchStart(e: React.TouchEvent) {
        touchStartY.current = e.targetTouches[0].clientY;
    }

    function handleTouchMove(e: React.TouchEvent) {
        touchEndY.current = e.targetTouches[0].clientY;
    }

    function handleTouchEnd() {
        if (touchStartY.current !== null && touchEndY.current !== null) {
            const distance = touchStartY.current - touchEndY.current;
            if (distance > 50 && calendarToggle) { // Adjust threshold for sensitivity
                toggleCalendar(false);
            }
        }
        touchStartY.current = null;
        touchEndY.current = null;
    }

    function handleToggle() {
        toggleCalendar(!calendarToggle);
    }

    function setSelection(date: DateTime) {
        props.selectDate(date);
        handleToggle();
    }

    useEffect(() => {
        function handleToggle() {
            toggleCalendar(!calendarToggle);
        }
        
        if (!toggleCalendar) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                handleToggle();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleCalendar, calendarToggle]);

    const handleClickOutside = (event: MouseEvent) => { if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) { toggleCalendar(false) } };
    const handleEscapeKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !calendarRef.current?.contains(event.target as Node)) { toggleCalendar(false) } };

    useEffect(() => { document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, []);
    useEffect(() => { document.addEventListener('keydown', handleEscapeKey) })

    return (
        <div className={styles.selector} ref={calendarRef}>


            <div className={`${styles[`input${calendarToggle ? "Active" : ""}`]}${props.invalid ? ` ${styles.inputInvalid}` : ""}`} onClick={handleToggle}>
                {props.date === null ? (
                    <p className={styles.nonSelected}>MM/DD/YYYY</p>
                ) : (
                    <p className={styles.selected}>{props.date.month} - {props.date.day} - {props.date.year}</p>
                )}

                <IconCalendarStar stroke={1} color="#A4A8B0" />
            </div>

            {calendarToggle && (
                // 1. Add a fullscreen overlay below the calendar
                <div
                        className={styles.content}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                <div className={styles.backdrop} onClick={handleToggle} />
                </div>
            )}

            <div className={styles.calendar}>
                {calendarToggle ? (
                    
                        <div className={styles.calendarContainer}>
                            <Calendar selected={props.date === null ? DateTime.local().plus({ days: 1 }) : props.date} setSelected={setSelection} />
                        </div>
                    
                ) : null}

            </div>



        </div>

    )
}