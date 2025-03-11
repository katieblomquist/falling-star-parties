import { Character, CharacterDress, Services } from "@/app/book/page";
import styles from "./characterCard.module.css";

export default function CharacterCard(props: { content: Character | CharacterDress }) {


    return (
        <>
        <div className={styles.card}>
            <div className={styles.image}>
                <img src={props.content.img}></img>
            </div>
            <div className={styles.header}>
                <h5>{props.content.name}</h5>
            </div>
        </div>
        </>
    )
}