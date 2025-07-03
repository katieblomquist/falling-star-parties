'use client'

import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import { masonryPhotos } from "@/app/content";
import { useState, useEffect } from "react";
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
            if (index || index === 0) {
                setIndex(index)
                setLightBox(true);
                document.body.classList.add('no-scroll');
            }

        }
    }

    useEffect(() => {
        if (!lightBoxOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                lightBox();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightBoxOpen]);

    return (
        <>
            {lightBoxOpen ? (
                <LightBox close={lightBox} >
                    <Image quality={75} src={masonryPhotos[index]} alt={""} className={styles.lightBoxImage0} />
                </LightBox>

            ) : null}
            <MasonryPhotoAlbum photos={masonryPhotos} onClick={({ index }) => lightBox(index)} />
        </>

    )
}