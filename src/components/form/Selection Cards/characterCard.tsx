import { Character, CharacterDress } from "@/app/mockdata";
import styles from "./characterCard.module.css";

export default function CharacterCard(props: { content: Character | CharacterDress }) {


    return (
        <>
        <div className={styles.card}>
            <div className={styles.header}>
                <h5>{props.content.name}</h5>
            </div>
        </div>
        </>
    )
}