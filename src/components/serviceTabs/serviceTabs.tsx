import { formal_script } from '@/app/mockdata';
import Button from '../Button/button';
import styles from './serviceTabs.module.css'
import Link from "next/link";

export default function serviceTabs(props: {  beginningBlurb: string, listItems: Array<string>, endBlurb: string }) {

    return (
        <>
        <div className={styles.content}>
            <p>{props.beginningBlurb}</p>
            <ul className={styles.list}>
                {props.listItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <p>{props.endBlurb}</p>
            <Button text={"BOOK NOW"} variant={1} icon={0} enabled={true} href="/book" />
        </div>
            
        </>

    )

}