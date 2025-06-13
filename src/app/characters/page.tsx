"use client"

import Bubbles from "../components/bubbles/bubbles";
import Link from "next/link";
import styles from "./characters.module.css";
import { Petit_Formal_Script } from "next/font/google";
import { use } from "react";
import CarouselCard from "../components/carouselCard/carouselCard";
import { iceQueen, mermaidPrincess, rosePrincess, snowPrincess } from "../mockdata";


export const formal_script = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: '--formal-script', preload: false });

export default function About() {

    return (
        <>

            <div>
                <div className={styles.header}>
                    <div className={styles.bubbles}>
                        <Bubbles leftSide={true} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
                    </div>
                    <div className={styles.headerRight}>
                        <h1>Meet our <span className={formal_script.className}>Enchanted</span> Characters</h1>
                        <p className={styles.blurb}>Here you'll find a royal court filled with the most enchanting princesses. From the graceful twirls of our Glass Slipper Princess to the adventurous spirit of our Mermaid Princess, 
                        each of our characters brings their own special charm and sparkle to every celebration. Explore their captivating stories, delightful personalities, and the magical moments they bring to life! With a sprinkle 
                        of fairy dust and a touch of whimsy, let us help you create an enchanting experience that your little ones will treasure forever!</p>
                        <Link href="/services" className={styles.buttonBlue}>BOOK NOW</Link>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 108" fill="none">
                    <path d="M0 0.0136719H478H1205.5H1728V66.8004L1700.04 62.5183C1429.71 21.1223 1154.46 23.8174 884.994 70.4989V70.4989C596.63 120.454 301.787 120.013 13.5738 69.1938L0 66.8004V0.0136719Z" fill="#DADDE5" />
                </svg>
            </div>
            <div className={styles.characterHeader}>
                <h2 className={styles.title}>Our Characters</h2>
            </div>
            <div className={styles.princesses}>
                <CarouselCard character="Ice Queen" dresses={iceQueen} />
                <CarouselCard character="Snow Princess" dresses={snowPrincess} />
                <CarouselCard character="Mermaid Princess" dresses={mermaidPrincess} />
                <CarouselCard character="Rose Princess" dresses={rosePrincess} />
            </div>

        </>
    )
}