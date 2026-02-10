import SelectionCard from "@/components/form/Selection Cards/selectionCard";
import styles from "./eventOptions.module.css"
import { Control, Controller, FieldErrors, UseFormResetField, useWatch } from "react-hook-form";
import { FormValues } from "@/app/book/page";
import HorizontalCard from "@/components/form/Selection Cards/horizontalCard";
import VerticleCard from "@/components/form/Selection Cards/verticleCard";
import { packages, extras } from "@/app/mockdata";
import { useMemo } from "react";


//Need to create and Add Character cards and Costume Cards

const errorTextStyle = { color: "#b3261e", fontSize: "0.875rem", marginTop: "0.25rem" };

export default function EventOptions(props: { controller: Control<FormValues, any>, resetField: UseFormResetField<FormValues>, errors: FieldErrors<FormValues> }) {

    const control = props.controller
    const selectedEventType = useWatch({ control, name: "EventType" });
    const packageOptions = useMemo(() => {
        if (!selectedEventType) {
            return [];
        }
        return packages.filter(item => item.type === selectedEventType);
    }, [selectedEventType]);

    const extrasOptions = useMemo(() => {
        if (!selectedEventType) {
            return [];
        }
        return extras.filter(item => item.type === selectedEventType);
    }, [selectedEventType]);


    function setExtras(id: number, selectedState: boolean, value: number[] = []): number[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(value.indexOf(id), 1)
            return dupValue;
        }
        if ((value.indexOf(0) !== -1 && id === 1) || (value.indexOf(1) !== -1 && id === 0) || (value.indexOf(4) !== -1 && id === 5) || (value.indexOf(5) !== -1 && id === 4) || (value.indexOf(2) !== -1 && id === 3) || (value.indexOf(3) !== -1 && id === 2)) {
            const dupValue = [...value];
            if (id === 0) {
                dupValue.splice(value.indexOf(1), 1);
            } else if (id === 1) {
                dupValue.splice(value.indexOf(0), 1);
            } else if(id ===2){
                dupValue.splice(value.indexOf(3), 1)
            } else if(id === 3){
                dupValue.splice(value.indexOf(2), 1)
            } else if (id === 4) {
                dupValue.splice(value.indexOf(5), 1);
            } else if (id === 5) {
                dupValue.splice(value.indexOf(4), 1)
            } 

            return [...dupValue, id];
        }

        return [...value, id];
    }


    return (
        <>
            <div>
                <h3 className={styles.header}>Select Your Event Package</h3>
                <div className={styles.packages}>
                    {packageOptions.map((item) => {
                        return (
                            <Controller
                                key={item.id}
                                control={props.controller}
                                name="Package"
                                rules={{ required: "Please select a package." }}
                                render={({ field: { onChange, value } }) => (
                                    <SelectionCard CardContent={HorizontalCard} content={{
                                        id: item.id,
                                        type: item.type,
                                        title: item.title + " - Starting at $" + item.cost,
                                        description: item.description,
                                        duration: item.duration,
                                        cost: item.cost,
                                        additionalCharacterCost: item.additionalCharacterCost
                                    }} selected={value === item.id ? true : false} makeSelection={onChange} />
                                )} />
                        )
                    })}
                </div>
                {props.errors.Package?.message ? (
                    <p style={errorTextStyle}>{props.errors.Package.message}</p>
                ) : null}
            </div>
            <div>
                <h3 className={styles.header}>Select Your Enchanting Extras (Optional)</h3>
                <div className={styles.extras}>
                    {extrasOptions.map((item) => {
                        return (
                            <Controller
                                key={item.id}
                                control={props.controller}
                                name="Extras"
                                render={({ field: { onChange, value } }) => (

                                    <SelectionCard CardContent={HorizontalCard} content={{
                                        id: item.id,
                                        type: item.type,
                                        title:
                                            item.cost === 0
                                                ? item.title + " - No additional charge!"
                                                : item.title + " - $" + item.cost + " per child",
                                        description: item.description,
                                        duration: "",
                                        cost: item.cost,
                                        additionalCharacterCost: 0
                                    }} selected={value?.includes(item.id) ? true : false} makeSelection={(id, selected) => {
                                        onChange(setExtras(id, selected, value))
                                    }} />
                                )}
                            />
                        )
                    })}
                </div>
            </div>


        </>
    )
}