import { ReactNode } from "react";
import Accordian from "./components/accordian/accordian";

type Faq = { question: string, answer: string }
type Tab = {label: string, content: ReactNode}
export type TabArray = Array<Tab>
export type FaqArray = Array<Faq>
export const booking: FaqArray = [
    {
        question: 'How far in advance should I book?',
        answer: "We suggest booking 4-6 weeks in advance. However, always try to accommodate any request we receive, so don't hesitate to ask!"
    },
    {
        question: 'Do you offer price matching?',
        answer: "Yes! We will match the price of any legally registered and insured business in Maryland. When you submit your booking request, make a note that you'd like us to match a quote given by another company, and one of our Fairy Godmothers should be in touch within 24 hours. Unsure if the business you're wanting us to match qualifies? You can look them up on the Maryland Goverment Website. If the business is currently leagally registered, it will be listed as being in Good Standing."
    },
    {
        question:'Can I have a character at corporte, public, or school events?',
        answer: "Absolutely! We are happy to entertain at a variety of events and venues."
    },
    {
        question: 'Do I need to pay a deposit to book my party?',
        answer: "We do require a $50 nonrefundable retainer to hold your date. If your plans change and the day or time needs to be moved, we will do our best to accommodate you."
    },
    {
        question: 'Is there a late booking fee?',
        answer: "Yes. There is a 33% fee for any booking make less than 1 week in advance. "
    },
    {
        question: 'What is your pricing?',
        answer: "Our pricing varies based on the length of the service. For a full list of prices, visit our services page!"
    }
];

export const videoCalls: FaqArray = [
    {
        question: 'How do video calls work?',
        answer: "Once your booking is finalized, you’ll receive a google calendar invite to the email you provide that includes a link to a google meet call (We send this link again when we confirm your booking the week before). If you’re connecting from a laptop or desktop computer (which we strongly recommend as computers tend to hold the connection better), all you’d need to do on the day of is Click on the link and select join meeting. If you choose to connect on a mobile device, you would additionally need to download the google meet app and sign into your google account."
    }
]

export const tabs: TabArray = [
    { label: "BOOKING", content: <Accordian content={booking} />},
    { label: "VIDEO CALLS", content: <Accordian content={videoCalls} />}
  ];