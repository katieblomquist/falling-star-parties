import NavBar from "@/components/navbar/navbar";
import styles from "./tos.module.css"
import Footer from "@/components/footer/footer";

export default function Tos() {
    return (
        <>
            <NavBar location={"tos"} />
            <div className={styles.tos}>
                <h2 className={styles.header}>Terms of Service</h2>
                <p>
                    Falling Star Parties, LLC books based on current availability. If available, clients will receive a booking finalization letter containing their event details, an outline of services, COVID-19 Precautions, and pricing information.
                    Once this letter has been accepted via completion of the retainer payment, all additional changes are once again subject to availability, as we are often entertaining at more than one event during the day. Changes will not be accepted
                    less than 24 hours before the event start time. Please note that, while we try to honor requests for specific outfits, this is subject to change as dresses are on rare occasionally damaged as we perform at other events.
                </p>
                <p>
                    Falling Star Parties, LLC will provide quality entertainment. We will travel to your location and delight your guests per the arrangements outlined in the finalization letter.
                </p>
                <p>
                    Falling Star Parties, LLC provides entertainment to multiple families every weekend. This makes it difficult to accommodate last minute requests, and as a result, we usually cannot accommodate any bookings made less than one week in advance.
                    Bookings made less than 1 week in advance are subject to a 33% late fee.
                </p>
                <p>
                    Falling Star Parties, LLC provides performers who are completely focused on staying in character, and keeping the magic alive. Please be sure any adults in attendance are of the understanding that they should not push the performer to “break character”.
                    If you have any questions regarding the company, pricing, costumes, etc, please talk to the attendant in a location where it will not ruin the magic.
                </p>
                <p>
                    For your guest&apos;s safety, we also require that 1 adult be present for every 5 children in attendance. This helps to guarantee your children&apos;s safety while allowing us to entertain and delight.
                </p>
                <p>
                    Falling Star Parties, LLC may choose to send an attendant along with the performer. This is to help the event run smoothly and assist with safety. If you have any questions or concerns, please first approach the attendant to make sure to keep
                    the magic alive for the guests in attendance. There is no additional cost for an attendant and they are sent free of charge. You may specifically request that an attendant may be present, but is ultimately subject to availability.
                </p>
                <p>
                    Our performers will always put safety as their first concern. If the performer feels their safety has been compromised in any way due to hostile or unsafe behavior, hazardous conditions, or unsanitary environment, or harassment,
                    the performer has the right to leave immediately. Falling Star Parties, LLC reserves the right to not provide a refund in these situations.
                </p>
                <p>
                    Customers agree to pay Falling Star Parties, LLC a $50 nonrefundable retainer upon booking (Bookings are not finalized until this has been paid). This must be completed within 48 hours of recieving your finalization letter. If the retainer
                    remains unpaid, we will assume you no longer wish to book with us and will release your date to other interested parties. The remainder is due no less than 48 hours before your event. If final payment is not completed, we will not be able
                    to attend your event. Full payment is required upfront for any party booked less than 10 days in advance.
                </p>
                <p>
                    Falling Star Parties LLC will travel up to 30 miles free of charge from your performer&apos;s location. We are happy to travel beyond that for a small travel fee of $1 per mile for bookings 30-50 miles away and $2 per mile for each additional mile
                    after 50. All clients regardless of location must pay for tolls.
                </p>
                <p>
                    Falling Star Parties, LLC is not responsible for any damage, illness or injury that may occur. Use of company services, video call rooms, and website are at the sole risk of you. While we do everything we possibly can to limit exposure and contact
                    at this time, customers acknowledges that we are not responsible should they or their guests contract COVID-19. Additionally, we may add any additional COVID-19 precautions as we see fit.
                </p>
                <p>
                    If a customer needs to cancel their booking with Falling Star Parties, LLC, they are asked to give at least 48 hours notice. Falling Star Parties, LLC is happy to assist with rescheduling of parties if needed. If cancellation occurs,
                    Falling Star Parties, LLC will gladly refund everything except the nonrefundable booking deposit. No refund will be offered for parties canceled less than 48 hours in advance.
                </p>
                <p>
                    Falling Star Parties, LLC is committed to providing our customers with the best and most reliable service possible. However, in the rare instance that we need to cancel for any reason (with the exception of inclement weather - see below for policy),
                    we will provide a full refund or reschedule, depending on the preference of the customer.
                </p>
                <p>
                    Customers acknowledge that Falling Star Parties LLC may be unable to accommodate an outdoor event if the temperature is above 90 degrees, below 50 degrees, or in the case of inclement weather. An alternate location will need to be provided
                    in these instances. Please note that COVID-19 precautions may be applied if the event is moved indoors. If we need to cancel due to adverse weather conditions (such as heavy snow, icy roads, etc.), we will arrange for a quick video call at
                    the agreed upon time and work on rescheduling your visit as soon as possible. If the client would prefer to cancel rather than reschedule, Falling Star Parties LLC will refund the full amount minus the non-refundable event retainer.
                </p>
                <p>
                    Customers acknowledge that Falling Star Parties, LLC is not associated or affiliated with the Walt Disney Company or other third parties owning rights to well known fairytale or other characters and associated stories. As a result, customers
                    choosing to advertise their event are required by Falling Star Parties to use our character names and images. Customers retaining our services are responsible for any and all advertising decisions that violate Walt Disney Company or other third party&apos;s copyright.
                </p>
            </div>
        <Footer />
        </>
    )
}