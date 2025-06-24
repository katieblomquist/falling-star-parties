import styles from "./characters.module.css";
import CarouselCard from "../../components/carouselCard/carouselCard";
import { formal_script, iceQueen, mermaidPrincess, rosePrincess, snowPrincess } from "../mockData";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import ContentBlock from "@/components/contentBlock/contentBlock";
import { characterPage } from "../content";

export default function About() {

    return (
        <>
            <NavBar location={"characters"} />
            <div className={styles.splash} style={{ backgroundImage: `linear-gradient(90deg, rgba(52, 59, 149, 0.6), rgba(52, 59, 149, 0.6)), url('/IMG_2565.jpg')` }}>
                <div className={styles.splashText}>
                    
                </div>
                <div className={styles.swoop}>
                    <Swoop top={true} color={'white'} direction={'center'} />
                </div>
            </div>    
            <div className={styles.characterHeader}>
                <h1>Meet Our <span className={formal_script.className}>Enchanted</span> Characters</h1>
            </div>
            <div className={styles.princessBlock}>
                <div className={styles.princesses}>
                    <CarouselCard character="Ice Queen" dresses={iceQueen} />
                    <CarouselCard character="Snow Princess" dresses={snowPrincess} />
                    <CarouselCard character="Mermaid Princess" dresses={mermaidPrincess} />
                    <CarouselCard character="Rose Princess" dresses={rosePrincess} />
                </div>
            </div>

            <Footer />
        </>
    )
}