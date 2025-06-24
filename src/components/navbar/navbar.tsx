import Link from 'next/link';
import styles from './navbar.module.css'
import Button from '../Button/button';

export default function NavBar(props: {location: string}) {

    return (
        <>
            <nav className={styles.navbar}>
                <Link href="/"><div className={styles.logo} style={{backgroundImage: "url(/logo.png)"}}></div></Link>
                <Link className={styles[`${props.location === 'about' ? 'linkActive' : 'link'}`] } href="/about">ABOUT US</Link>
                <Link className={styles[`${props.location === 'services' ? 'linkActive' : 'link'}`] } href="/services">SERVICES</Link>
                <Link className={styles[`${props.location === 'characters' ? 'linkActive' : 'link'}`] } href="/characters">CHARACTERS</Link>
                <Button text={"BOOK NOW"} variant={1} icon={0} enabled={true} href="/book" />
            </nav>
        </>
    )
} 