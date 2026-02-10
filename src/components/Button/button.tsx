import { IconArrowRight, IconBrandTelegram, IconSend, IconArrowLeft } from "@tabler/icons-react";
import styles from "./button.module.css";
import Link from 'next/link';

export default function Button(props: { text: string, action?: () => void, variant: number, icon: number, enabled: boolean, href?: string, fullWidth?: boolean }) {

    const variant = props.variant;
    const text = props.text
    const icon = props.icon;

    const buttonAction = () => {
        if (props.enabled && props.action !== undefined) {
            props.action();
        }

    }

    function addIcon() {
        if (icon === 1) {
            return (
                <IconArrowRight />
            )
        }
        if (icon === 2) {
            return (
                <IconSend />
            )
        }
        if(icon === 3){
            return(
                <IconArrowLeft />
            )
        }
    }


    const fullWidthClass = props.fullWidth ? styles.fullWidth : '';
    if (variant === 1 && props.action) {
        return (
            <div className={fullWidthClass ? `${styles[`primary${props.enabled ? "" : "Disabled"}`]} ${fullWidthClass}` : styles[`primary${props.enabled ? "" : "Disabled"}`]} onClick={buttonAction}>
                <p className={styles[`primaryText${props.enabled ? "" : "Disabled"}`]}>{text}</p>
                {icon > 0 ? (
                    <div className={styles.icon}>{addIcon()}</div>
                ) : null}
            </div>
        )
    } else if (variant === 2 && props.action) {
        return (
            <div className={fullWidthClass ? `${styles.secondary} ${fullWidthClass}` : styles.secondary} onClick={buttonAction}>
                <p className={styles.secondaryText}>{text}</p>
                {icon > 0 ? (
                    <div className={styles.icon}>{addIcon()}</div>
                ) : null}
            </div>
        )
    } else if(variant === 3 && props.action) {
        return(
            <div className={styles.terciary} onClick={buttonAction}>
                {icon > 0 ? (
                    <div className={styles.iconLeft}>{addIcon()}</div>
                ) : null}
                <p className={styles.terciaryText}>{text}</p>
            </div>
        )
    } else if (variant === 1 && props.href) {
        return (
            <Link href={props.href} className={styles.linkPrimary}>{text}</Link>
        )
    } else if (variant === 2 && props.href) {
        return (
            <Link href={props.href} className={styles.linkSecondary}>{text}</Link>
        )
    } else {
        return (
            null
        )
    }
}