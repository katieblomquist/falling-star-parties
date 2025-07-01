'use client';

import { formal_script, dresses } from "@/app/mockData";
import { useState } from "react";
import LightBox from "../lightBox/lightBox";
import styles from "./photoCard.module.css"
import { CharacterDress } from "@/app/content";
import CharacterInfo from "../characterInfo/characterInfo";

export default function PhotoCard(props: { name: string, description: string, dresses: Array<CharacterDress>, background: string }) {

    const [lightBoxOpen, setLightBox] = useState(false);

    function lightBox() {
        if (lightBoxOpen) {
            setLightBox(false);
            document.body.classList.remove('no-scroll');
        } else {
            setLightBox(true);
            document.body.classList.add('no-scroll');
        }
    }

    return (
        <>
            {lightBoxOpen ? (
                <LightBox close={lightBox} backgroundImage={props.background}>
                    <CharacterInfo name={props.name} description={props.description} dresses={props.dresses} />
                </LightBox>

            ) : null}
            <div className={styles.character} onClick={lightBox}>
                <div className={styles.photo} style={{ backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 30%, #1D1E1FEE 95%), url('${props.dresses[0].img}')` }}>
                    <h3 className={styles.characterName}> <span className={formal_script.className}>{props.name}</span></h3>
                </div>
            </div>

        </>
    )
}