'use client'

import { useState, useEffect } from "react";
import { formal_script } from "@/app/mockdata"
import Button from "../Button/button"
import Swoop from "../swoop/swoop"
import styles from "./splash.module.css"
import Image from 'next/image'

export default function Splash(props: { locationLeft: boolean, home: boolean, image: string, gradient: string, headerStart: string, emphasis: string, headerFinish: string, blurb: string, buttonText: string, buttonVarient: number, buttonIcon: number, buttonHref: string, swoopTop: boolean, swoopColor: string, swoopDirection: string, mobileImage: string, mobileGradient?: string, height?: string }) {

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
    }, []);

    if (props.locationLeft && width > 900) {
        return (
            <div className={styles.splashLeft} style={{ backgroundImage: `${props.gradient}, url('${props.image}')` }}>
                <div className={styles.splashText}>
                    <h1 className={styles.textWhite}>{props.headerStart}<span className={formal_script.className}>{props.emphasis}</span>{props.headerFinish}</h1>
                    <p className={styles.textWhite}>{props.blurb}</p>
                    <Button text={props.buttonText} variant={props.buttonVarient} icon={props.buttonIcon} enabled={true} href={props.buttonHref} />
                </div>
                <div className={styles.swoop}>
                    <Swoop top={props.swoopTop} color={props.swoopColor} direction={props.swoopDirection} />
                </div>
            </div>
        )
    } else if (!props.locationLeft && width > 900) {
        return (
            <div className={styles.splashRight} style={{ backgroundImage: `${props.gradient}, url('${props.image}')` }}>
                <div className={styles.splashText}>
                    <h1 className={styles.textWhite}>{props.headerStart}<span className={formal_script.className}>{props.emphasis}</span>{props.headerFinish}</h1>
                    <p className={styles.textWhite}>{props.blurb}</p>
                    <Button text={props.buttonText} variant={props.buttonVarient} icon={props.buttonIcon} enabled={true} href={props.buttonHref} />
                </div>
                <div className={styles.swoop}>
                    <Swoop top={props.swoopTop} color={props.swoopColor} direction={props.swoopDirection} />
                </div>
            </div>
        )
    } else if(!props.locationLeft && width > 900 && props.height){
        return (
            <div className={styles.splashRight} style={{ backgroundImage: `${props.gradient}, url('${props.image}')`, height: "500px" }}>
                <div className={styles.splashText}>
                    <h1 className={styles.textWhite}>{props.headerStart}<span className={formal_script.className}>{props.emphasis}</span>{props.headerFinish}</h1>
                    <p className={styles.textWhite}>{props.blurb}</p>
                    <Button text={props.buttonText} variant={props.buttonVarient} icon={props.buttonIcon} enabled={true} href={props.buttonHref} />
                </div>
                <div className={styles.swoop}>
                    <Swoop top={props.swoopTop} color={props.swoopColor} direction={props.swoopDirection} />
                </div>
            </div>
        )
    } else if (props.home) {
        return (
            <div className={styles.mobileHomeContainer}>
                <div  style={{ width: '100%', height: '60vh', position: 'relative' }}>
                    <Image
                        src={props.mobileImage}
                        alt="Description"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className={styles.mobileTextContainer}>
                    <h1 className={styles.textWhite}>{props.headerStart}<span className={formal_script.className}>{props.emphasis}</span>{props.headerFinish}</h1>
                    <p className={styles.textWhite}>{props.blurb}</p>
                    <Button text={props.buttonText} variant={props.buttonVarient} icon={props.buttonIcon} enabled={true} href={props.buttonHref} />
                </div>
            </div>
        )


    } else if (props.headerStart === ""){
        return (
            <div className={styles.mobileContainer}>
                <div  style={{ width: '100%', height: '50vh', position: 'relative' }}>
                    <Image
                        src={props.mobileImage}
                        alt="Description"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            </div>
        )
    }
     else {
        return (
            <div className={styles.mobileHomeContainer}>
                <div  style={{ width: '100%', height: '60vh', position: 'relative' }}>
                    <Image
                        src={props.mobileImage}
                        alt="Description"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className={styles.mobileTextContainer}>
                    <h1 className={styles.textWhite}>{props.headerStart}<span className={formal_script.className}>{props.emphasis}</span>{props.headerFinish}</h1>
                    <p className={styles.textWhite}>{props.blurb}</p>
                    <Button text={props.buttonText} variant={props.buttonVarient} icon={props.buttonIcon} enabled={true} href={props.buttonHref} />
                </div>
            </div>
        )
    }



}