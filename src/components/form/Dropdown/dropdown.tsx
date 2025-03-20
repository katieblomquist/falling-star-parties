'use client';

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import styles from "./dropdown.module.css";

export default function Dropdown(props: { options: string[], selected: number, setData: (data: number) => void }) {

    const options = props.options;
    const selected = props.selected;
    const [toggled, setToggle] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    function handleSelected(selected: number) {
        // TODO(ningy says) remove the internal state for selected and rely on passing data down from and up to parent component
        setToggle(false);
        props.setData(selected);
        
    }

    function handleToggle() {
        if (toggled) {
            setToggle(false);
        } else {
            setToggle(true)
        }
    }

    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setToggle(false) } };
    const handleEscapeKey = (event: KeyboardEvent) => {if(event.key === 'Escape' && !dropdownRef.current?.contains(event.target as Node)) {setToggle(false)}};

    useEffect(() => { document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, []);
    useEffect(() => {document.addEventListener('keydown', handleEscapeKey)}, []);

    return (
        <>
            <div id="nick-test" className={styles.dropdown} ref={dropdownRef}>
                <div className={styles.selected} onClick={handleToggle}>
                    <p>{options[selected]}</p>
                    <div className={styles.chevron}>
                        {toggled ? (
                            <IconChevronUp />
                        ) : (
                            <IconChevronDown />
                        )}
                    </div>
                </div >
                {toggled ? (
                    <div className={styles.options}>
                        {options.map((option, index) => {
                            return (
                                <p className={styles.option} onClick={() => handleSelected(index)}>{option}</p>
                            )
                        })}
                    </div>
                ) : null}
            </div>
        </>
    )
}