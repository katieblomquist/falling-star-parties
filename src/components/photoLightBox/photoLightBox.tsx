'use client';

import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState, useRef } from "react";
import styles from "./photoLightBox.module.css";

export default function PhotoLightBox(props: { 
    imageUrl: string, 
    alt: string, 
    close: () => void,
    currentIndex?: number,
    totalImages?: number,
    onNext?: () => void,
    onPrevious?: () => void
}) {
    const { currentIndex, totalImages, onNext, onPrevious } = props;
    const showNavigation = currentIndex !== undefined && totalImages !== undefined && totalImages > 1;
    const showCounter = currentIndex !== undefined && totalImages !== undefined;
    
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const [swiping, setSwiping] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
        setSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        setSwiping(false);
        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0 && onNext && currentIndex !== undefined && totalImages !== undefined) {
                // Swiped left - next image
                if (currentIndex < totalImages - 1) {
                    onNext();
                }
            } else if (swipeDistance < 0 && onPrevious && currentIndex !== undefined) {
                // Swiped right - previous image
                if (currentIndex > 0) {
                    onPrevious();
                }
            }
        }
    };

    return (
        <div className={styles.backdrop} onClick={props.close}>
            <div 
                className={styles.container} 
                onClick={e => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <button 
                    onClick={props.close} 
                    className={styles.closeButton}
                    aria-label="Close lightbox"
                >
                    <IconX size={28} />
                </button>
                
                {showCounter && (
                    <div className={styles.counter}>
                        {currentIndex + 1} / {totalImages}
                    </div>
                )}

                {showNavigation && (
                    <>
                        <button 
                            onClick={onPrevious}
                            className={`${styles.navButton} ${styles.prevButton}`}
                            aria-label="Previous image"
                            disabled={currentIndex === 0}
                        >
                            <IconChevronLeft size={32} />
                        </button>
                        <button 
                            onClick={onNext}
                            className={`${styles.navButton} ${styles.nextButton}`}
                            aria-label="Next image"
                            disabled={currentIndex === totalImages - 1}
                        >
                            <IconChevronRight size={32} />
                        </button>
                    </>
                )}

                <div className={styles.imageWrapper}>
                    <img 
                        src={props.imageUrl} 
                        alt={props.alt}
                        className={styles.image}
                    />
                </div>
            </div>
        </div>
    );
}
