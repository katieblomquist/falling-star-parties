'use client'

import NavBar from "@/components/navbar/navbar";
import styles from "./services.module.css"
import Footer from "@/components/footer/footer";
import { privateExtras, privateParties, publicEvents, publicExtras, servicesPage } from "../content";
import { formal_script } from "../mockdata";
import MasonryPhotos from "@/components/masonryPhotos/masonryPhotos";
import Splash from "@/components/splash/splash";
import ServicesCard from "./components/servicesCard/servicesCard";
import { useState } from "react";
import Swoop from "@/components/swoop/swoop";
import ExtrasItem from "./components/extrasItem/extrasItem";
import Toggle from "@/components/toggle/toggle";

export default function Service() {

    const [toggle, setToggle] = useState('private');

    function manageToggle(index: number) {
        if (index === 1) {
            setToggle('public');
        } else {
            setToggle('private');
        }
    }

    return (
        <>
            <NavBar location={"services"} />
            <Splash locationLeft={true} home={false} image={'/IMG_4261.jpg'} gradient={"linear-gradient(90deg, rgba(52, 59, 149, 0.8), rgba(52, 59, 149, 0.8))"} headerStart={servicesPage[0].titleStart} emphasis={servicesPage[0].emphasis} headerFinish={servicesPage[0].titleEnd}
                blurb={servicesPage[0].blurb}
                buttonText={servicesPage[0].button} buttonVarient={servicesPage[0].variant} buttonIcon={0} buttonHref={servicesPage[0].href} swoopTop={true} swoopColor={"white"} swoopDirection={"right"} mobileImage={'/IMG_4261.jpg'} />
            <div className={styles.servicesBlock}>
                <div className={styles.toggleSwitch}>
                    <Toggle options={["Private Parties", "Public Events"]} onClick={manageToggle} />
                </div>
                {toggle === 'private' ? (
                    <>
                        <div className={styles.cardWrapper}>
                            {privateParties.map((item) => {
                                return (
                                    <ServicesCard
                                        primary={item.primary}
                                        type={item.type}
                                        title={item.title}
                                        time={item.time}
                                        activities={item.activities}
                                        basePrice={item.basePrice}
                                        addCharacter={item.addCharacter}
                                    />
                                );
                            })}
                        </div>
                        <div className={styles.extrasWrapper}>
                            <Swoop top={true} color={"#343B95"} direction={"left"} />
                            <div className={styles.extrasText}>
                                <h2 className={styles.extrasTitle}><span className={formal_script.className}>Enchanting</span> Extras</h2>
                                <div className={styles.extras}>
                                    {privateExtras.map((item) => {
                                        return (
                                            <ExtrasItem title={item.title} price={item.price} description={item.description} icon={item.icon} />
                                        )
                                    })}
                                </div>
                            </div>

                            <Swoop top={false} color={"#343B95"} direction={"right"} />
                        </div>
                    </>

                ) : (
                    <>
                        <div className={styles.cardWrapper}>
                            {publicEvents.map((item) => {
                                return (
                                    <ServicesCard
                                        primary={item.primary}
                                        type={item.type}
                                        title={item.title}
                                        time={item.time}
                                        activities={item.activities}
                                        basePrice={item.basePrice}
                                        addCharacter={item.addCharacter}
                                    />
                                );
                            })}
                        </div>
                        <div className={styles.extrasWrapper}>
                            <Swoop top={true} color={"#343B95"} direction={"left"} />
                            <h2><span className={formal_script.className}>Enchanting</span> Extras</h2>
                            <div className={styles.extras}>
                                {publicExtras.map((item) => {
                                    return (
                                        <ExtrasItem title={item.title} price={item.price} description={item.description} icon={item.icon} />
                                    )
                                })}
                            </div>
                            <Swoop top={false} color={"#343B95"} direction={"right"} />
                        </div>
                    </>
                )}

                <div className={styles.photosBlock}>
                    <h2 className={styles.photosHeader}>A <span className={formal_script.className}>Glimpse</span> of Past Events</h2>
                    <MasonryPhotos />
                </div>
            </div>
            <Footer />
        </>
    )
}