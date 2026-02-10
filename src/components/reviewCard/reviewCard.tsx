'use client';

import styles from "./reviewCard.module.css"

import { useState } from "react";

export default function ReviewCard(props: {title: string, review: string, client: string, truncate?: boolean}) {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 180;
    const isTruncated = props.truncate && props.review.length > maxLength;
    const displayReview = isTruncated && !expanded ? props.review.slice(0, maxLength) + "..." : props.review;

    return (
        <>
            <div className={styles.reviews}>
                <div className={styles.reviewBlock}>
                    <div className={styles.blurb}>
                        <h3>{props.title}</h3>
                        <p>{displayReview}</p>
                        {isTruncated && (
                            <button className={styles.readMoreBtn} onClick={() => setExpanded(!expanded)}>
                                {expanded ? "Read Less" : "Read More"}
                            </button>
                        )}
                        <p>- {props.client}</p>
                    </div>
                </div>
            </div>
        </>
    )
}