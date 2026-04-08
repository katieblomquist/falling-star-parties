import type { Metadata } from "next";
import styles from "./about.module.css";
import Tabs from "@/components/tabs/tabs";
import Accordian from "@/components/accordian/accordian";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { aboutUs, bookingFaqs, generalFaqs, inPersonFaqs, videoCallsFaqs } from "../content";
import ContentBlock from "@/components/contentBlock/contentBlock";
import Splash from "@/components/splash/splash";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Falling Star Parties — Maryland's premier princess character entertainment company. Meet our team and find answers to common questions about booking.",
  alternates: {
    canonical: "https://fallingstarparties.com/about",
  },
  openGraph: {
    title: "About Us",
    description:
      "Learn about Falling Star Parties — Maryland's premier princess character entertainment company. Meet our team and find answers to common questions about booking.",
    url: "https://fallingstarparties.com/about",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    // Booking FAQs
    {
      "@type": "Question",
      name: "How far in advance should I book a princess party?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We recommend booking as early as possible, as our schedule fills up quickly, especially on weekends. Bookings made less than one week in advance are subject to a 33% late fee.",
      },
    },
    {
      "@type": "Question",
      name: "Do you price match?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Our pricing reflects the quality of our performers and costumes and is non-negotiable.",
      },
    },
    {
      "@type": "Question",
      name: "Can you perform at corporate or school events?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We offer public event and charity event packages suitable for corporate functions, school events, festivals, and community gatherings.",
      },
    },
    {
      "@type": "Question",
      name: "How much is the booking deposit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We require a $50 nonrefundable retainer to finalize any booking. This must be paid within 48 hours of receiving your finalization letter. If unpaid, your date will be released to other interested parties.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a late booking fee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Bookings made less than one week in advance are subject to a 33% late fee. Full payment is required upfront for any booking made less than 10 days in advance.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a princess party cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our private birthday party packages start at $200 for the 30-minute Dream Package, $275 for the 60-minute Sparkle Package, and $350 for the 90-minute Shine Package. Additional characters can be added for an extra fee. Public event packages start at $250 for a one-hour appearance.",
      },
    },
    // Video Call FAQs
    {
      "@type": "Question",
      name: "How do virtual princess video calls work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After booking a virtual appearance, you will receive a Google Meet link via a calendar invite. The princess character will join the call at the scheduled time for an interactive virtual experience.",
      },
    },
    // In-Person FAQs
    {
      "@type": "Question",
      name: "How far will you travel for a princess party?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We travel up to 30 miles from the performer's location free of charge. Travel beyond 30 miles incurs a fee of $1 per mile for 30–50 miles, and $2 per mile for each mile beyond 50. All clients are responsible for tolls regardless of distance. We serve clients within approximately 75 driving miles of Middle River, MD.",
      },
    },
    {
      "@type": "Question",
      name: "Can princess characters perform outdoors?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, with limitations. We cannot perform outdoors if the temperature is above 90°F or below 50°F, or during inclement weather. Please have an indoor backup location available.",
      },
    },
    {
      "@type": "Question",
      name: "What do I need to prepare before the princess arrives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Please have seating ready for all children, an open space for activities and games, and a table available for face painting if your package includes it.",
      },
    },
    {
      "@type": "Question",
      name: "How many adults need to be present during the party?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For the safety of all guests, we require at least 1 adult present for every 5 children in attendance.",
      },
    },
    // General FAQs
    {
      "@type": "Question",
      name: "What age range is best for princess character parties?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our experiences are best suited for children aged 2–6, though older children and adults often enjoy the magic as well.",
      },
    },
    {
      "@type": "Question",
      name: "Should I tip the princess performer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tipping is not required but is always appreciated by our performers.",
      },
    },
    {
      "@type": "Question",
      name: "Can I submit photos from our princess party?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We love seeing photos from our events. Please reach out to us through our website to share your magical memories.",
      },
    },
    {
      "@type": "Question",
      name: "Do your princess performers sing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our performers are entertainers, not trained vocalists. They may hum or sing simple tunes softly, but full singing performances are not included in our packages.",
      },
    },
  ],
};

const tabs = [
    { label: "BOOKING", content: <Accordian key="BOOKING" content={bookingFaqs} /> },
    { label: "VIDEO CALLS", content: <Accordian key="VIDEO CALLS" content={videoCallsFaqs} /> }, 
    { label: "IN PERSON SERVICES", content: <Accordian key="IN PERSON SERVICES" content={inPersonFaqs} /> },
    { label: "GENERAL QUESTIONS", content: <Accordian key="GENERAL QUESTIONS" content={generalFaqs} /> }
];

export default function About() {

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <NavBar location={"about"} />
            <Splash locationLeft={false} home={false} image={"/IMG_4985.jpg"} gradient={"linear-gradient(90deg, rgba(52, 59, 149, 0.8), rgba(52, 59, 149, 0.8))"} headerStart={aboutUs[0].titleStart} emphasis={aboutUs[0].emphasis} headerFinish={aboutUs[0].titleEnd}
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
