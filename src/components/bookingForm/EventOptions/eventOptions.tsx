import SelectionCard from "@/components/form/Selection Cards/selectionCard";
import { Duration } from "luxon";
import { useState } from "react";
import styles from "./eventOptions.module.css"
import { Control, Controller, useWatch } from "react-hook-form";
import { CharacterSelection, FormValues } from "@/app/book/page";
import HorizontalCard from "@/components/form/Selection Cards/horizontalCard";
import VerticleCard from "@/components/form/Selection Cards/verticleCard";
import CharacterCard from "@/components/form/Selection Cards/characterCard";
import Dropdown from "@/components/form/Dropdown/dropdown";

export const birthdayPackages = [{ id: 0, title: "Dream", description: "Our Characters will sing, tell stories, teach princess lessons, hold a royal coronation, and pose for portraits!", duration: "30 Minutes", cost: 150 },
{ id: 1, title: "Sparkle", description: "Our Characters will do everything included in the Dream Package plus play party games such as Simon Says, Hide and Go Seek, and Duck Duck Goose!", duration: "60 Minutes", cost: 220 },
{ id: 2, title: "Shine", description: "Our Characters will do everything included in the Sparkle Package plus face paint with your guests!", duration: "90 Minutes", cost: 300 }
];

export const birthdayExtras = [{ id: 0, title: "Storybook Keepsake", description: "Includes a storybook signed by your character that she will present at the end of story time!", duration: "NA", cost: 15 },
{ id: 1, title: "Deluxe Storybook Keepsake", description: "Includes a storybook, with over 10 princess stories, signed by your character that she will present at the end of story time!", duration: "NA", cost: 30 },
{ id: 2, title: "Deluxe Princess Set", description: "Includes an upgraded rhinestone crown and a themed princess sash.", duration: "NA", cost: 30 },
{ id: 3, title: "Gift Bags", description: "Includes a gift bag for each child. We offer both princess themed and superhero themed bags so that every child is included!", duration: "NA", cost: 10 }
];

export const characters = [{ id: 0, name: "Ice Queen", img: "./IMG_4976}" },
{ id: 1, name: "Snow Princess", img: "./IMG_4976" },
{ id: 2, name: "Mermaid Princess", img: "./IMG_4976" },
{ id: 3, name: "Rose Princess", img: "./IMG_4976" },
{ id: 4, name: "Glass Slipper Princess", img: "./IMG_4976" },
{ id: 5, name: "Sleeping Princess", img: "./IMG_4976" },
{ id: 6, name: "Tower Princess", img: "./IMG_4976" },
];

export const dresses = [{ id: 0, name: "Ice Dress", img: "./IMG_4976", characterId: 0 }, { id: 1, name: "Elements Dress", img: "./IMG_4976", characterId: 0 }, 
{ id: 2, name: "Adventure Dress", img: "./IMG_4976", characterId: 0 }, { id: 3, name: "Yuletide Dress", img: "./IMG_4976", characterId: 0 }, 
{ id: 4, name: "Coronation Dress", img: "./IMG_4976", characterId: 1 }, { id: 5, name: "Queen Dress", img: "./IMG_4976", characterId: 1 }, 
{ id: 6, name: "Adventure Dress", img: "./IMG_4976", characterId: 1 }, { id: 7, name: "Yuletide Dress", img: "./IMG_4976", characterId: 1 }, 
{ id: 8, name: "Walking Tail", img: "./IMG_4976", characterId: 2 }, { id: 9, name: "Ballgown", img: "./IMG_4976", characterId: 2 }, 
{ id: 10, name: "Ballgown", img: "./IMG_4976", characterId: 3 }, { id: 11, name: "Holiday Dress", img: "./IMG_4976", characterId: 3 }, 
{ id: 12, name: "Ballgown", img: "./IMG_4976", characterId: 4 }, { id: 13, name: "Ballgown", img: "./IMG_4976", characterId: 5 },
{ id: 14, name: "Adventure Dress", img: "./IMG_4976", characterId: 6 }]

