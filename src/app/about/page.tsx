import Tabs from "@/components/tabs/tabs";
import styles from "./about.module.css";
import Accordian from "@/components/accordian/accordian";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { aboutUs, bookingFaqs, generalFaqs, inPersonFaqs, videoCallsFaqs } from "../content";
import ContentBlock from "@/components/contentBlock/contentBlock";
import Splash from "@/components/splash/splash";

const tabs = [
    { label: "BOOKING", content: <Accordian content={bookingFaqs} /> },
    { label: "VIDEO CALLS", content: <Accordian content={videoCallsFaqs} /> }, 
    { label: "IN PERSON SERVICES", content: <Accordian content={inPersonFaqs} /> },
    { label: "GENERAL QUESTIONS", content: <Accordian content={generalFaqs} /> }
];

export default function About() {

    return (
        <>
            <NavBar location={"about"} />
            <Splash locationLeft={false} home={false} image={"/IMG_4985.jpg"} gradient={"linear-gradient(90deg, rgba(52, 59, 149, 0.7), rgba(52, 59, 149, 0.7))"} headerStart={aboutUs[0].titleStart} emphasis={aboutUs[0].emphasis} headerFinish={aboutUs[0].titleEnd}
                blurb={aboutUs[0].blurb}
                buttonText={aboutUs[0].button ? aboutUs[0].button : ""} buttonVarient={aboutUs[0].variant ? aboutUs[0].variant : 0} buttonIcon={0} buttonHref={aboutUs[0].href ? aboutUs[0].href : ""} swoopTop={true} swoopColor={"white"} swoopDirection={"left"} mobileImage={"/IMG_4985.jpg"} height="60vh" />
            <div className={styles.katieBlock}>
                <ContentBlock titleStart={aboutUs[1].titleStart} emphasis={aboutUs[1].emphasis} titleEnd={aboutUs[1].titleEnd} blurb={aboutUs[1].blurb} white={false} images={aboutUs[1].images} left={false} index={1} />
            </div>

            <div>
                <Swoop top={true} color={'#343B95'} direction={'left'} />
                <div className={styles.faqBlock}>
                    <div className={styles.faqContent}>
                        <h2 className={styles.enchantment}>Enchantment Explained</h2>
                        <p className={styles.enchantmentBlurb}>
                            Planning the perfect princess party can feel like navigating an enchanted kingdom. Magical, but sometimes overwhelming! At Falling
                            Star Parties, we&apos;re here to help turn your party dreams into reality. To make your journey as smooth as glass slippers, we&apos;ve
                            compiled answers to the questions we&apos;re asked most frequently.
                        </p>
                        <Tabs content={tabs} blue={false} />
                    </div>

                </div>
            </div>
            <Footer />
        </>
    )
}