import { FormValues } from "@/app/book/page";
import {birthdayPackages, birthdayExtras } from "@/components/bookingForm/EventOptions/eventOptions";
import {hour, minute} from "@/components/bookingForm/TimeLocation/timeLocation";
import {event} from "@/components/bookingForm/Information/information";


export default function ReviewRequest(props: {values: FormValues}){

    function getOrdinal(n: number) {
        let ord = 'th';
      
        if (n % 10 == 1 && n % 100 != 11)
        {
          ord = 'st';
        }
        else if (n % 10 == 2 && n % 100 != 12)
        {
          ord = 'nd';
        }
        else if (n % 10 == 3 && n % 100 != 13)
        {
          ord = 'rd';
        }
      
        return ord;
      }

    return(
        <>
            <div>
                <h3>Contact Info for {props.values.FirstName}</h3>
                <p>Full Name: {props.values.FirstName} {props.values.LastName}</p>
                <p>Email: {props.values.Email}</p>
                <p>Phone: {props.values.Phone}</p>
            </div>
            <br></br>
            <div>
                <h3> {props.values.ChildAge}{getOrdinal(parseInt(props.values.ChildAge))} {event[props.values.EventType]} for {props.values.ChildName}</h3>
                <p>When: {props.values.Date.month} - {props.values.Date?.day} - {props.values.Date.year} at {hour[props.values.Hour]}:{minute[props.values.Minute]} </p>
                <p>Where: {props.values.Location}</p>
                <p>Event Package: {birthdayPackages[props.values.Package].title} - {birthdayPackages[props.values.Package].duration}</p>
                <p>Characters: </p>
                <p>Number of Children: {props.values.Attendance}</p>
                <p>Additional Comments: {props.values?.AdditionalInfo}</p>
            </div>
        </>
    )
}