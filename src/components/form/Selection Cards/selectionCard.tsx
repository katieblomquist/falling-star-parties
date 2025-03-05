import { SelectionCardContent } from "@/app/book/page";
import { IconCircle, IconCircleFilled, IconClock } from "@tabler/icons-react";
import styles from "./selectionCard.module.css";
import HorizontalCard from "./horizontalCard";
import VerticleCard from "./verticleCard";
import { ComponentType, JSXElementConstructor, ReactNode } from "react";

//If Nick could explain, that would be fabulous

export default function SelectionCard(props: { CardContent: ComponentType<{ content: SelectionCardContent }>, content: SelectionCardContent, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {

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
            <props.CardContent content={content} />
        </div>
    )
}