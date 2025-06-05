import Link from 'next/link';
import styles from './navbar.module.css'

export default function NavBsr() {

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <Link href="/">MyApp</Link>
                </div>
                <Link href="/about">ABOUT US</Link>
                <Link href="/services">SERVICES</Link>
                <Link href="/characters">CHARACTERS</Link>
                <Link href="/reviews">REVIEWS</Link>
                <Link href="/book" className={styles.book}>BOOK NOW</Link>
            </nav>
        </>
    )
} 