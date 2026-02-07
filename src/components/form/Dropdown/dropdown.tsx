'use client';

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import styles from "./dropdown.module.css";

export default function Dropdown(props: { options: string[], selected: string, setData: (data: string) => void, invalid?: boolean }) {

    const options = props.options;
    const selected = props.selected;
    const [toggled, setToggle] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    function handleSelected(selected: string) {
        // TODO(ningy says) remove the internal state for selected and rely on passing data down from and up to parent component
        setToggle(false);
        props.setData(selected);

    }

    function handleToggle() {
        if (toggled) {
            setToggle(false);
            document.body.classList.remove('no-scroll');
        } else {
            setToggle(true);
            document.body.classList.add('no-scroll');
        }
    }

    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setToggle(false) } };
    const handleEscapeKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !dropdownRef.current?.contains(event.target as Node)) { setToggle(false) } };

    useEffect(() => { document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, []);
    useEffect(() => { document.addEventListener('keydown', handleEscapeKey) }, []);

    return (
        <>
            <div id="nick-test" className={styles.dropdown} ref={dropdownRef}>
                <div className={`${styles.selected}${props.invalid ? ` ${styles.selectedInvalid}` : ""}`}
                    onClick={handleToggle}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            handleToggle();
                        }
                    }}>
                    <p>{selected}</p>
                    {toggled ? (
                        <IconChevronUp size={20} />
                    ) : (
                        <IconChevronDown size={20} />
                    )}
                </div >
                {toggled && (
                    <div className={styles.backdrop} onClick={handleToggle} />
                )}
                {toggled ? (
                    <div className={styles.options}>
                        {options.map((option, index) => {
                            return (
                                <p key={option}
                                    className={styles.option}
                                    onClick={() => handleSelected(option)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === " " || e.key === "Enter") {
                                            e.preventDefault();
                                            handleSelected(option);
                                        }
                                    }}>{option}</p>
                            )
                        })}
                    </div>
                ) : null}
            </div>
        </>
    )
}