 import Button from "@/components/Button/button"
import styles from "./servicesCard.module.css"
import { formal_script } from "@/app/mockdata"

 export default function ServicesCard(props: {primary: boolean, type: String, title: String, time: String, activities: Array<String>, basePrice: Number, addCharacter: Number}){


    function AddButton(){
        if(props.primary){
            return (
                <Button text={"BOOK NOW"} variant={2} icon={0} enabled={true} href="/book"></Button>
            )
        }
        
        return (
            <Button text={"BOOK NOW"} variant={1} icon={0} enabled={true} href="/book"></Button>
        )
    }

    return(
        <div className={styles[`cardWrapper${props.primary ? "Primary" : ""}`]}>
            <div className={styles.headerWrapper}>
                <h2 className={styles[`title${props.primary ? "Primary" : ""}`]}><span className={formal_script.className}>{props.title}</span></h2>
                <h3 className={styles[`time${props.primary ? "Primary" : ""}`]}>{props.time}</h3>
                <p className={styles[`invite${props.primary ? "Primary" : ""}`]}>Invite your child's favorite princess for: </p>
            </div>
            <div className={styles.bodyWrapper}>
                {props.activities.map((item) => {
                    return(
                        <p className={styles[`listItem${props.primary ? "Primary" : ""}`]}>{item}</p>
                    )
                })}
            </div>
            <div className={styles.footerWrapper}>
                <h3>Starting at ${props.basePrice.toString()}</h3>
                <h3>Add more characters for ${props.addCharacter.toString()} each! </h3>
                {props.type === "public" ? (
                    <p>*Non Profit Rates Available</p>
                ): null}
                {AddButton()}
            </div>
        </div>
    )
 }