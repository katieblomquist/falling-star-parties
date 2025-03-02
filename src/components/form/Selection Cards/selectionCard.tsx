import { SelectionCardContent } from "@/app/book/page";
import { IconCircle, IconCircleFilled, IconClock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import styles from "./selectionCard.module.css";

export default function SelectionCard(props: { type: number, content: SelectionCardContent, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {
    
    const type = props.type;
    const content = props.content;
    const selected = props.selected;

    function handleClick(){
        if(selected){
            props.makeSelection(content.id, false);
        } else {
            props.makeSelection(content.id, true);
        }
        
    }

    function buildCard() {
        if (type === 0) {
            return (
                <div className={styles[`rectangle${selected ? "Active": ""}`]} onClick={handleClick}>
                    <div className={styles.header}>
                        <div className={styles.selectionName}>
                            {selected ? (
                                <IconCircleFilled stroke={1} color="#343B95" />
                            ) : (<IconCircle stroke={1} />)}
                            <h5>{content.title}</h5>
                        </div>

                        <div className={styles.time}>
                            <IconClock stroke={1} />
                            <p>{content.duration}</p>
                        </div>
                    </div>
                    <div className={styles.content}>
                        <p>{content.description}</p>
                    </div>
                </div>
            )
        } else if (type === 1) {
            return (
                <div className={styles[`square${selected ? "Active" : ""}`]} onClick={handleClick}>
                    <div className={styles.selectionName}>
                        {selected ? (
                            <IconCircleFilled stroke={1} color="#343B95" />
                        ) : (<IconCircle stroke={1} />)}
                        <h5>{content.title}</h5>
                    </div>
                    <div>
                        <p className={styles.content}>{content.description}</p>
                    </div>
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