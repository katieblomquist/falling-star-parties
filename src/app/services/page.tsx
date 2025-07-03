import NavBar from "@/components/navbar/navbar";
import styles from "./services.module.css"
import ServiceTabs from "@/components/serviceTabs/serviceTabs";
import Tabs from "@/components/tabs/tabs";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import { serviceTabs, servicesPage } from "../content";
import { formal_script } from "../mockData";
import Button from "@/components/Button/button";
import MasonryPhotos from "@/components/masonryPhotos/masonryPhotos";

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
            <div className={styles.splash} style={{ backgroundImage: `linear-gradient(90deg, rgba(52, 59, 149, 0.8), rgba(52, 59, 149, 0.8)), url('/IMG_4261.jpg')` }}>
                <div className={styles.splashText}>
                    <h1 className={styles.textWhite}>{servicesPage[0].titleStart}<span className={formal_script.className}>{servicesPage[0].emphasis}</span>{servicesPage[0].titleEnd}</h1>
                    <p className={styles.textWhite}>{servicesPage[0].blurb}</p>
                    <Button text={servicesPage[0].button} variant={servicesPage[0].variant} icon={0} enabled={true} href={servicesPage[0].href} />
                </div>
                <div className={styles.swoop}>
                    <Swoop top={true} color={'white'} direction={'right'} />
                </div>
            </div>
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