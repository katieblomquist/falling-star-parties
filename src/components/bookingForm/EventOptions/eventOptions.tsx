import SelectionCard from "@/components/form/Selection Cards/selectionCard";
import { Duration } from "luxon";
import { useState } from "react";
import styles from "./eventOptions.module.css"
import { Control, Controller } from "react-hook-form";
import { FormValues } from "@/app/book/page";
import HorizontalCard from "@/components/form/Selection Cards/horizontalCard";
import VerticleCard from "@/components/form/Selection Cards/verticleCard";

export const birthdayPackages = [{ id: 0, title: "Dream", description: "Our Characters will sing, tell stories, teach princess lessons, hold a royal coronation, and pose for portraits!", duration: "30 Minutes", cost: 150 },
{ id: 1, title: "Sparkle", description: "Our Characters will do everything included in the Dream Package plus play party games such as Simon Says, Hide and Go Seek, and Duck Duck Goose!", duration: "60 Minutes", cost: 220 },
{ id: 2, title: "Shine", description: "Our Characters will do everything included in the Sparkle Package plus face paint with your guests!", duration: "90 Minutes", cost: 300 }
];

export const birthdayExtras = [{ id: 0, title: "Storybook Keepsake", description: "Includes a storybook signed by your character that she will present at the end of story time!", duration: "NA", cost: 15 },
{ id: 1, title: "Deluxe Storybook Keepsake", description: "Includes a storybook, with over 10 princess stories, signed by your character that she will present at the end of story time!", duration: "NA", cost: 30 },
{ id: 2, title: "Deluxe Princess Set", description: "Includes an upgraded rhinestone crown and a themed princess sash.", duration: "NA", cost: 30 },
{ id: 3, title: "Gift Bags", description: "Includes a gift bag for each child. We offer both princess themed and superhero themed bags so that every child is included!", duration: "NA", cost: 10 }
];

//Need to create and Add Character cards and Costume Cards

export default function EventOptions(props: { controller: Control<FormValues, any> }) {

    function makeNewArray( id: number, selectedState: boolean, value: number[] = []) : number[] {
        if(!selectedState){
            const dupValue = [... value];
            dupValue.splice(value.indexOf(id), 1)
            return dupValue;
        }
        
        return [... value, id];
    }

    return (
        <>
            <div>
                <h4 className={styles.header}>Select Your Event Package</h4>
                <div className={styles.packages}>
                    {birthdayPackages.map((item) => {
                        return (
                            <Controller
                                control={props.controller}
                                name="Package"
                                render={({ field: { onChange, value } }) => (
                                    <SelectionCard CardContent={HorizontalCard} content={{
                                        id: item.id,
                                        title: item.title,
                                        description: item.description,
                                        duration: item.duration,
                                        cost: item.cost
                                    }} selected={value === item.id ? true : false} makeSelection={onChange} />
                                )} />


                        )
                    })}
                </div>


            </div>

            <div>
                <h4 className={styles.header}>Select Your Enchanting Extras (Optional)</h4>
                <div className={styles.extras}>
                    {birthdayExtras.map((item) => {
                        return (
                            <Controller
                                control={props.controller}
                                name="Extras"
                                render={({ field: { onChange, value } }) => (

                                    <SelectionCard CardContent={VerticleCard} content={{
                                        id: item.id,
                                        title: item.title,
                                        description: item.description,
                                        duration: item.duration,
                                        cost: item.cost
                                    }} selected={value?.includes(item.id)} makeSelection={(id, selected) => {
                                        onChange(makeNewArray( id, selected, value))
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