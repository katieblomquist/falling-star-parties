import styles from "./page.module.css";
import { Open_Sans } from "next/font/google";
import NavBar from "@/components/navbar/navbar";
import { formal_script } from "./mockData";
import Link from 'next/link';
import Bubbles from "@/components/bubbles/bubbles";
import Swoop from "@/components/swoop/swoop";
import ReviewCard from "@/components/reviewCard/reviewCard";
import Footer from "@/components/footer/footer";
import Button from "@/components/Button/button";
import { homePage, reviews } from "./content";
import ContentBlock from "@/components/contentBlock/contentBlock";
import Carousel from "@/components/carousel/carousel";

export const open_Sans = Open_Sans({ weight: "400", subsets: ["latin"], variable: '--open-sans', preload: false })

const reviewArray = reviews.map(review => (
  <ReviewCard title={review.title} review={review.review} client={review.client} />
));

export default function Home() {

  return (
    <>
      <NavBar location={""} />
      <div className={styles.splash} style={{ backgroundImage: `linear-gradient(90deg, #343B95, transparent), url('/IMG_3313.jpg')` }}>
        <div className={styles.splashText}>
          <h1 className={styles.textWhite}><span className={formal_script.className}>Once Upon a Time...</span></h1>
          <p className={styles.textWhite}>Located in the heart of Maryland, Falling Star Parties brings fairy tale magic to life like never before! Our professional performers specialize in creating unforgettable
            experiences for birthdays, corporate events, and special celebrations throughout the state. Book your Princess Experience today and let us make your event truly magical!</p>
          <Button text={"BOOK NOW"} variant={2} icon={0} enabled={true} href="/book" />
        </div>
        <div className={styles.swoop}>
          <Swoop top={true} color={'white'} direction={'right'} />
        </div>
      </div>
      <div className={styles.contentBlock}>
        <ContentBlock titleStart={homePage[0].titleStart} emphasis={homePage[0].emphasis} titleEnd={homePage[0].titleEnd} blurb={homePage[0].blurb} images={homePage[0].images} left={true} white={false} button={homePage[0].button} variant={homePage[0].variant} href={homePage[0].href} index={0}/>
      </div>

      <div>
        <Swoop top={true} color={'#343B95'} direction={'right'} />
        <div className={styles.contentBlock} style={{ backgroundColor: '#343B95' }}>
          <ContentBlock titleStart={homePage[1].titleStart} emphasis={homePage[1].emphasis} titleEnd={homePage[1].titleEnd} blurb={homePage[1].blurb} images={homePage[1].images} left={false} white={true} button={homePage[1].button} variant={homePage[1].variant} href={homePage[1].href} index={1}/>
        </div>
        <Swoop top={false} color={'#343B95'} direction={'left'} />
      </div>

      <div>
        <h2 className={styles.headerCenter}>Clients are <span className={formal_script.className}>Spellbound</span></h2>
        <div className={styles.reviews}>
          <Carousel content={reviewArray} />
        </div>
      </div>
      <Footer />
    </>
  );
}
