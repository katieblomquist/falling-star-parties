import { useState } from "react"
import styles from "./toggle.module.css"

export default function Toggle(props: { options: Array<String>, onClick: (index: number) => void }) {

    const [active, setActive] = useState(0);

    function toggle(index: number) {
        setActive(index);
        props.onClick(index);
    }

    return (
        <div className={styles.toggleWrapper}>
            {props.options.map((item, i) => (
                <p  className={styles[`toggle${i === active ? "Active" : ""}`]}
                    key={i}
                    onClick={() => { toggle(i); }}>
                    {item}
                </p>
            ))}
        </div>
    )
}