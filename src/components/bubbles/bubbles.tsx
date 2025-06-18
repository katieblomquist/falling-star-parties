import styles from "./bubbles.module.css"

function BubblesRight(props: { photos: string[] }) {
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

function BubblesLeft(props: { photos: string[] }) {
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

export default function Bubbles(props: { leftSide: boolean, photos: Array<string> }) {



    return (
        <>
            {props.leftSide ? (
                <BubblesLeft photos={props.photos} />
            ) : (
                <BubblesRight photos={props.photos} />
            )}
        </>
    )
}