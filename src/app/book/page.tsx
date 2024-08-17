import Image from "next/image";
import styles from "./book.module.css"
import { Petit_Formal_Script } from "next/font/google";

export const formal_script = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: '--formal-script', preload: false });

export default function Book() {
    return (
        <div>
                <h1 className={styles.header}><span className={formal_script.className}>Enchant</span> Your Event</h1>
            <div>
                <div className={styles.headerExtender}></div>
                <Image
                src={"/bookHeader.svg"}
                alt="Enchant Your Event"
                width={0}
                height={0}
                sizes="100vw"
                className={styles.headerShape}
                style={{ width: '100%', height: 'auto', fill: '#343B95' }}
            />
            </div>
            

        </div>
    )
}