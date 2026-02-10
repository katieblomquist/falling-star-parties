import React, { useMemo } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { FormValues } from "@/app/book/page";
import { Control, Controller, FieldErrors, UseFormResetField, useController, useWatch } from "react-hook-form";
import { Character, CharacterSelection, characters, numberCharacters, dresses } from "@/app/mockdata";
import CharacterCard from "@/components/form/Selection Cards/characterCard";
import SelectionCard from "@/components/form/Selection Cards/selectionCard";
import styles from "./characters.module.css";
import Dropdown from "@/components/form/Dropdown/dropdown";

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

    // Toggle state for each character in dress selection
    const [openDress, setOpenDress] = React.useState<{ [characterId: number]: boolean }>({});

    // Only show unselected characters if selection limit not reached
    const canSelectMore = (characterField.value?.length ?? 0) < parseInt(numCharacters || '0');

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
                    <div>
                        <h4 className={styles.subheader}>Characters</h4>
                        <div className={styles.selections}>
                            {characterOptions.filter(item =>
                                selectedCharacterIds.includes(item.id) || canSelectMore
                            ).map((item) => (
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
                            ))}
                        </div>
                        {props.errors.Character?.message ? (
                            <p style={errorTextStyle}>{props.errors.Character.message}</p>
                        ) : null}
                        {selectedCharacterIds.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <span
                                    style={{ color: '#343B95', textDecoration: 'underline', cursor: 'pointer' }}
                                    onClick={() => characterField.onChange([])}
                                >
                                    Clear Character Selection
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        {characterField.value?.length === parseInt(numCharacters) && numCharacters !== undefined ? (
                            <>
                                <h3 className={styles.header}>Select Preferred Attire (Optional)</h3>
                                <div className={styles.dressSelection}>
                                    {characterField.value.map((character) => {
                                        const characterData = characterOptions.find(c => c.id === character.characterId);
                                        const characterCostumes = dresses.filter((item) => item.characterId === character.characterId - 1);
                                        if (!characterData || characterCostumes.length === 0) return null;
                                        const isOpen = openDress[character.characterId] ?? false;
                                        return (
                                            <div
                                                key={character.characterId}
                                                style={{
                                                    border: '1px solid #E0E0E0',
                                                    borderRadius: 12,
                                                    padding: 16,
                                                    background: '#FAFAFA',
                                                    boxShadow: '0 1px 4px rgba(52,59,149,0.04)',
                                                }}
                                            >
                                                <div
                                                    className={styles.subheader}
                                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between' }}
                                                    onClick={() => setOpenDress(prev => ({ ...prev, [character.characterId]: !isOpen }))}
                                                >
                                                    <span>{characterData.name}</span>
                                                    {isOpen ? (
                                                        <IconChevronUp size={20} />
                                                    ) : (
                                                        <IconChevronDown size={20} />
                                                    )}
                                                </div>
                                                {isOpen && (
                                                    <div className={styles.selections}>
                                                        {characterCostumes
                                                            .filter(dress => dress.id === character.dressId || character.dressId === -1)
                                                            .map((dress) => (
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
                                                        {character.dressId !== -1 && (
                                                            <div style={{ width: '100%' }}>
                                                                <span
                                                                    style={{
                                                                        color: '#343B95',
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer',
                                                                        display: 'block',
                                                                        marginTop: 16
                                                                    }}
                                                                    onClick={() => {
                                                                        characterField.onChange(setDress(-1, character.characterId, characterField.value ?? []))
                                                                    }}
                                                                >
                                                                    Clear Dress Selection
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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