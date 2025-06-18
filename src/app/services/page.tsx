import NavBar from "@/components/navbar/navbar";
import Link from 'next/link';
import styles from "./services.module.css"
import Bubbles from "@/components/bubbles/bubbles";
import { formal_script, serviceTabs } from "../mockData";
import ServiceTabs from "@/components/serviceTabs/serviceTabs";
import Tabs from "@/components/tabs/tabs";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import { masonryPhotos } from "../mockData";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import Button from "@/components/Button/button";

export default function Service() {

    const tabArray = serviceTabs.map(tab => ({
        label: tab.title,
        content: (
            <ServiceTabs
                beginningBlurb={tab.topBlurb}
                listItems={tab.listItems}
                endBlurb={tab.bottomBlurb}
            />
        ),
    }));

    return (
        <>
            <NavBar location={"services"} />
            <div>
                <div className={styles.header}>

                    <div className={styles.headerRight}>
                        <h1>Something <span className={formal_script.className}>Special</span> for any Occasion</h1>
                        <p className={styles.blurb}>Our enchanting services offer a royal touch to any occasion! Our professionally trained performers bring beloved characters to life with mesmerizing storytelling, interactive
                            games, enchanting sing-alongs, and dazzling photo opportunities. From princess lessons to fanciful facepainting, we ensure an unforgettable experience for every little prince and princess.</p>
                            <Button text={"VIEW SERVICES"} variant={1} icon={0} enabled={true} href="/services" />
                    </div>
                    <div className={styles.bubbles}>
                        <Bubbles leftSide={false} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
                    </div>
                </div>
                <Swoop top={false} color={'#DADDE5'} direction={'right'} />
            </div>
            <div className={styles.servicesBlock}>
                <div className={styles.services}>
                    <h2 className={styles.servicesHeader}>Our Services</h2>
                    <Tabs content={tabArray} blue={true} />
                </div>
                <div className={styles.photosBlock}>
                    <h2 className={styles.photosHeader}>A <span className={formal_script.className}>Glimpse</span> of Past Events</h2>
                    <MasonryPhotoAlbum photos={masonryPhotos} />
                </div>
            </div>
            <Footer />
        </>
    )
}