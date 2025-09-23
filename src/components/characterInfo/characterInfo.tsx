import { CharacterDress } from "@/app/content";
import { useState, useEffect } from "react";
import styles from "./characterInfo.module.css"
import { formal_script } from "@/app/mockdata";

export default function CharacterInfo(props: { name: string, description: string, dresses: Array<CharacterDress> }) {
    const [selectedPhoto, setSelectedPhoto] = useState(0)

    function setSelected(index: number) {
        setSelectedPhoto(index)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.photosBox}>
                <div className={styles.mainPhoto} style={{ backgroundImage: `url("/bubble-2.png"), url(${props.dresses[selectedPhoto].img})` }}></div>
                <div className={styles.dressPhotos}>
                    {props.dresses.map((dress, index) => {
                        let classNames = styles['dress'];

                        if (selectedPhoto === index) {
                            classNames += ` ${styles['dressActive']}`
                        }

                        return <div key={index} className={classNames} style={{ backgroundImage: `url(${dress.img})` }} onClick={() => setSelected(index)}></div>
                    })}
                </div>
            </div>

            <div className={styles.content}>
                <h2><span className={formal_script.className}>{props.name}</span></h2>
                <h3>{props.dresses[selectedPhoto].name}</h3>
                <p className={styles.description}>{props.description}</p>
            </div>
        </div>
    )
}