import Link from "next/link";
import styles from "./characters.module.css";
import { Petit_Formal_Script } from "next/font/google";
import { use } from "react";
import CarouselCard from "../../components/carouselCard/carouselCard";
import { formal_script, iceQueen, mermaidPrincess, rosePrincess, snowPrincess } from  "../mockData";
import NavBar from "@/components/navbar/navbar";
import Bubbles from "@/components/bubbles/bubbles";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import Button from "@/components/Button/button";

export default function About() {

    return (
        <>
            <NavBar location={"characters"} />
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
                        <Button text={"BOOK NOW"} variant={1} icon={0} enabled={true} href="/book" />
                    </div>
                </div>
                <Swoop top={false} color={'#DADDE5'} direction={'left'} />
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
            <Footer />
        </>
    )
}