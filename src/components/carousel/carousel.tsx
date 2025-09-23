'use client';

import { useRef, useState } from "react";
import { IconChevronLeft, IconCircleFilled, IconCircle, IconChevronRight } from '@tabler/icons-react'
import styles from "./carousel.module.css"
import { ReactNode } from "react";

export default function Carousel(props: { content: Array<ReactNode> }) {

    const [selected, setSelected] = useState(0);
    const content = props.content;
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    function handleTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.targetTouches[0].clientX;
    }

    function handleTouchMove(e: React.TouchEvent) {
        touchEndX.current = e.targetTouches[0].clientX;
    }

    function handleTouchEnd() {
        if(touchStartX.current !== null && touchEndX.current !== null) {
            const distance = touchStartX.current - touchEndX.current;
            if(Math.abs(distance) > 50) { // Adjust threshold for sensitivity
                if(distance > 0 && selected < content.length - 1) {
                    setSelected(selected + 1); // Swipe left: next
                }
                if(distance < 0 && selected > 0) {
                    setSelected(selected - 1); // Swipe right: previous
                }
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    }

    return (
        <>
            <div
                className={styles.content}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {content[selected]}
            </div>
            
            <div className={styles.navigation}>
                {selected === 0 ? (<div className={styles.placeholder}></div>) : (<IconChevronLeft className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected - 1)} />)}
                <div>
                    {content.map((item, index) => (
                        index === selected ? (
                            <IconCircleFilled key={index} className={styles.navItem} width="16" height="16" color="#A4A8B0" />
                        ) : (
                            < IconCircle key={index} className={styles.navItem} width="16" height="16" color="#A4A8B0" onClick={() => setSelected(index)} />
                        )
                    ))}
                </div>

                {selected === content.length - 1 ? (<div className={styles.placeholder}></div>) : (<IconChevronRight className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected + 1)} />)}
            </div>

        </>
    )
}