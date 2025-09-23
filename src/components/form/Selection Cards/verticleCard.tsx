import { Services } from "@/app/mockdata";
import styles from "./verticleCard.module.css";

export default function VerticleCard(props: { content: Services }) {


    return (
        <>
        <div className={styles.card}>
            <div className={styles.header}>
                <h5>{props.content.title}</h5>
            </div>
            <div className={styles.content}>
                <p>{props.content.description}</p>
            </div>
        </div>
        </>
    )
}