import Bubbles from "@/components/bubbles/bubbles";
import Tabs from "@/components/tabs/tabs";
import Link from "next/link";
import styles from "./about.module.css";
import Accordian from "@/components/accordian/accordian";
import { TabArray, booking, formal_script, videoCalls } from "../mockData";
import { Petit_Formal_Script } from "next/font/google";
import { use } from "react";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import Button from "@/components/Button/button";

const tabs: TabArray = [
    { label: "BOOKING", content: <Accordian content={booking} /> },
    { label: "VIDEO CALLS", content: <Accordian content={videoCalls} /> }
];

export default function About() {

    return (
        <>
            <NavBar location={"about"} />
            <div>
                <div className={styles.header}>
                    <div className={styles.bubbles}>
                        <Bubbles leftSide={true} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
                    </div>
                    <div className={styles.headerRight}>
                        <h1>Maryland’s Most <span className={formal_script.className}>Magical</span></h1>
                        <p className={styles.blurb}>Welcome to Falling Star Parties, where we're all about bringing a touch of magic to your events! Based in Baltimore, MD,
                            we're dedicated to providing top-notch character entertainment for birthdays, corporate events, charity events, and more.
                            With our stunning costumes and talented cast, we guarantee an experience that's both unforgettable and enchanting. And
                            guess what? Our magic isn't confined to Maryland—we offer Virtual Services across the United States. So whether you're
                            near or far, let Falling Star Parties sprinkle some joy into your next celebration!</p>
                        <Button text={"VIEW SERVICES"} variant={1} icon={0} enabled={true} href="/services" />
                    </div>
                </div>
                <Swoop top={false} color={'#DADDE5'} direction={'left'} />
            </div>
            <div className={styles.katie}>
                <div className={styles.contentLeft}>
                    <h3>Meet the Owner</h3>
                    <p className={styles.blurb}>
                        Introducing Katelyn, the imaginative mind behind Falling Star Parties! Since opening in 2018, she's enchanted guests with her
                        stunning characters and artistry. A seasoned performer, Katelyn's brought joy to audiences across the country. With a heart full
                        of whimsy and a passion for making dreams come true, she's dedicated to crafting unforgettable moments for your little one's
                        special day. Let Katelyn and her team sprinkle some magic into your celebrations, creating memories that shine brighter than the
                        stars!
                    </p>
                </div>
                <Bubbles leftSide={false} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
            </div>
            <div>
                <Swoop top={true} color={'#343B95'} direction={'right'} />
                <div className={styles.faqBlock}>
                    <div className={styles.faqContent}>
                        <h3 className={styles.enchantment}>Enchantment Explained</h3>
                        <p className={styles.enchantmentBlurb}>
                            Planning the perfect princess party can feel like navigating an enchanted kingdom. Magical, but sometimes overwhelming! At Falling
                            Star Parties, we're here to help turn your party dreams into reality. To make your journey as smooth as glass slippers, we've
                            compiled answers to the questions we're asked most frequently.
                        </p>
                        <Tabs content={tabs} blue={false} />
                    </div>

                </div>
            </div>
            <Footer />
        </>
    )
}