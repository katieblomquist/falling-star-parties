import styles from "./page.module.css";
import { Open_Sans } from "next/font/google";
import NavBar from "@/components/navbar/navbar";
import { formal_script, homeReviews } from "./mockData";
import Link from 'next/link';
import Bubbles from "@/components/bubbles/bubbles";
import Swoop from "@/components/swoop/swoop";
import ReviewCard from "@/components/reviewCard/reviewCard";
import Footer from "@/components/footer/footer";

export const open_Sans = Open_Sans({ weight: "400", subsets: ["latin"], variable: '--open-sans', preload: false })

export default function Home() {

  return (
    <>
      <NavBar location={""} />
      <div className={styles.splash} style={{ backgroundImage: `linear-gradient(90deg, #343B95, transparent), url('/IMG_3313.jpg')` }}>
        <div className={styles.splashText}>
          <h1><span className={formal_script.className}>Once Upon a Time...</span></h1>
          <p>Located in the heart of Maryland, Falling Star Parties brings fairy tale magic to life like never before! Our professional performers specialize in creating unforgettable
            experiences for birthdays, corporate events, and special celebrations throughout the state. Book your Princess Experience today and let us make your event truly magical!</p>
          <Link href="/book" className={styles.buttonWhite}>BOOK NOW</Link>
        </div>
        <div className={styles.swoop}>
          <Swoop top={true} color={'white'} direction={'right'} />
        </div>
      </div>
      <div className={styles.content}>
        <Bubbles leftSide={true} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
        <div className={styles.contentRight}>
          <h1>Bring the <span className={formal_script.className}>Fairy Tale</span> to Life!</h1>
          <p className={styles.blurb}>
            At Falling Star Parties, we're on a mission to sprinkle a little extra magic into every celebration! Whether you're planning a princess-themed birthday bash or a corporate event fit for royalty, we've got you covered.
            Our enchanting array of services include mesmerizing storytelling sessions, toe-tapping sing-alongs, interactive games, and delightful activities that will leave guests of all ages spellbound!
          </p>
          <Link href="/services" className={styles.buttonBlue}>VIEW SERVICES</Link>
        </div>
      </div>
      <div>
        <Swoop top={true} color={'#343B95'} direction={'right'} />
        <div className={styles.content} style={{ backgroundColor: '#343B95' }}>
          <div className={styles.contentLeft} style={{ color: 'white' }}>
            <h1>Make the <span className={formal_script.className}>Dream</span> Come True!</h1>
            <p className={styles.blurb}>
              Falling Star Parties has always been dedicated to providing the most realistic character entertainment possible. From our exquisite one-of-a-kind costuming to our talented cast, we strive to maintain the highest standards in character entertainment.
              Whether we’re with you in real life or on your magic mirror, our characters are sure to feel like they stepped right out of a story book and into your living room!
            </p>
            <Link href="/characters" className={styles.buttonWhite}>VIEW CHARACTERS</Link>
          </div>
          <Bubbles leftSide={false} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
        </div>
        <Swoop top={false} color={'#343B95'} direction={'left'} />
      </div>

      <div>
        <h2 className={styles.headerCenter}>Clients are <span className={formal_script.className}>Spellbound</span></h2>
        <div className={styles.reviews}>
          {homeReviews.map((review) => (
            <ReviewCard review={review.review} clientName={review.client} photo={review.photo} title={review.title} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
