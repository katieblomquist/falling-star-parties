"use client"

import Bubbles from "@/components/bubbles/bubbles";
import Tabs from "@/components/tabs/tabs";
import Link from "next/link";
import styles from "./about.module.css";
import Accordian from "@/components/accordian/accordian";
import { booking, tabs } from "@/mocdata";
import { Petit_Formal_Script } from "next/font/google";
import { use } from "react";

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
                        <h1>Maryland’s Most <span className={formal_script.className}>Magical</span></h1>
                        <p className={styles.blurb}>Welcome to Falling Star Parties, where we're all about bringing a touch of magic to your events! Based in Baltimore, MD,
                            we're dedicated to providing top-notch character entertainment for birthdays, corporate events, charity events, and more.
                            With our stunning costumes and talented cast, we guarantee an experience that's both unforgettable and enchanting. And
                            guess what? Our magic isn't confined to Maryland—we offer Virtual Services across the United States. So whether you're
                            near or far, let Falling Star Parties sprinkle some joy into your next celebration!</p>
                        <Link href="/services" className={styles.buttonBlue}>VIEW SERVICES</Link>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 108" fill="none">
                    <path d="M0 0.0136719H478H1205.5H1728V66.8004L1700.04 62.5183C1429.71 21.1223 1154.46 23.8174 884.994 70.4989V70.4989C596.63 120.454 301.787 120.013 13.5738 69.1938L0 66.8004V0.0136719Z" fill="#DADDE5" />
                </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1728 144" fill="none" display="block">
                    <path d="M1728 145.124H1264H514H0.00012207V54.9424L26.9543 60.5158C296.51 116.253 574.968 112.648 842.99 49.952C1129.61 -17.0951 1427.91 -16.5062 1714.26 51.6721L1728 54.9424V145.124Z" fill="#343B95" />
                </svg>
                {/* <div style={{ height: '100px', backgroundColor: 'red' }} /> */}
                <div className={styles.faqBlock}>
                    <div className={styles.faqContent}>
                        <h3 className={styles.enchantment}>Enchantment Explained</h3>
                    <p className={styles.enchantmentBlurb}>
                        Planning the perfect princess party can feel like navigating an enchanted kingdom. Magical, but sometimes overwhelming! At Falling
                        Star Parties, we're here to help turn your party dreams into reality. To make your journey as smooth as glass slippers, we've
                        compiled answers to the questions we're asked most frequently.
                    </p>
                    <Tabs content={tabs}/>
                    </div>
                    
                </div>
            </div>

        </>
    )
}