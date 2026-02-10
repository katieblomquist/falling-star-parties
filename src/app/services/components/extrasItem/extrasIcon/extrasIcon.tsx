import Image from "next/image"
import styles from "./extrasIcon.module.css"

export default function ExtrasIcon(props: { icon: String }) {

    return (
        <div className={styles.iconWrapper}>
            <div className={styles.icon} style={{backgroundImage: `url(${props.icon})`}}></div>
        </div>
    )
}