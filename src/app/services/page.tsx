import NavBar from "@/components/navbar/navbar";
import styles from "./services.module.css"
import ServiceTabs from "@/components/serviceTabs/serviceTabs";
import Tabs from "@/components/tabs/tabs";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { serviceTabs, servicesPage } from "../content";
import { formal_script } from "../mockdata";
import Button from "@/components/Button/button";
import MasonryPhotos from "@/components/masonryPhotos/masonryPhotos";
import Splash from "@/components/splash/splash";

export default function Service() {

    const tabArray = serviceTabs.map(tab => ({
        label: tab.title,
        content: (
            <ServiceTabs
                beginningBlurb={tab.topBlurb}
                listItems={tab.listItems}
                endBlurb={tab.bottomBlurb}
            />
        ),
    }));

    return (
        <>
            <NavBar location={"services"} />
            <Splash locationLeft={true} home={false} image={'/IMG_4261.jpg'} gradient={"linear-gradient(90deg, rgba(52, 59, 149, 0.8), rgba(52, 59, 149, 0.8))"} headerStart={servicesPage[0].titleStart} emphasis={servicesPage[0].emphasis} headerFinish={servicesPage[0].titleEnd}
                blurb={servicesPage[0].blurb}
                buttonText={servicesPage[0].button} buttonVarient={servicesPage[0].variant} buttonIcon={0} buttonHref={servicesPage[0].href} swoopTop={true} swoopColor={"white"} swoopDirection={"right"} mobileImage={'/IMG_4261.jpg'} />
            <div className={styles.servicesBlock}>
                <div className={styles.services}>
                    <h2 className={styles.servicesHeader}>Our Services</h2>
                    <Tabs content={tabArray} blue={true} />
                </div>
                <div className={styles.photosBlock}>
                    <h2 className={styles.photosHeader}>A <span className={formal_script.className}>Glimpse</span> of Past Events</h2>
                    <MasonryPhotos />
                </div>
            </div>
            <Footer />
        </>
    )
}