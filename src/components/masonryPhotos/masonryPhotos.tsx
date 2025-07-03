'use client'

import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import { masonryPhotos } from "@/app/content";
import { useState } from "react";
import CharacterInfo from "../characterInfo/characterInfo";
import LightBox from "../lightBox/lightBox";
import Image from 'next/image'
import styles from "./masonryPhotos.module.css"

export default function MasonryPhotos() {
    const [index, setIndex] = useState(-1);
    const [lightBoxOpen, setLightBox] = useState(false);

    function lightBox(index?: number) {
        if (lightBoxOpen) {
            setIndex(-1)
            setLightBox(false);
            document.body.classList.remove('no-scroll');
        } else {
            if (index) {
                setIndex(index)
                setLightBox(true);
                document.body.classList.add('no-scroll');
            }

        }
    }

    return (
        <>
            {lightBoxOpen ? (
                <LightBox close={lightBox} >
                    <Image src={masonryPhotos[index]} alt={""} className={styles.lightBoxImage} />
                </LightBox>

            ) : null}
            <MasonryPhotoAlbum photos={masonryPhotos} onClick={({ index }) => lightBox(index)} />
        </>

    )
}