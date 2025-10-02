import styles from "./characters.module.css";
import { formal_script } from "../mockdata";
import NavBar from "@/components/navbar/navbar";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { characters } from "../content";
import PhotoCard from "@/components/photoCard/photoCard";

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