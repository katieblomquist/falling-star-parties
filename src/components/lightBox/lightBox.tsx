import { IconX } from "@tabler/icons-react";
import { ReactNode } from "react";
import styles from "./lightBox.module.css"

export default function LightBox(props: { children: ReactNode, backgroundImage?: string, backgroundColor?: string, close: () => void }) {

    if (props.backgroundImage) {
        return (
            <div className={styles.parent} onClick={props.close}>
                <div className={styles.lightBox} onClick={e => e.stopPropagation()} style={{
                    backgroundImage: `linear-gradient(90deg, rgb(255, 255, 255, 0.25), rgb(255, 255, 255) 90%), linear-gradient(89deg, rgba(255, 255, 255, 0.65) 0%, transparent 15%, transparent 100%), url(${props.backgroundImage})`}}>
                <IconX onClick={props.close} className={styles.icon} />
                {props.children}
            </div>
            </div >

        )
    } else if (props.backgroundColor) {
        return (
            <div className={styles.parent} onClick={props.close}>
                <div className={styles.lightBox} onClick={e => e.stopPropagation()} style={{ backgroundColor: `${props.backgroundColor}` }}>
                    <IconX onClick={props.close} className={styles.icon} />
                    {props.children}
                </div>
            </div>

        )
    } else {
        return (
            <div className={styles.parent} onClick={props.close}>
                <div className={styles.lightBox} onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white' }}>
                    <IconX onClick={props.close} className={styles.icon} />
                    {props.children}
                </div>
            </div>

        )
    }
}