import { formal_script } from "@/app/mockData"
import Button from "../Button/button"
import Bubbles from "../bubbles/bubbles"
import styles from "./contentBlock.module.css"

function Left(props: { titleStart: string, emphasis: string, titleEnd: string, blurb: string, images: Array<string>, button?: string, variant?: number, href?: string, white: boolean, index: number }) {
    if (props.button && props.variant && props.href && props.white) {
        return (
            <div className={styles.content} style={{ color: 'white' }}>
                <Bubbles leftSide={true} photos={props.images} />
                <div className={styles.contentRight}>
                    {props.index === 0 ? (<h1 style={{ color: 'white' }}>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h1>) : (<h2 style={{ color: 'white' }}>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h2>)}
                    <p className={styles.blurb} style={{ color: 'white' }}>{props.blurb}</p>
                    <Button text={props.button} variant={props.variant} icon={0} enabled={true} href={props.href} />
                </div>
            </div>
        )
    } else if (props.button && props.variant && props.href) {
        return (
            <div className={styles.content}>
                <Bubbles leftSide={true} photos={props.images} />
                <div className={styles.contentRight}>
                    {props.index === 0 ? (<h1>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h1>) : (<h2>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h2>)}
                    <p className={styles.blurb}>{props.blurb}</p>
                    <Button text={props.button} variant={props.variant} icon={0} enabled={true} href={props.href} />
                </div>
            </div>
        )
    } else {
        return (
            <div className={styles.content}>
                <Bubbles leftSide={true} photos={props.images} />
                <div className={styles.contentRight}>
                    {props.index === 0 ? (<h1>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h1>) : (<h2>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h2>)}
                    <p className={styles.blurb}>{props.blurb}</p>
                </div>
            </div>
        )
    }
}

function Right(props: { titleStart: string, emphasis: string, titleEnd: string, blurb: string, images: Array<string>, button?: string, variant?: number, href?: string, white: boolean, index: number }) {
    if (props.button && props.variant && props.href && props.white) {
        return (
            <div className={styles.content} style={{ color: 'white' }}>
                <div className={styles.contentLeft}>
                    {props.index === 0 ? (<h1 style={{ color: 'white' }}>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h1>) : (<h2 style={{ color: 'white' }}>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h2>)}
                    <p className={styles.blurb} style={{ color: 'white' }}>{props.blurb}</p>
                    <Button text={props.button} variant={props.variant} icon={0} enabled={true} href={props.href} />
                </div>
                <Bubbles leftSide={false} photos={props.images} />
            </div>
        )
    } else if (props.button && props.variant && props.href) {
        return (
            <div className={styles.content}>
                <div className={styles.contentLeft}>
                    {props.index === 0 ? (<h1>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h1>) : (<h2>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h2>)}
                    <p className={styles.blurb}>{props.blurb}</p>
                    <Button text={props.button} variant={props.variant} icon={0} enabled={true} href={props.href} />
                </div>
                <Bubbles leftSide={false} photos={props.images} />
            </div>
        )
    } else {
        return (
            <div className={styles.content}>
                <div className={styles.contentLeft}>
                    {props.index === 0 ? (<h1>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h1>) : (<h2>{props.titleStart} <span className={formal_script.className}>{props.emphasis}</span>{props.titleEnd}</h2>)}
                    <p className={styles.blurb}>{props.blurb}</p>
                </div>
                <Bubbles leftSide={false} photos={props.images} />
            </div>
        )
    }
}

export default function ContentBlock(props: { titleStart: string, emphasis: string, titleEnd: string, blurb: string, white: boolean, images: Array<string>, left: boolean, button?: string, variant?: number, href?: string, index: number }) {

    if (props.left) {
        if (props.button && props.variant && props.href) {
            return (
                <Left titleStart={props.titleStart} emphasis={props.emphasis} titleEnd={props.titleEnd} blurb={props.blurb} images={props.images} button={props.button} variant={props.variant} href={props.href} white={props.white} index={props.index} />
            )
        } else {
            return (
                <Left titleStart={props.titleStart} emphasis={props.emphasis} titleEnd={props.titleEnd} blurb={props.blurb} images={props.images} white={props.white} index={props.index} />
            )
        }


    } else {
        if (props.button && props.variant && props.href) {
            return (
                <Right titleStart={props.titleStart} emphasis={props.emphasis} titleEnd={props.titleEnd} blurb={props.blurb} images={props.images} button={props.button} variant={props.variant} href={props.href} white={props.white} index={props.index} />
            )
        } else {
            return (
                <Right titleStart={props.titleStart} emphasis={props.emphasis} titleEnd={props.titleEnd} blurb={props.blurb} images={props.images} white={props.white} index={props.index} />
            )
        }

    }
}