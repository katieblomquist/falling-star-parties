'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import styles from './navbar.module.css'
import Button from '../Button/button';
import { IconMenu2, IconX } from '@tabler/icons-react'

export default function NavBar(props: { location: string }) {

    const [dropdownOpen, setOpen] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);

    function setDropdown() {
        setOpen(!dropdownOpen);
    }

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
    }, []);

    if (width > 900) {
        return (
            <nav className={styles.navbar}>
                <Link href="/"><div className={styles.logo} style={{ backgroundImage: "url(/logo.png)" }}></div></Link>
                <Link className={styles[`${props.location === 'about' ? 'linkActive' : 'link'}`]} href="/about">ABOUT US</Link>
                <Link className={styles[`${props.location === 'services' ? 'linkActive' : 'link'}`]} href="/services">SERVICES</Link>
                <Link className={styles[`${props.location === 'characters' ? 'linkActive' : 'link'}`]} href="/characters">CHARACTERS</Link>
                <Button text={"BOOK NOW"} variant={1} icon={0} enabled={true} href="/book" />
            </nav>
        )
    } else {
        return (
            <nav className={styles.mobileNavbar} onClick={e => e.stopPropagation()}>
                <div className={styles.mobileNavbarHeader}>
                    <Link href="/" className={styles.logoBoxMobile}><div className={styles.logoMobile} style={{ backgroundImage: "url(/logo.png)" }}></div></Link>
                    {dropdownOpen ? (
                        <IconX className={styles.mobileIcon} onClick={setDropdown} />
                    ) : (
                        <IconMenu2 className={styles.mobileIcon} onClick={setDropdown} />
                    )}
                </div>
                {dropdownOpen ? (
                    <div className={styles.mobileDropdown} >
                        <Link className={styles[`${props.location === 'about' ? 'linkActiveMobile' : 'linkMobile'}`]} href="/about">ABOUT US</Link>
                        <Link className={styles[`${props.location === 'services' ? 'linkActiveMobile' : 'linkMobile'}`]} href="/services">SERVICES</Link>
                        <Link className={styles[`${props.location === 'characters' ? 'linkActiveMobile' : 'linkMobile'}`]} href="/characters">CHARACTERS</Link>
                        <Link className={styles[`${props.location === 'book' ? 'linkActiveMobile' : 'linkMobile'}`]} href="/book">BOOK NOW</Link>
                    </div>
                ) : null}

            </nav>
        )
    }
} 