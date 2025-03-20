import { Character, CharacterDress, Services } from "@/app/book/page";
import { IconCircle, IconCircleFilled } from "@tabler/icons-react";
import styles from "./selectionCard.module.css";
import { ComponentType } from "react";
import { type } from "os";

type CardContentComponent<T> = ComponentType<{ content: T }>

//If Nick could explain, that would be fabulous - Nick could have explained and it WOULD have been fabulous xD

export default function SelectionCard<T extends Services | Character | CharacterDress>(props: { CardContent: CardContentComponent<T>, content: T, selected: boolean, makeSelection: (id: number, selected: boolean) => void }) {

    function isCharacterOrDress(content: Services | Character | CharacterDress): content is Character | CharacterDress {
        return 'name' in content && 'img' in content;
      }

    const content = props.content;
    const selected = props.selected;

    
    const cardBackground = isCharacterOrDress(content) 
    ? { 
        backgroundImage: `linear-gradient(0, rgba(255, 255, 255, 0.00) 25%, #FFF 100%), url(${content.img})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      } 
    : {};
    function handleClick() {
        if (selected) {
            props.makeSelection(content.id, false);
        } else {
            props.makeSelection(content.id, true);
        }

    }

    return (
        <div className={styles[`card${selected ? "Active" : ""}`]} style={cardBackground} onClick={handleClick}>
            <div className={styles.selectionName}>
                {selected ? (
                    <IconCircleFilled stroke={1} color="#343B95" />
                ) : (<IconCircle stroke={1} />)}
            </div>
            <props.CardContent content={props.content} />
        </div>
    )
}