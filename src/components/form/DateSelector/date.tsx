import styles from "./date.module.css";

export default function Date(props: { day: number, selected: boolean, setInput: (date: number) => void }) {

    const day = props.day;
    let selected = props.selected;

    function handleClick(){
        props.setInput(day);
    }

    function buildDay(){
        if (selected) {
            return (
                <>
                    <div className={styles.selected} onClick={handleClick}>
                        <p>{day}</p>
                    </div>
                </>
            );
        }

        return(
            <>
            <div className={styles.unselected} onClick={handleClick}>
                <p>{day}</p>
            </div>
        </>
        )
    }

    return (
        buildDay()
    );
}