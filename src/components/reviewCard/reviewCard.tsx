import { IconStarFilled } from '@tabler/icons-react'
import styles from "./reviewCard.module.css"
export default function ReviewCard(props: { stars?: number, review: string, clientName: string, photo: string, title?:string }) {
    
    return (
        <>
            <div className={styles.card}>
                <div>
                    <div className={styles.photo} style={{ backgroundImage: `linear-gradient(180deg, rgba(52, 59, 149, 0.00) 35.46%, #333A94 100%), url('${props.photo}')` }}></div>
                </div>
                <div className={styles.review}>
                    {props.stars? (
                        <div className={styles.stars}>
                        {Array.from({ length: props.stars }).map((_, i) => (
                            <IconStarFilled />
                        ))}
                    </div>
                    ): (
                        <h3>{props.title}</h3>
                    )}
                    <p>{props.review}</p>
                    <p>- {props.clientName}</p>
                </div>
            </div>
        </>
    )
}