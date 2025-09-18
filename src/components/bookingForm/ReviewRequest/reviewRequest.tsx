import { FormValues } from "@/app/book/page";
import { packages, extras, characters, dresses, event, time } from "@/app/mockData";
import { useEffect, useState } from "react";
import styles from "./reviewRequest.module.css";


export default function ReviewRequest(props: { values: FormValues }) {

  const [characterList, setList] = useState("");
  const eventType = props.values.EventType;

  function getOrdinal(n: number) {
    let ord = 'th';

    if (n % 10 == 1 && n % 100 != 11) {
      ord = 'st';
    }
    else if (n % 10 == 2 && n % 100 != 12) {
      ord = 'nd';
    }
    else if (n % 10 == 3 && n % 100 != 13) {
      ord = 'rd';
    }

    return ord;
  }

  useEffect(() => {
    // Move the character list logic directly into useEffect
    const buildCharacterList = () => {
      const characterList = props.values.Character.map(char => {
        const character = characters.find(character => character.id === char.characterId)?.name;
        // const dress = dresses.find(dress => dress.id === char.dressId)?.name;
        // if(dress !== undefined){
        //   return `${character} (${dress})`
        // }
        // return `${character} (No Preference)`
      }).filter(Boolean).join(', ');

      return characterList;
    };

    setList(buildCharacterList());
  }, [props.values.Character]);

  return (
    <>
      <div>
        <h3 className={styles.header}>Contact Info for {props.values.FirstName}</h3>
        <p className={styles.subline}><b>Full Name: </b>{props.values.FirstName} {props.values.LastName}</p>
        <p className={styles.subline}><b>Email: </b>{props.values.Email}</p>
        <p className={styles.subline}><b>Phone: </b>{props.values.Phone}</p>
      </div>
      <br></br>
      <div>
        {eventType === "Birthday Party" ? (
          <h3 className={styles.header}> {props.values.ChildAge
            ? `${props.values.ChildAge}${getOrdinal(parseInt(props.values.ChildAge))} `
            : ''} {props.values.EventType} for {props.values.ChildName}</h3>
        ) : (
          <h3 className={styles.header}> {props.values.EventType} for {props.values.OrganizationName}</h3>
        )}

        <p className={styles.subline}><b>When:</b> {props.values.Date.monthLong} {props.values.Date.day}{getOrdinal(props.values.Date?.day)}, {props.values.Date.year} at {props.values.Time} </p>
        <p className={styles.subline}><b>Where:</b> {props.values.Location}</p>
        {eventType === "Birthday Party" ? (
          <p className={styles.subline}><b>Event Package: </b>{packages[props.values.Package].title} - {packages[props.values.Package].duration}</p>
        ) : (
          <p className={styles.subline}><b>Event Package: </b>{packages[props.values.Package].title}</p>
        )}
        
        <p className={styles.subline}><b>Characters:</b> {characterList}</p>
        <p className={styles.subline}><b>Number of Children: </b>{props.values.Attendance}</p>
        <p className={styles.subline}><b>Additional Comments: </b>{props.values?.AdditionalInfo}</p>
      </div>
    </>
  )
}