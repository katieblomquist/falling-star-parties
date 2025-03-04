import { SelectionCardContent } from "@/app/book/page";
import { IconCircle, IconCircleFilled, IconClock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import styles from "./selectionCard.module.css";
import HorizontalCard from "./horizontalCard";
import VerticleCard from "./verticleCard";

export default function SelectionCard(props: { type: number, content: SelectionCardContent, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {

    const type = props.type;
    const content = props.content;
    const selected = props.selected;

    function handleClick() {
        if (selected) {
            props.makeSelection(content.id, false);
        } else {
            props.makeSelection(content.id, true);
        }

    }

    function buildCard() {
        if (type === 0) {
            return (
                <div className={styles[`card${selected ? "Active" : ""}`]} onClick={handleClick}>
                    <div className={styles.selectionName}>
                        {selected ? (
                            <IconCircleFilled stroke={1} color="#343B95" />
                        ) : (<IconCircle stroke={1} />)}
                    </div>
                    <HorizontalCard content={content} />
                </div>
            )
        } else if (type === 1) {
            return (
                <div className={styles[`card${selected ? "Active" : ""}`]} onClick={handleClick}>
                    <div className={styles.selectionName}>
                        {selected ? (
                            <IconCircleFilled stroke={1} color="#343B95" />
                        ) : (<IconCircle stroke={1} />)}
                    </div>
                    <VerticleCard content={content} />
                </div>
            )
        } else {
            return null;
        }
    }

    return (
        buildCard()
    )
}