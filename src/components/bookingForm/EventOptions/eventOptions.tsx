import SelectionCard from "@/components/form/Selection Cards/selectionCard";
import styles from "./eventOptions.module.css"
import { Control, Controller, UseFormResetField, useWatch } from "react-hook-form";
import { FormValues } from "@/app/book/page";
import HorizontalCard from "@/components/form/Selection Cards/horizontalCard";
import VerticleCard from "@/components/form/Selection Cards/verticleCard";
import { packages, extras } from "@/app/mockdata";
import { Packages } from "@/db/entities/packages";
import { useEffect, useState } from "react";
import { AddOns } from "@/db/entities/addOns";


//Need to create and Add Character cards and Costume Cards

export default function EventOptions(props: { controller: Control<FormValues, any>, resetField: UseFormResetField<FormValues> }) {

    const control = props.controller
    const selectedEventType = useWatch({ control, name: "EventType" });
    const [packageOptions, setPackages] = useState<Packages[]>([]);
    const [extrasOptions, setExtrasOptions] = useState<AddOns[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect (() => {
        const fetchPackages = async () => {
            setLoading(true);
            setError(null);
            try{
                const res = await fetch(`api/packages/${selectedEventType}`);
                if (!res.ok) throw new Error("Failed to fetch packages");
                const data: Packages[] = await res.json();
                setPackages(data);
            } catch (err: any){
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        const fetchExtras = async () => {
            setLoading(true);
            setError(null);
            try{
                const res = await fetch(`api/addons/${selectedEventType}`);
                if(!res.ok) throw new Error("Failed to fetch Extras");
                const data: AddOns[] = await res.json();
                setExtrasOptions(data)
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchPackages();
        fetchExtras();
    }, [selectedEventType]) 


    // function getExtras() {
    //     const selectedEventType = useWatch({ control, name: "EventType" });
    //     return (extras.filter(item => item.type === selectedEventType));
    // }


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
                                render={({ field: { onChange, value } }) => (
                                    <SelectionCard CardContent={HorizontalCard} content={{
                                        id: item.id,
                                        type: item.type,
                                        title: item.title + " - Starting at $" + item.cost,
                                        description: item.description,
                                        duration: item.duration,
                                        cost: item.cost,
                                        additionalCharacterCost: item.additionalcharactercost
                                    }} selected={value === item.id ? true : false} makeSelection={onChange} />
                                )} />
                        )
                    })}
                </div>
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
                                        title: item.title + " - $" + item.cost + " per child",
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