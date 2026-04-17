import type { Metadata } from "next";
import styles from "./characters.module.css";
import { formal_script } from "../fonts";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { characters } from "../content";
import PhotoCard from "@/components/photoCard/photoCard";

export const metadata: Metadata = {
  title: "Our Characters",
  description:
    "Meet our enchanted princess characters, available for birthday parties and special events across Maryland. Book your favorite princess for your next celebration!",
  keywords: [
    "Elsa character Maryland",
    "Ariel character Maryland",
    "Belle character Maryland",
    "Cinderella character Maryland",
    "Rapunzel character Maryland",
    "Aurora character Maryland",
    "Snow White character Maryland",
    "princess character appearances",
  ],
  alternates: {
    canonical: "https://fallingstarparties.com/characters",
  },
  openGraph: {
    title: "Our Characters",
    description:
      "Meet our enchanted princess characters, available for birthday parties and special events across Maryland.",
    url: "https://fallingstarparties.com/characters",
    images: [
      {
        url: "/og-characters.jpg",
        width: 1200,
        height: 630,
        alt: "Falling Star Parties princess characters available for events in Maryland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-characters.jpg"],
  },
};

export default function About() {

    return (
        <>
            <NavBar location={"characters"} />
            <div className={styles.splash} style={{ backgroundImage: `url('/IMG_2565.jpg')` }}>
                <div className={styles.swoop}>
                    <Swoop top={true} color={'white'} direction={'center'} />
                </div>
            </div>    
            <div className={styles.characterHeader}>
                <h1>Meet Our <span className={formal_script.className}>Enchanted</span> Characters</h1>
            </div>
            <div className={styles.princessBlock}>
                <div className={styles.princesses}>
                    {
                        characters.map(({name, desc, dresses, background}) => (
                            <PhotoCard key={name} name={name} description={desc} dresses={dresses} background={background}/>
                        ))
                    }
                </div>
            </div>

            <Footer />
        </>
    )
}
