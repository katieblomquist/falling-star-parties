'use client'

import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import { masonryPhotos } from "@/app/content";
import { useState, useEffect } from "react";
import PhotoLightBox from "../photoLightBox/photoLightBox";
import styles from "./masonryPhotos.module.css"

export default function MasonryPhotos() {
    const [index, setIndex] = useState(-1);
    const [lightBoxOpen, setLightBox] = useState(false);


    function openLightBox(index?: number) {
        if (index || index === 0) {
            setIndex(index);
            setLightBox(true);
            document.body.classList.add('no-scroll');
        }
    }

    function closeLightBox() {
        setIndex(-1);
        setLightBox(false);
        document.body.classList.remove('no-scroll');
    }

    function goToNext() {
        if (index < masonryPhotos.length - 1) {
            setIndex(index + 1);
        }
    }

    function goToPrevious() {
        if (index > 0) {
            setIndex(index - 1);
        }
    }

    useEffect(() => {
        if (!lightBoxOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                closeLightBox();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightBoxOpen]);

    // Responsive columns: 1 on mobile, 2 on small tablets, 3 on tablets, 4 on desktop+
    const columns = (containerWidth: number) => {
        if (containerWidth < 600) return 1;
        if (containerWidth < 900) return 2;
        if (containerWidth < 1200) return 3;
        return 4;
    };

    // Consistent spacing between images
    const spacing = 16;

    // Responsive album width for SSR and hydration
    const sizes = {
        size: "1168px",
        sizes: [
            { viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" },
            { viewport: "(max-width: 900px)", size: "calc(100vw - 16px)" },
            { viewport: "(max-width: 600px)", size: "100vw" },
        ],
    };

    return (
        <>
            {lightBoxOpen && index >= 0 ? (
                <PhotoLightBox 
                    close={closeLightBox} 
                    imageUrl={masonryPhotos[index].src}
                    alt={`Gallery photo ${index + 1}`}
                />
            ) : null}
            <MasonryPhotoAlbum
                photos={masonryPhotos}
                columns={columns}
                spacing={spacing}
                sizes={sizes}
                onClick={({ index }) => openLightBox(index)}
            />
        </>
    )
}