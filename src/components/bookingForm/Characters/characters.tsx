import { FormValues } from "@/app/book/page"
import { Control, Controller, UseFormResetField, useWatch } from "react-hook-form";
import { CharacterSelection, characters, dresses, numberCharacters } from "@/app/mockData"
import CharacterCard from "@/components/form/Selection Cards/characterCard"
import SelectionCard from "@/components/form/Selection Cards/selectionCard"
import styles from "./characters.module.css"
import Dropdown from "@/components/form/Dropdown/dropdown";

export default function Characters(props: { controller: Control<FormValues, any>, resetField: UseFormResetField<FormValues> }) {

    const control = props.controller
    const selectedCharacters = useWatch({ control, name: "Character" });
    const numCharacters = useWatch({ control, name: "NumCharacters" });
    const characterOptions = characters;
    const dressOptions = dresses;
    const numCharacterOptions = numberCharacters;

    function setCharacters(id: number, selectedState: boolean, value: CharacterSelection[] = []): CharacterSelection[] {
        if (!selectedState) {
            const dupValue = [...value];
            dupValue.splice(value.map((item) => item.characterId).indexOf(id), 1);
            return dupValue;
        }

        if (value != null && value.length >= parseInt(numCharacters)) {
            return value;
            //TO DO: set up error state informing them they've already selected their max number of characters
        }
        const selected = [...value, { dressId: -1, characterId: id }];
        if (selected.length === parseInt(numCharacters)) {
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
            </div>
            {parseInt(numCharacters) ? (
                <div className={styles.characters}>
                    {
                        selectedCharacters?.length === parseInt(numCharacters) ? (
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
                            selectedCharacters?.length === parseInt(numCharacters) ? (
                                <h3 className={styles.header}>Select Preferred Attire (Optional)</h3>

                            ) : null
                        }

                        <div className={styles.dressSelection}>
                            {
                                selectedCharacters?.length === parseInt(numCharacters) ? (

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
        </>
    )
}