import { SelectionCardContent } from "@/app/book/page";
import { IconClock } from "@tabler/icons-react";
import styles from "./horizontalCard.module.css";

export default function HorizontalCard(props: { content: SelectionCardContent }) {


    return (
        <>
        <div className={styles.card}>
            <div className={styles.header}>
                <h5>{props.content.title}</h5>
                <div className={styles.time}>
                    <IconClock stroke={1} />
                    <p>{props.content.duration}</p>
                </div>
            </div>
            <div className={styles.content}>
                <p>{props.content.description}</p>
            </div>
        </div>
        </>
    )
}