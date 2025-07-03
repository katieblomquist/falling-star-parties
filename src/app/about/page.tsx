import Tabs from "@/components/tabs/tabs";
import styles from "./about.module.css";
import Accordian from "@/components/accordian/accordian";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { aboutUs, bookingFaqs, videoCallsFaqs } from "../content";
import ContentBlock from "@/components/contentBlock/contentBlock";
import Button from "@/components/Button/button";
import { formal_script } from "../mockData";

const tabs = [
    { label: "BOOKING", content: <Accordian content={bookingFaqs} /> },
    { label: "VIDEO CALLS", content: <Accordian content={videoCallsFaqs} /> }
];

export default function About() {

    return (
        <>
            <NavBar location={"about"} />
            <div className={styles.splash} style={{ backgroundImage: `linear-gradient(90deg, rgba(52, 59, 149, 0.7), rgba(52, 59, 149, 0.7)), url('/IMG_4985.jpg')` }}>
                <div className={styles.splashText}>
                    <h1 className={styles.textWhite}>{aboutUs[0].titleStart}<span className={formal_script.className}>{aboutUs[0].emphasis}</span>{aboutUs[0].titleEnd}</h1>
                    <p className={styles.textWhite}>{aboutUs[0].blurb}</p>
                    <Button text={aboutUs[0].button ? aboutUs[0].button : ""} variant={aboutUs[0].variant ? aboutUs[0].variant : 0} icon={0} enabled={true} href={aboutUs[0].href} />
                </div>
                <div className={styles.swoop}>
                    <Swoop top={true} color={'white'} direction={'left'} />
                </div>
            </div>
            <div className={styles.katieBlock}>
                <ContentBlock titleStart={aboutUs[1].titleStart} emphasis={aboutUs[1].emphasis} titleEnd={aboutUs[1].titleEnd} blurb={aboutUs[1].blurb} white={false} images={aboutUs[1].images} left={false} index={1}/>
            </div>

            <div>
                <Swoop top={true} color={'#343B95'} direction={'left'} />
                <div className={styles.faqBlock}>
                    <div className={styles.faqContent}>
                        <h2 className={styles.enchantment}>Enchantment Explained</h2>
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