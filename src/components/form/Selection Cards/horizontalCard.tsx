
import { IconClock } from "@tabler/icons-react";
import styles from "./horizontalCard.module.css";
import { Services } from "@/app/mockdata";

export default function HorizontalCard(props: { content: Services }) {


    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h5>{props.content.title}</h5>
                    {props.content.duration !== "" ? (
                        <div className={styles.time}>
                            <IconClock stroke={1} />
                            <p>{props.content.duration}</p>
                        </div>
                    ) : null}

                </div>
                <div className={styles.content}>
                    <p>{props.content.description}</p>
                </div>
            </div>
        </>
    )
}