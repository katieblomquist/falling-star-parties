import { IconArrowRight, IconBrandTelegram, IconSend } from "@tabler/icons-react";
import styles from "./button.module.css";
import Link from 'next/link';

export default function Button(props: { text: string, action?: () => void, variant: number, icon: number, enabled: boolean, href?: string }) {

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
    }


    if (variant === 1 && props.action) {
        return (
            <div className={styles[`primary${props.enabled ? "" : "Disabled"}`]} onClick={buttonAction}>
                <p>{text}</p>
                {icon > 0 ? (
                    <div className={styles.icon}>{addIcon()}</div>
                ) : null}
            </div>
        )
    } else if (variant === 2 && props.action) {
        return (
            <div className={styles.secondary} onClick={buttonAction}>
                <p>{text}</p>
                {icon > 0 ? (
                    <div className={styles.icon}>{addIcon()}</div>
                ) : null}
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