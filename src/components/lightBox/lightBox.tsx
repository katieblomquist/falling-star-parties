'use client';

import { IconX } from "@tabler/icons-react";
import { ReactNode, useRef, useState } from "react";
import styles from "./lightBox.module.css"

export default function LightBox(props: { children: ReactNode, backgroundImage?: string, backgroundColor?: string, close: () => void }) {

    const [isClosing, setIsClosing] = useState(false);

    const sheetRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef<number>(0);
    const touchCurrentY = useRef<number>(0);
    const touchLastY = useRef<number>(0);
    const touchLastTime = useRef<number>(0);
    const isDragging = useRef<boolean>(false);
    const scrollTopAtTouchStart = useRef<number>(0);

    function handleClose() {
        if (sheetRef.current) {
            sheetRef.current.style.animation = '';
        }
        setIsClosing(true);
    }

    function handleAnimationEnd() {
        if (isClosing) {
            props.close();
        }
    }

    function handleTouchStart(e: React.TouchEvent) {
        touchStartY.current = e.touches[0].clientY;
        touchCurrentY.current = e.touches[0].clientY;
        touchLastY.current = e.touches[0].clientY;
        touchLastTime.current = e.timeStamp;
        scrollTopAtTouchStart.current = sheetRef.current?.scrollTop ?? 0;
        isDragging.current = true;
        // Kill the active/held animation so inline transform has uncontested control
        if (sheetRef.current) {
            sheetRef.current.style.animation = 'none';
            sheetRef.current.style.transition = 'none';
        }
    }

    function handleTouchMove(e: React.TouchEvent) {
        if (!isDragging.current) return;
        // If the sheet was scrolled down when the touch started, cancel the
        // dismiss gesture — the user is scrolling content, not dragging to close.
        if (scrollTopAtTouchStart.current > 0) {
            isDragging.current = false;
            if (sheetRef.current) {
                sheetRef.current.style.transition = '';
                sheetRef.current.style.transform = '';
            }
            return;
        }
        touchLastY.current = touchCurrentY.current;
        touchLastTime.current = e.timeStamp;
        touchCurrentY.current = e.touches[0].clientY;
        const delta = touchCurrentY.current - touchStartY.current;
        // Only allow downward drag
        const clampedDelta = Math.max(0, delta);
        if (sheetRef.current) {
            sheetRef.current.style.transform = `translateY(${clampedDelta}px)`;
        }
    }

    function handleTouchEnd(e: React.TouchEvent) {
        if (!isDragging.current) return;
        isDragging.current = false;

        const delta = touchCurrentY.current - touchStartY.current;
        const sheetHeight = sheetRef.current?.offsetHeight ?? 300;

        // Velocity in px/ms over the last move event
        const timeDelta = e.timeStamp - touchLastTime.current;
        const yDelta = touchCurrentY.current - touchLastY.current;
        const velocity = timeDelta > 0 ? yDelta / timeDelta : 0;

        // Close if dragged past 35% of sheet height OR flicked downward (velocity > 0.4 px/ms)
        if (delta > sheetHeight * 0.35 || velocity > 0.4) {
            // The drag itself was the animation — close directly without a separate exit animation
            if (sheetRef.current) {
                sheetRef.current.style.animation = '';
                sheetRef.current.style.transition = '';
                sheetRef.current.style.transform = '';
            }
            props.close();
        } else {
            // Snap back: transition from current drag position back to resting state.
            // Keep style.animation = 'none' so sheetEnter doesn't replay from the bottom.
            if (sheetRef.current) {
                sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
                sheetRef.current.style.transform = 'translateY(0)';
            }
        }
    }

    const sheetClass = [
        styles.lightBox,
        isClosing ? styles.closing : styles.entering,
    ].join(' ');

    const inlineStyle: React.CSSProperties = {};
    if (props.backgroundImage) {
        inlineStyle.backgroundImage = `linear-gradient(90deg, rgb(255, 255, 255, 0.25), rgb(255, 255, 255) 90%), linear-gradient(89deg, rgba(255, 255, 255, 0.65) 0%, transparent 15%, transparent 100%), url(${props.backgroundImage})`;
    } else if (props.backgroundColor) {
        inlineStyle.backgroundColor = props.backgroundColor;
    } else {
        inlineStyle.backgroundColor = 'white';
    }

    return (
        <div className={styles.parent} onClick={handleClose}>
            <div
                ref={sheetRef}
                className={sheetClass}
                style={{ ...inlineStyle, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                onClick={e => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className={styles.handle} />
                <IconX onClick={handleClose} className={styles.icon} />
                {props.children}
            </div>
        </div>
    );
}
