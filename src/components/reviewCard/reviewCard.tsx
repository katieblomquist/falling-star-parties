'use client';

import styles from "./reviewCard.module.css"

export default function ReviewCard(props: {title: string, review: string, client: string}) {

    return (
        <>
            <div className={styles.reviews}>
                <div className={styles.reviewBlock}>
                    <div className={styles.blurb}>
                        <h3>{props.title}</h3>
                        <p>{props.review}</p>
                        <p>- {props.client}</p>
                    </div>
                </div>
            </div>

        </>
    )
}