import { IconArrowRight, IconBrandTelegram } from "@tabler/icons-react";

export default function Button(props: { text: string, action: () => void, variant: number, icon: number }) {

    const variant = props.variant;
    const text = props.text
    const icon = props.icon;

    const buttonAction = () => {
        props.action();
    }

    function addIcon() {
        if(icon === 1){
            return(
                <IconArrowRight />
            )
        } 
        if(icon === 2){
            return(
                <IconBrandTelegram />
            )
        }
        return (
            null
        )
    }

    function buildButton() {
        if (variant === 1) {
            return (
                <div onClick = {buttonAction}>
                    <p>{text}</p>
                    <div>{addIcon()}</div>
                </div>
            )
        } 
        
        if (variant === 2) {
            return (
                <div>
                    <p>{text}</p>
                    <div>{addIcon()}</div>
                </div>
            )
        }

        return (
            null
        )
    }

    return (
        buildButton()
    )
}