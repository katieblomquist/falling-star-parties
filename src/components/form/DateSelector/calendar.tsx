'use client';

import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import styles from "./calendar.module.css";
import Date from "./date";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

export default function Calendar(props: {selected: DateTime, setSelected: (date: DateTime) => void}) {

    const [currentDate, setCurrentDate] = useState(props.selected);
    const [dates, setDates] = useState([0]);
    const [weekStart, setWeekStart] = useState(0);
    const today = DateTime.local();

    function loadDates() {
        const max = currentDate.daysInMonth;
        if(max == null || max == undefined){
            throw new Error('Could not find the number of days in the month');
        }
        const monthStart = DateTime.local(currentDate.year, currentDate.month, 1);
        const dates = [];
        for (let i = 1; i <= max; i++) {
            dates.push(i);
        }
        setDates([...dates]);
        let start = monthStart.weekday;
        if (start < 7) {
            start++
        } else {
            start = 1;
        }
        setWeekStart(start);
    }

    function handlePrevious() {
        setCurrentDate(currentDate.minus({ months: 1 }));
    }

    function handleNext() {
        setCurrentDate(currentDate.plus({ months: 1 }));
    }

    function handleSelected(day: number) {
        const next = DateTime.local(currentDate.year, currentDate.month, day);
        if(next > today){
            props.setSelected(next);
        }
        
    }

    function clickAway(){
        props.setSelected(props.selected);
    }

    useEffect(() => {
        loadDates();
    }, [currentDate]);

    return (
        <>
            <div className={styles.calendar}>
                <div className={styles.header}>
                    {currentDate.month === today.month ? (
                        <IconArrowNarrowLeft className={styles.arrowCurrentMonth} />
                    ) : (
                        <IconArrowNarrowLeft className={styles.arrow} onClick={handlePrevious} />
                    )}
                    
                    <h2>{currentDate.monthLong} {currentDate.year}</h2>
                    <IconArrowNarrowRight className={styles.arrow} onClick={handleNext} />
                </div>
                <div className={styles.month}>
                    <p>Sun</p>
                    <p>Mon</p>
                    <p>Tues</p>
                    <p>Wed</p>
                    <p>Thurs</p>
                    <p>Fri</p>
                    <p>Sat</p>

                    {dates.map((date, index) => {
                        return (
                            <div style={index === 0 ? { gridColumnStart: weekStart } : undefined}>
                                {currentDate.month === today.month && date <= today.day ? (
                                    <Date day={date} selected={(date == props.selected.day && currentDate.month == props.selected.month)} disabled={true} setInput={handleSelected} />
                                ) : (
                                    <Date day={date} selected={(date == props.selected.day && currentDate.month == props.selected.month)} disabled={false} setInput={handleSelected} />
                                )}
                                
                            </div>

                        )
                    })}
                </div>
            </div>
        </>
    )
}