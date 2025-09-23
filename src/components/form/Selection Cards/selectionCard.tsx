'use client';

import { IconCircle, IconCircleFilled } from "@tabler/icons-react";
import styles from "./selectionCard.module.css";
import { ComponentType } from "react";
import { Services, Character, CharacterDress } from "@/app/mockdata";

type CardContentComponent<T> = ComponentType<{ content: T }>

//This errors out if you removew services. Why??
function TextCard<T extends Services | Character | CharacterDress>(props: { CardContent: CardContentComponent<T>, content: T, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {
    function handleClick() {
        if (props.selected) {
            props.makeSelection(props.content.id, false);
        } else {
            props.makeSelection(props.content.id, true);
        }

    }
    return (
        <div className={styles[`textCard${props.selected ? "Active" : ""}`]} onClick={handleClick}>
        <div className={styles.selectionName}>
            {props.selected ? (
                <IconCircleFilled stroke={1} color="#343B95" />
            ) : (<IconCircle stroke={1} color="#A4A8B0" />)}
        </div>
        <props.CardContent content={props.content} />
    </div>
    )

}

//This errors out if you removew services. Why??
function CharacterCard<T extends Services | Character | CharacterDress>(props: { CardContent: CardContentComponent<T>, content: T, selected: boolean, makeSelection: (id: number, selected: boolean) => void }){
    function isCharacterOrDress(content: Services | Character | CharacterDress): content is Character | CharacterDress {
        return true
    }
    const cardBackground = isCharacterOrDress(props.content)
        ? {
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 50%, #FFF 100%), url(${props.content.img})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        }
        : {};
    function handleClick() {
        if (props.selected) {
            props.makeSelection(props.content.id, false);
        } else {
            props.makeSelection(props.content.id, true);
        }

    }

    return (
        <div className={styles[`characterCard${props.selected ? "Active" : ""}`]} style={cardBackground} onClick={handleClick}>
            <div className={styles.selectionName}>
                {props.selected ? (
                    <IconCircleFilled stroke={1} color="#343B95" />
                ) : (<IconCircle stroke={1} color="#A4A8B0" />)}
            </div>
            <props.CardContent content={props.content} />
        </div>
    )

}

export default function SelectionCard<T extends Services | Character | CharacterDress>(props: { CardContent: CardContentComponent<T>, content: T, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {

    function isCharacterOrDress(content: Services | Character | CharacterDress): content is Character | CharacterDress {
        return 'name' in content;
    }

    if(isCharacterOrDress(props.content)){
        return(
            <CharacterCard CardContent={props.CardContent} content={props.content} selected={props.selected} makeSelection={props.makeSelection} />
        )
    } else {
        return(
            <TextCard CardContent={props.CardContent} content={props.content} selected={props.selected} makeSelection={props.makeSelection} />
        )
    }

    // const content = props.content;
    // const selected = props.selected;


    // const cardBackground = isCharacterOrDress(content)
    //     ? {
    //         backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 50%, #FFF 100%), url(${content.img})`,
    //         backgroundSize: 'cover',
    //         backgroundRepeat: 'no-repeat'
    //     }
    //     : {};
    // function handleClick() {
    //     if (selected) {
    //         props.makeSelection(content.id, false);
    //     } else {
    //         props.makeSelection(content.id, true);
    //     }

    // }

    // return (
    //     <div className={styles[`card${selected ? "Active" : ""}`]} style={cardBackground} onClick={handleClick}>
    //         <div className={styles.selectionName}>
    //             {selected ? (
    //                 <IconCircleFilled stroke={1} color="#343B95" />
    //             ) : (<IconCircle stroke={1} color="#A4A8B0" />)}
    //         </div>
    //         <props.CardContent content={props.content} />
    //     </div>
    // )
}