import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import styles from "./dropdown.module.css";

export default function Dropdown(props: { options: string[], selected: number, setData: (data: number) => void }) {

    const options = props.options;
    const [selected, setSelected] = useState(props.selected);
    const [toggled, setToggle] = useState(false);

    function handleSelected(selected: number) {
        setSelected(selected);
        props.setData(selected);
        setToggle(false);
    }

    function handleToggle(){
        if(toggled){
            setToggle(false);
        } else {
            setToggle(true)
        }
    }

    return (
        <>
        <div className={styles.dropdown}>
            <div className={styles.selected} onClick={handleToggle}>
                <p>{options[selected]}</p>
                <div className={styles.chevron}>
                    {toggled ? (
                        <IconChevronUp />
                    ) : (
                        <IconChevronDown />
                    )}
                </div>
            </div >
                {toggled ? (
                    <div className={styles.options}>
                        {options.map((option, index) => {
                            return(
                                <p className={styles.option} onClick={() => handleSelected(index)}>{option}</p>
                            )
                        })}
                    </div>
                ): null}
        </div>
        </>
    )
}