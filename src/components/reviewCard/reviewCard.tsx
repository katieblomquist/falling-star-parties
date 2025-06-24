'use client';

import { useState } from "react";
import { IconCircleFilled, IconCircle, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import styles from "./reviewCard.module.css"
import { reviews } from "@/app/content";
import ContentBlock from "../contentBlock/contentBlock";
export default function ReviewCard() {

    const [selected, setSelected] = useState(0);

    function select(index: number) {
        setSelected(index);
    }

    return (
        <>
            <div className={styles.reviews}>
                <div className={styles.reviewBlock}>
                    <div className={styles.content}>
                        <div className={styles.photo} style={{ backgroundImage: `url('${reviews[selected].photo}')` }} />
                        <div className={styles.blurb}>
                            <h2>{reviews[selected].title}</h2>
                            <p>{reviews[selected].review}</p>
                            <p>- {reviews[selected].client}</p>
                        </div>
                    </div>

                </div>
                <div className={styles.navigation}>
                    {selected === 0 ? (<div className={styles.placeholder}></div>) : (<IconChevronLeft className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected - 1)} />)}
                    <div>
                        {reviews.map((review, index) => (
                            index === selected ? (
                                <IconCircleFilled className={styles.navItem} width="16" height="16" color="#A4A8B0" />
                            ) : (
                                < IconCircle className={styles.navItem} width="16" height="16" color="#A4A8B0" onClick={() => setSelected(index)} />
                            )
                        ))}
                    </div>

                    {selected === reviews.length - 1 ? (<div className={styles.placeholder}></div>) : (<IconChevronRight className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected + 1)} />)}
                </div>
            </div>

        </>
    )
}