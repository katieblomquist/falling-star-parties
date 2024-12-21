import { IconArrowRight, IconBrandTelegram, IconSend } from "@tabler/icons-react";
import styles from "./button.module.css";

export default function Button(props: { text: string, action: () => void, variant: number, icon: number }) {

    const variant = props.variant;
    const text = props.text
    const icon = props.icon;

    const buttonAction = () => {
        props.action();
    }

    function addIcon() {
        if(icon === 1){
            return(
                <IconArrowRight />
            )
        } 
        if(icon === 2){
            return(
                <IconSend />
            )
        }
        return (
            null
        )
    }

    function buildButton() {
        if (variant === 1) {
            return (
                <div className={styles.primary} onClick = {buttonAction}>
                    <p>{text}</p>
                    <div className={styles.icon}>{addIcon()}</div>
                </div>
            )
        } 
        
        if (variant === 2) {
            return (
                <div className={styles.secondary} onClick={buttonAction}>
                    <p>{text}</p>
                    <div className={styles.icon}>{addIcon()}</div>
                </div>
            )
        }

        return (
            null
        )
    }

    return (
        buildButton()
    )
}