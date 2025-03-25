import SelectionCard from "@/components/form/Selection Cards/selectionCard";
import styles from "./eventOptions.module.css"
import { Control, Controller, UseFormResetField, useWatch } from "react-hook-form";
import { CharacterSelection, FormValues } from "@/app/book/page";
import HorizontalCard from "@/components/form/Selection Cards/horizontalCard";
import VerticleCard from "@/components/form/Selection Cards/verticleCard";
import CharacterCard from "@/components/form/Selection Cards/characterCard";
import Dropdown from "@/components/form/Dropdown/dropdown";
import { packages, extras, characters, dresses, numberCharacters, event } from "@/app/mockData";


//Need to create and Add Character cards and Costume Cards

export default function EventOptions(props: { controller: Control<FormValues, any>, resetField: UseFormResetField<FormValues> }) {

    const control = props.controller
    const selectedCharacters = useWatch({ control, name: "Character" });
    // const eventType = useWatch({control, name: "EventType"});
    const numCharacters = useWatch({ control, name: "NumCharacters" });

    const packageOptions = getPackages();
    const extrasOptions = getExtras();
    const characterOptions = characters;
    const dressOptions = dresses;
    const numCharacterOptions = numberCharacters;

    function getPackages() {

        const selectedEventType = useWatch({ control, name: "EventType" });

        return (packages.filter(item => item.type === event[selectedEventType]));
    }

    function getExtras() {
        const selectedEventType = useWatch({ control, name: "EventType" });
        return (extras.filter(item => item.type === event[selectedEventType]));
    }


    function setExtras(id: number, selectedState: boolean, value: number[] = []): number[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(value.indexOf(id), 1)
            return dupValue;
        }
        if ((value.indexOf(0) !== -1 && id === 1) || (value.indexOf(1) !== -1 && id === 0) || (value.indexOf(4) !== -1 && id === 5) || (value.indexOf(5) !== -1 && id === 4)) {
            const dupValue = [...value];
            if (id === 0) {
                dupValue.splice(value.indexOf(1), 1);
            } else if (id === 1) {
                dupValue.splice(value.indexOf(0), 1);
            } else if (id === 4) {
                dupValue.splice(value.indexOf(5), 1);
            } else if (id === 5) {
                dupValue.splice(value.indexOf(4), 1)
            }

            return [...dupValue, id];
        }

        return [...value, id];
    }

    function setCharacters(id: number, selectedState: boolean, value: CharacterSelection[] = []): CharacterSelection[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(value.map((item) => item.characterId).indexOf(id), 1);
            return dupValue;
        }

        if (value != null && value.length >= numCharacters + 1) {
            return value;
            //TO DO: set up error state informing them they've already selected their max number of characters
        }
        const selected = [...value, { dressId: -1, characterId: id }];
        if (selected.length === numCharacters + 1) {
        }

        return selected
    }

    function handleChangeCharacters() {
        props.resetField('Character')
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
                <h3 className={styles.header}>Select Your Event Package</h3>
                <div className={styles.packages}>
                    {packageOptions.map((item) => {
                        return (
                            <Controller
                                control={props.controller}
                                name="Package"
                                render={({ field: { onChange, value } }) => (
                                    <SelectionCard CardContent={HorizontalCard} content={{
                                        id: item.id,
                                        type: item.type,
                                        title: item.title,
                                        description: item.description,
                                        duration: item.duration,
                                        cost: item.cost,
                                        additionalCharacterCost: item.additionalCharacterCost
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
                                control={props.controller}
                                name="Extras"
                                render={({ field: { onChange, value } }) => (

                                    <SelectionCard CardContent={VerticleCard} content={{
                                        id: item.id,
                                        type: item.type,
                                        title: item.title,
                                        description: item.description,
                                        duration: item.duration,
                                        cost: item.cost,
                                        additionalCharacterCost: item.additionalCharacterCost
                                    }} selected={value?.includes(item.id) ? true : false} makeSelection={(id, selected) => {
                                        onChange(setExtras(id, selected, value))
                                    }} />
                                )}
                            />
                        )
                    })}
                </div>
            </div>
            <div>
                <h3 className={styles.header}>Select Your Preferred Character</h3>
                <div>
                    <h4 className={styles.subheader}>Number of Characters</h4>
                    <div className={styles.numCharacters}>
                        <Controller
                            control={props.controller}
                            name="NumCharacters"
                            render={({ field: { onChange, value } }) => (
                                <div>
                                    <Dropdown options={numCharacterOptions} selected={value} setData={onChange} />
                                </div>
                            )}
                        />

                    </div>
                </div>

                {numCharacters > -1 ? (
                    <div className={styles.characters}>
                        {
                            selectedCharacters?.length === numCharacters + 1 ? (
                                <div>
                                    <h4 className={styles.subheader}>Characters</h4>
                                    <div className={styles.selections}>
                                        {selectedCharacters.map((item) => {
                                            return (
                                                <Controller
                                                    control={props.controller}
                                                    name="Character"
                                                    render={({ field: { onChange, value } }) => (

                                                        <SelectionCard CardContent={CharacterCard} content={{
                                                            id: characters[item.characterId].id,
                                                            name: characters[item.characterId].name,
                                                            img: characters[item.characterId].img

                                                        }} selected={value?.map((selected) => selected.characterId).includes(item.characterId)} makeSelection={(id, selected) => {
                                                            onChange(setCharacters(id, selected, value))
                                                        }} />
                                                    )}
                                                />
                                            )
                                        })}
                                    </div>
                                    <Controller
                                        control={props.controller}
                                        name="Character"
                                        render={({ field: { onChange, value } }) => (
                                            <h4 className={styles.changeSelection} onClick={handleChangeCharacters} >Change Selection</h4>
                                        )}
                                    />

                                </div>
                            ) : (
                                <div>
                                    <div>
                                        <h4 className={styles.subheader}>Characters</h4>
                                        <div className={styles.selections}>
                                            {characterOptions.map((item) => {
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
                                </div>
                            )
                        }



                        <div>
                            {
                                selectedCharacters?.length === numCharacters + 1 ? (
                                    <h3 className={styles.header}>Select Preferred Attire</h3>

                                ) : null
                            }

                            <div className={styles.dressSelection}>
                                {
                                    selectedCharacters?.length === numCharacters + 1 ? (

                                        selectedCharacters.map((character) => {
                                            return (
                                                <div>
                                                    <h4 className={styles.subheader}>{characterOptions[character.characterId].name}</h4>
                                                    <div className={styles.selections}>
                                                        {dressOptions.filter((item) => item.characterId === character.characterId).map((dress) => {
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

                                                                        }} selected={value?.map((selected) => selected.dressId).includes(dress.id)} makeSelection={(id, selected) => {
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
                ) : null}


            </div>

            {

            }

        </>
    )
}