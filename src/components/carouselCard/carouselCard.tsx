'use client';

import { useState } from "react";
import { IconChevronLeft, IconCircleFilled, IconCircle, IconChevronRight } from '@tabler/icons-react'
import styles from "./carouselCard.module.css"
import { formal_script } from "@/app/mockData";
import LightBox from "../lightBox/lightBox";

export type CharacterDress = { id: number, name: String, img: String, characterId: number };
export type CharacterDressArray = Array<CharacterDress>;
export type Character = { id: number, name: String, img: String };

export default function CarouselCard(props: { character: string, dresses: CharacterDressArray }) {

    const [selected, setSelected] = useState(0);
    const dresses = props.dresses;
    const [lightBoxOpen, setLightBox] = useState(false);

    function lightBox(){
        if(lightBoxOpen){
            setLightBox(false);
        } else {
            setLightBox(true);
        }
    }

    return (
        <>
            <div className={styles.character } onClick={lightBox}>
                <h3 className={styles.characterName}> <span className={formal_script.className}>{props.character}</span></h3>
                <div className={styles.card}>
                    <div className={styles.photo} style={{ backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 30%, #FFF 95%), url('${props.dresses[selected].img}')` }}></div>
                    <p className={styles.dressName}>{props.dresses[selected].name}</p>
                    <div className={styles.navigation}>
                        {selected === 0 ? (<div className={styles.placeholder}></div>) : (<IconChevronLeft className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected - 1)} />)}
                        <div>
                            {dresses.map((dress, index) => (
                                index === selected ? (
                                    <IconCircleFilled className={styles.navItem} width="16" height="16" color="#A4A8B0" />
                                ) : (
                                    < IconCircle className={styles.navItem} width="16" height="16" color="#A4A8B0" onClick={() => setSelected(index)} />
                                )
                            ))}
                        </div>

                        {selected === dresses.length - 1 ? (<div className={styles.placeholder}></div>) : (<IconChevronRight className={styles.navItem} width="20" height="20" color="#A4A8B0" onClick={() => setSelected(selected + 1)} />)}
                    </div>
                </div>
            </div>

        </>
    )
}