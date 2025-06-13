import styles from "./bubbles.module.css"

export default function Bubbles(props: { leftSide: boolean, photos: Array<string> }) {

    function bubblesRight() {
        return (
            <div className={styles.collage}>
                <div
                    className={styles.mainBubbleRight}
                    style={{ backgroundImage: `url('${props.photos[0]}')` }}
                />
                <div
                    className={styles.medBubbleRight}
                    style={{ backgroundImage: `url('${props.photos[1]}')` }}
                />
                <div
                    className={styles.smallBubbleRight}
                    style={{ backgroundImage: `url('${props.photos[2]}')` }}
                />
            </div>
        )
    }

    function bubblesLeft() {
        return (
            <div className={styles.collage}>
                <div
                    className={styles.mainBubbleLeft}
                    style={{ backgroundImage: `url('${props.photos[0]}')` }}
                />
                <div
                    className={styles.medBubbleLeft}
                    style={{ backgroundImage: `url('${props.photos[1]}')` }}
                />
                <div
                    className={styles.smallBubbleLeft}
                    style={{ backgroundImage: `url('${props.photos[2]}')` }}
                />
            </div>
        )
    }

    return (
        <>
            {props.leftSide ? (
                bubblesLeft()
            ) : (
                bubblesRight()
            )}
        </>
    )
}