export const numCharacters = ["1", "2", "3", "4", "5", "6"];

//Need to create and Add Character cards and Costume Cards

export default function EventOptions(props: { controller: Control<FormValues, any> }) {

    const control = props.controller

    const [characterMax, setMax] = useState(0);
    const selectedCharacters = useWatch({ control, name: "Character" });

    function setExtras(id: number, selectedState: boolean, value: number[] = []): number[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(value.indexOf(id), 1)
            return dupValue;
        }

        return [...value, id];
    }

    function setCharacters(id: number, selectedState: boolean, value: CharacterSelection[] = []): CharacterSelection[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(value.map((item) => item.characterId).indexOf(id), 1);
            return dupValue;
        }

        if (value != null && value.length >= characterMax + 1) {
            return value;
            //TO DO: set up error state informing them they've already selected their max number of characters
        }

        return [...value, {dressId: -1, characterId: id}];
    }


    function setDress(id: number, selectedState: boolean, characterId: number, value: CharacterSelection[] = []): CharacterSelection[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(dupValue.indexOf({ dressId: id, characterId: characterId }), 1);
            return dupValue;
        }

        if (value.map((item) => item.characterId).includes(characterId)) {
            const location = value.map((item) => item.characterId).indexOf(characterId);
           value[location].dressId = id;
        }
        
        //need to find a way to keep it from reordering. 
        value[value.map((item) => item.characterId).indexOf(characterId)].dressId = id;
        return value;

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
                                        onChange(setExtras(id, selected, value))
                                    }} />
                                )}
                            />
                        )
                    })}
                </div>
            </div>


            <div>
                <h4 className={styles.header}>Select Your Preferred Character</h4>
                <div className={styles.characters}>
                    <div className={styles.numCharacters}>
                        <h5>Number of Characters</h5>
                        <Dropdown options={numCharacters} selected={characterMax} setData={setMax} />
                    </div>
                    <div>
                        <h5>Characters</h5>
                        <div className={styles.selections}>
                            {characters.map((item) => {
                                return (
                                    <Controller
                                        control={props.controller}
                                        name="Character"
                                        render={({ field: { onChange, value } }) => (

                                            <SelectionCard CardContent={CharacterCard} content={{
                                                id: item.id,
                                                name: item.name,
                                                img: item.img

                                            }} selected={value?.map((selected) => selected.characterId).includes(item.id)} makeSelection={(id, selected) => {
                                                onChange(setCharacters(id, selected, value))
                                            }} />
                                        )}
                                    />
                                )
                            })}
                        </div>

                    </div>

                    <div>
                        {
                            selectedCharacters?.length > 0 ? (
                                <h5>Attire</h5>
                            ) : null
                        }

                        <div className={styles.dressSelection}>
                            {
                                selectedCharacters?.length > 0 ? (

                                    selectedCharacters.map((character) => {
                                        return (
                                            <div>
                                                <h5>{characters[character.characterId].name}</h5>
                                                <div className={styles.selections}>
                                                    {dresses.filter((item) => item.characterId === character.characterId).map((dress) => {
                                                    return (
                                                        <Controller
                                                            control={props.controller}
                                                            name="Character"
                                                            render={({ field: { onChange, value } }) => (

                                                                <SelectionCard CardContent={CharacterCard} content={{
                                                                    id: dress.id,
                                                                    name: dress.name,
                                                                    img: dress.img,
                                                                    characterId: dress.characterId

                                                                }} selected={value?.map((selected) => selected.dressId).includes(dress.id) } makeSelection={(id, selected) => {
                                                                    onChange(setDress(id, selected, dress.characterId, value))
                                                                }} />
                                                            )}
                                                        />
                                                    )

                                                })}
                                                </div>
                                                
                                            </div>
                                        )
                                    })
                                ) : null
                            }


                        </div>

                    </div>

                </div>
            </div>

            {

            }

        </>
    )
}