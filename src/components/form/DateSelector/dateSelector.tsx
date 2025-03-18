import { useEffect, useRef, useState } from "react"
import Calendar from "./calendar";
import { IconCalendarStar } from "@tabler/icons-react";
import { DateTime } from "luxon";
import styles from "./dateSelector.module.css";

export default function DateSelector(props: {date: DateTime, selectDate: (date: DateTime) => void}) {
    const [calendarToggle, toggleCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement | null>(null);

    function handleToggle() {
        if (calendarToggle) {
            toggleCalendar(false);
        } else {
            toggleCalendar(true);
        }
    }

    function setSelection(date: DateTime){
        props.selectDate(date);
        handleToggle();
    }

    const handleClickOutside = (event: MouseEvent) => { if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) { toggleCalendar(false) } };
    const handleEscapeKey = (event: KeyboardEvent) => {if(event.key === 'Escape' && !calendarRef.current?.contains(event.target as Node)) {toggleCalendar(false)}};

    useEffect(() => { document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, []);
    useEffect(() => {document.addEventListener('keydown', handleEscapeKey)})



    return (
        <div className={styles.selector} ref={calendarRef}>
            <div className={styles.input} onClick={handleToggle}>
                <p className={styles.selected}>{props.date.month} - {props.date.day} - {props.date.year}</p>
                <IconCalendarStar stroke={1}/>
            </div>
            <div className={styles.calendar}>
                {calendarToggle ? (
                    <Calendar selected={props.date} setSelected={setSelection} />
                ) : null}
            </div>

        </div>

    )
}