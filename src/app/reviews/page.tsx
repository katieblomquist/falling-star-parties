import NavBar from "@/components/navbar/navbar";
import styles from './reviews.module.css'
import Bubbles from "@/components/bubbles/bubbles";
import Link from 'next/link';
import { formal_script, reviews } from "../mockData";
import ReviewCard from "@/components/reviewCard/reviewCard";
import Swoop from "@/components/swoop/swoop";
import Footer from "@/components/footer/footer";
import Button from "@/components/Button/button";

export default function Reviews() {

    return (
        <>
            <>
                <NavBar location={"reviews"} />
                <div>
                    <div className={styles.header}>

                        <div className={styles.headerRight}>
                            <h1>Our <span className={formal_script.className}>Happily Ever Afters</span></h1>
                            <p className={styles.blurb}>Curious about the spellbinding experiences our enchanted princesses create? Don't just take our word for it—dive into the treasure trove of glowing reviews from delighted clients
                                who've experienced the enchantment firsthand! From heartwarming birthday celebrations to majestic royal balls, their stories paint a picture of the wondrous memories waiting to be made. Join us on this
                                enchanting journey and let the voices of our past clients guide you to your own happily ever after!</p>
                                <Button text={"BOOK NOW"} variant={1} icon={0} enabled={true} href="/book" />
                        </div>
                        <div className={styles.bubbles}>
                            <Bubbles leftSide={false} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
                        </div>
                    </div>
                    <Swoop top={false} color={'#DADDE5'} direction={'right'} />
                </div>
                <div className={styles.mainReview}>
                    <div className={styles.bubbles}>
                        <Bubbles leftSide={true} photos={["/IMG_8921.jpg", "/IMG_8921.jpg", "/IMG_8921.jpg"]} />
                    </div>
                    <div className={styles.headerRight}>
                        <h2>"Falling Star Parties was absolutely <span className={formal_script.className}>amazing</span>!"</h2>
                        <p className={styles.blurb}>They made sure that my daughter Frozen themed birthday party was extraordinary! From the beginning with the communication of setting up the event to the end was excellent with Katelyn. Katelyn
                            made sure everything was organized and in place for the special day! Also, the Ice Queen was reasonably priced with all of the fun games and interactions included! At the event the Ice Queen was phenomenal! The Ice Queen
                            was ready to interact with all of the children especially the birthday girl. All of the children were amazed and was so excited about story time with musical fun, face painting, bubbles, coronation dance lessons, pictures,
                            and singing happy birthday! The attendant was great as well, made sure the party flowed well and kept everything aligned!! All of the children and parents couldn’t stop talking about all the fun they had with the Ice Queen!!
                            My daughters 3rd birthday was a SUCCESS!! Thank you so much Falling Star Parties!!
                            -Tanaisha L.</p>
                    </div>
                </div>
                <div>
                    <h2 className={styles.reviewsHeader}>Read More <span className={formal_script.className}>Glowing</span>Reviews</h2>
                    <div className={styles.reviewCards}>
                        {reviews.map((review) => (
                            <ReviewCard stars={review.stars} review={review.review} clientName={review.client} photo={review.photo} />
                        ))}
                    </div>

                </div>
                <Footer />
            </>
        </>
    )
}