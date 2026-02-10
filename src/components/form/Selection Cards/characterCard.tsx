import { Character, CharacterDress } from "@/app/mockdata";
import styles from "./characterCard.module.css";

export default function CharacterCard(props: { content: Character | CharacterDress, selected?: boolean }) {
    return (
        <>
        <div className={styles.card}>
            <div className={props.selected ? styles.headerActive : styles.header}>
                <h5>{props.content.name}</h5>
            </div>
        </div>
        </>
    )
}