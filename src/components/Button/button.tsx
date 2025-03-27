import { IconArrowRight, IconBrandTelegram, IconSend } from "@tabler/icons-react";
import styles from "./button.module.css";

export default function Button(props: { text: string, action: () => void, variant: number, icon: number, enabled: boolean }) {

    const variant = props.variant;
    const text = props.text
    const icon = props.icon;

    const buttonAction = () => {
        if(props.enabled){
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

    function buildButton() {
        if (variant === 1) {
            return (
                <div className={styles[`primary${props.enabled ? "" : "Disabled"}`]} onClick={buttonAction}>
                    <p>{text}</p>
                    {icon > 0 ? (
                        <div className={styles.icon}>{addIcon()}</div>
                    ) : null}
                </div>
            )
        }

        if (variant === 2) {
            return (
                <div className={styles.secondary} onClick={buttonAction}>
                    <p>{text}</p>
                    {icon > 0 ? (
                        <div className={styles.icon}>{addIcon()}</div>
                    ) : null}
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