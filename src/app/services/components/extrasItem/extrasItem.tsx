import ExtrasIcon from './extrasIcon/extrasIcon'
import styles from './extrasItem.module.css'
import Image from 'next/image'

export default function ExtrasItem(props: {title: String, price: String, description: String, icon: String}){

    return(
        <div className={styles.extrasWrapper}>
            <div className={styles.headerWrapper}>
                <ExtrasIcon icon={props.icon}></ExtrasIcon>
                <div className={styles.headerText}>
                    <h3>{props.title}</h3>
                    <h4>{props.price}</h4>
                </div>
            </div>
            <div className={styles.bodyWrapper}>
                <p>{props.description}</p>
            </div>
        </div>
    )
}