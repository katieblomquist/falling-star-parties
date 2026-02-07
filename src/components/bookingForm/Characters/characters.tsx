import { FormValues } from "@/app/book/page"
import { Control, Controller, FieldErrors, UseFormResetField, useController, useWatch } from "react-hook-form";
import { Character, CharacterSelection, characters, numberCharacters, dresses } from "@/app/mockdata"
import CharacterCard from "@/components/form/Selection Cards/characterCard"
import SelectionCard from "@/components/form/Selection Cards/selectionCard"
import styles from "./characters.module.css"
import Dropdown from "@/components/form/Dropdown/dropdown";
import { useMemo } from "react";

const errorTextStyle = { color: "#b3261e", fontSize: "0.875rem", marginTop: "0.25rem" };

export default function Characters(props: { controller: Control<FormValues, any>, resetField: UseFormResetField<FormValues>, errors: FieldErrors<FormValues> }) {

    const control = props.controller
    const numCharacters = useWatch({ control, name: "NumCharacters" });
    const { field: characterField } = useController({
        control,
        name: "Character",
        rules: {
            validate: (value) => {
                if (!numCharacters || numCharacters === "") {
                    return "Select the number of characters first.";
                }
                const count = parseInt(numCharacters, 10);
                if (!Array.isArray(value) || value.length !== count) {
                    return `Please select ${count} character(s).`;
                }
                return true;
            }
        }
    });
    const selectedCharacterIds = (characterField.value ?? []).map((selected) => selected.characterId);
    const numCharacterOptions = numberCharacters;
    const characterOptions = useMemo(() => characters, []);

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

    function setDress(id: number, characterId: number, value: CharacterSelection[] = []): CharacterSelection[] {
        const updatedValue = [...value];
        const characterIndex = updatedValue.findIndex((item) => item.characterId === characterId);
        
        if (characterIndex !== -1) {
            updatedValue[characterIndex] = { ...updatedValue[characterIndex], dressId: id };
        }
        
        return updatedValue;
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
                            rules={{ required: "Please select the number of characters." }}
                            render={({ field: { onChange, value } }) => (
                                <div>
                                    <Dropdown options={numCharacterOptions} selected={value} setData={onChange} invalid={Boolean(props.errors.NumCharacters)} />
                                </div>
                            )}
                        />
                        {props.errors.NumCharacters?.message ? (
                            <p style={errorTextStyle}>{props.errors.NumCharacters.message}</p>
                        ) : null}

                    </div>
                </div>
            </div>
            {parseInt(numCharacters) ? (
                <div className={styles.characters}>
                    {/* {
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
                                                        id: characters[item.characterId - 1].id,
                                                        name: characters[item.characterId - 1].name,
                                                        img: characters[item.characterId - 1].img

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
                        ) : ( */}
                    <div>
                        <div>
                            <h4 className={styles.subheader}>Characters</h4>
                            <div className={styles.selections}>
                                {characterOptions.map((item) => {
                                    return (
                                        <SelectionCard
                                            key={item.id}
                                            CardContent={CharacterCard}
                                            content={{
                                                id: item.id,
                                                name: item.name,
                                                img: item.img

                                            }}
                                            selected={selectedCharacterIds.includes(item.id)}
                                            makeSelection={(id, selected) => {
                                                characterField.onChange(setCharacters(id, selected, characterField.value ?? []))
                                            }}
                                        />
                                    )
                                })}
                            </div>
                            {props.errors.Character?.message ? (
                                <p style={errorTextStyle}>{props.errors.Character.message}</p>
                            ) : null}

                        </div>
                    </div>

                    <div>
                        {characterField.value?.length === parseInt(numCharacters) && numCharacters !== undefined ? (
                            <>
                                <h3 className={styles.header}>Select Preferred Attire (Optional)</h3>
                                <div className={styles.dressSelection}>
                                    {characterField.value.map((character) => {
                                        const characterData = characterOptions.find(c => c.id === character.characterId);
                                        // Note: mock data uses characterId (0-based) = character.id - 1
                                        const characterCostumes = dresses.filter((item) => item.characterId === character.characterId - 1);
                                        
                                        if (characterCostumes.length === 0) return null;
                                        
                                        return (
                                            <div key={character.characterId}>
                                                <h4 className={styles.subheader}>{characterData?.name}</h4>
                                                <div className={styles.selections}>
                                                    {characterCostumes.map((dress) => (
                                                        <SelectionCard 
                                                            key={dress.id}
                                                            CardContent={CharacterCard} 
                                                            content={{
                                                                id: dress.id,
                                                                name: dress.name,
                                                                img: dress.img
                                                            }} 
                                                            selected={character.dressId === dress.id}
                                                            makeSelection={(id) => {
                                                                characterField.onChange(setDress(id, character.characterId, characterField.value ?? []))
                                                            }} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    )
}