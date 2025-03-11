import { Character, CharacterDress, Services } from "@/app/book/page";
import { IconCircle, IconCircleFilled } from "@tabler/icons-react";
import styles from "./selectionCard.module.css";
import { ComponentType } from "react";

type CardContentComponent<T> = ComponentType<{ content: T }>

//If Nick could explain, that would be fabulous - Nick could have explained and it WOULD have been fabulous xD

export default function SelectionCard<T extends Services | Character | CharacterDress>(props: { CardContent: CardContentComponent<T>, content: T, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {

    const content = props.content;
    const selected = props.selected;

    function handleClick() {
        if (selected) {
            props.makeSelection(content.id, false);
        } else {
            props.makeSelection(content.id, true);
        }

    }

    return (
        <div className={styles[`card${selected ? "Active" : ""}`]} onClick={handleClick}>
            <div className={styles.selectionName}>
                {selected ? (
                    <IconCircleFilled stroke={1} color="#343B95" />
                ) : (<IconCircle stroke={1} />)}
            </div>
            <props.CardContent content={props.content} />
        </div>
    )
}