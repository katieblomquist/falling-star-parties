import { Content, Petit_Formal_Script } from "next/font/google";

export type StepperContent = { id: number, title: String, completed: boolean, content: ReactNode };
export type Services = { id: number, type: string, title: String, description: String, duration: String, cost: number, additionalCharacterCost: number };
export type CharacterDress = { id: number, name: String, img: String, characterId: number };
export type Character = { id: number, name: String, img: String };
export type CharacterSelection = { characterId: number, dressId: number }

export const formal_script = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: '--formal-script', preload: false });

//abstract to DB
export const packages = [{ id: 0, type: "Birthday Party", title: "Dream", description: "Our Characters will sing, tell stories, teach princess lessons, hold a royal coronation, and pose for portraits!", duration: "30 Minutes", cost: 150, additionalCharacterCost: 75 },
{ id: 1, type:"Birthday Party", title: "Sparkle", description: "Our Characters will do everything included in the Dream Package plus play party games such as Simon Says, Hide and Go Seek, and Duck Duck Goose!", duration: "60 Minutes", cost: 220, additionalCharacterCost: 120 },
{ id: 2, type: "Birthday Party", title: "Shine", description: "Our Characters will do everything included in the Sparkle Package plus face paint with your guests!", duration: "90 Minutes", cost: 300, additionalCharacterCost: 180 },
{ id: 3, type: "Public Event", title: "One Hour Meet and Greet", description: "Our characters will enchant your guests, take photos, and provide magical interactions for one hour", duration: "60 Minutes", cost: 250, additionalCharacterCost: 150 },
{ id: 4, type: "Public Event", title: "Two Hour Meet and Greet", description: "Our characters will enchant your guests, take photos, and provide magical interactions for one hour", duration: "120 Minutes", cost: 350, additionalCharacterCost: 300 },
{ id: 4, type: "Charity Event", title: "One Hour Meet and Greet", description: "Our characters will enchant your guests, take photos, and provide magical interactions for one hour", duration: "60 Minutes", cost: 175, additionalCharacterCost: 75 },
{ id: 5, type: "Charity Event", title: "Two Hour Meet and Greet", description: "Our characters will enchant your guests, take photos, and provide magical interactions for one hour", duration: "120 Minutes", cost: 300, additionalCharacterCost: 150 }
];

//abstract to DB
export const extras = [{ id: 0, type: "Birthday Party", title: "Storybook Keepsake", description: "Includes a storybook signed by your character that she will present at the end of story time!", duration: "", cost: 15, additionalCharacterCost: 0 },
{ id: 1, type: "Birthday Party", title: "Deluxe Storybook Keepsake", description: "Includes a storybook, with over 10 princess stories, signed by your character that she will present at the end of story time!", duration: "", cost: 30, additionalCharacterCost: 0 },
{ id: 2, type: "Birthday Party", title: "Deluxe Princess Set", description: "Includes an upgraded rhinestone crown and a themed princess sash.", duration: "", cost: 30, additionalCharacterCost: 0 },
{ id: 3, type: "Birthday Party", title: "Gift Bags", description: "Includes a gift bag for each child and the Deluxe Princess Set for the Birthday Princess. We offer both princess themed and superhero themed bags so that every child is included! \n\nNote: Price is based on the anticipated number of guests", duration: "", cost: 10, additionalCharacterCost: 0 },
{ id: 4, type: "Public Event", title: "Storytime", description: "Includes a musical story time for your guests", duration: "", cost: 0, additionalCharacterCost: 0 },
{ id: 5, type: "Public Event", title: "Interactive Storytime", description: "Your guests get to become a part of the story through props and lines of their own!", duration: "", cost: 75, additionalCharacterCost: 0 },
{ id: 6, type: "Public Event", title: "Signature Cards", description: "Your guests will get to take a little piece of the magic with them through our signed photo cards!", duration: "", cost: 30, additionalCharacterCost: 0 }
];

//abstract to DB
export const characters = [{ id: 0, name: "Ice Queen", img: "/DSC_0729.jpg" },
{ id: 1, name: "Snow Princess", img: "/IMG_1962.jpg" },
{ id: 2, name: "Mermaid Princess", img: "/IMG_6126.jpg" },
{ id: 3, name: "Rose Princess", img: "/IMG_3422.jpg" },
{ id: 4, name: "Glass Slipper Princess", img: "/IMG_4976.jpg" },
{ id: 5, name: "Sleeping Princess", img: "/IMG_4976.jpg" },
{ id: 6, name: "Tower Princess", img: "/IMG_4976.jpg" },
];

//abstract to DB
export const dresses = [{ id: 0, name: "Ice Dress", img: "/DSC_0729.jpg", characterId: 0 }, { id: 1, name: "Elements Dress", img: "/IMG_4976.jpg", characterId: 0 },
{ id: 2, name: "Adventure Dress", img: "/IMG_4976.jpg", characterId: 0 }, { id: 3, name: "Yuletide Dress", img: "/IMG_2153.jpg", characterId: 0 },
{ id: 4, name: "Coronation Dress", img: "/IMG_1962.jpg", characterId: 1 }, { id: 5, name: "Queen Dress", img: "/IMG_9963.jpg", characterId: 1 },
{ id: 6, name: "Adventure Dress", img: "/IMG_7410.jpg", characterId: 1 }, { id: 7, name: "Yuletide Dress", img: "/IMG_3821.jpg", characterId: 1 },
{ id: 8, name: "Walking Tail", img: "/IMG_6126.jpg", characterId: 2 }, { id: 9, name: "Ballgown", img: "/IMG_3063.jpg", characterId: 2 },
{ id: 10, name: "Ballgown", img: "/IMG_3422.jpg", characterId: 3 }, { id: 11, name: "Holiday Dress", img: "/IMG_1230.jpg", characterId: 3 },
{ id: 12, name: "Ballgown", img: "/IMG_4976.jpg", characterId: 4 }, { id: 13, name: "Ballgown", img: "/IMG_4976.jpg", characterId: 5 },
{ id: 14, name: "Adventure Dress", img: "/IMG_4976.jpg", characterId: 6 }]

export const numberCharacters = ["1", "2", "3", "4", "5", "6"];

export const location = ["Indoor", "Outdoor", "No Preference"];

export const photos = ["Yes", "No"];

export const event = ["Birthday Party", "Public Event", "Charity Event"];

export const time = ["10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM", "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM", "12:00 PM", "12:15 PM", "12:30 PM",
    "12:45 PM", "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM", "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM", "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
    "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM", "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM", "6:00 PM"
]

import { CharacterDressArray } from "../components/carouselCard/carouselCard";

export const iceQueen = [
    { id: 0, name: "Ice Dress", img: "/DSC_0729.jpg", characterId: 0 }, { id: 1, name: "Elements Dress", img: "/IMG_4976.jpg", characterId: 0 },
{ id: 2, name: "Adventure Dress", img: "/IMG_4976.jpg", characterId: 0 }, { id: 3, name: "Yuletide Dress", img: "/IMG_2153.jpg", characterId: 0 }
];

export const snowPrincess = [
    { id: 4, name: "Coronation Dress", img: "/IMG_1962.jpg", characterId: 1 }, { id: 5, name: "Queen Dress", img: "/IMG_9963.jpg", characterId: 1 },
{ id: 6, name: "Adventure Dress", img: "/IMG_7410.jpg", characterId: 1 }, { id: 7, name: "Yuletide Dress", img: "/IMG_3821.jpg", characterId: 1 }
];

export const mermaidPrincess = [
    { id: 8, name: "Walking Tail", img: "/IMG_6126.jpg", characterId: 2 }, { id: 9, name: "Ballgown", img: "/IMG_3063.jpg", characterId: 2 }
];

export const rosePrincess = [
    { id: 10, name: "Ballgown", img: "/IMG_3422.jpg", characterId: 3 }, { id: 11, name: "Holiday Dress", img: "/IMG_1230.jpg", characterId: 3 }
]

import { ReactNode } from "react";
import Accordian from "@/components/accordian/accordian";

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

export const serviceTabs = [
    {
        title: 'DREAM', 
        topBlurb: 'Step into a world of enchantment with our Dream Package! Delight awaits with:', 
        listItems: ['30 Minutes with 1 Magical Character', 'A Story Time filled with live singing!', 'Princess Lessons straight from the enchanted kingdom', 'The Grandeur of a Royal Coronation Ceremony, complete with a shimmering crystal tiara to cherish!', 'Commemorate the occasion with an enchanting photo opportunity', 'Finish the fairy tale with a Happy Birthday Song!'],
        bottomBlurb: 'Starting at $200 Add more enchanting characters for $100 each!'
    },
    {
        title: 'SPARKLE', 
        topBlurb: 'Experience the magic at its fullest with our Sparkle Package! Your royal celebration includes:', 
        listItems: ['60 Minutes with 1 Magical Character', 'A Story Time filled with live singing!', 'Princess Lessons straight from the enchanted kingdom', 'The Grandeur of a Royal Coronation Ceremony, complete with a shimmering crystal tiara to cherish!','Games and activities led by your character', 'Commemorate the occasion with an enchanting photo opportunity', 'Finish the fairy tale with a Happy Birthday Song!'],
        bottomBlurb: 'Starting at $275 Add more enchanting characters for $150 each!'
    },
    {
        title: 'SHINE', 
        topBlurb: 'Turn your party into a fairy tale come true with the Ultimate Dream Package! Enjoy:', 
        listItems: ['90 Minutes with 1 Magical Character', 'A Story Time filled with live singing!', 'Princess Lessons straight from the enchanted kingdom', 'The Grandeur of a Royal Coronation Ceremony, complete with a shimmering crystal tiara to cherish!', 'Magical Face Painting for all your guests', 'Games and activities led by your character', 'Commemorate the occasion with an enchanting photo opportunity', 'Finish the fairy tale with a Happy Birthday Song!'],
        bottomBlurb: 'Starting at $350 Add more enchanting characters for $200 each!'
    },
    {
        title: 'MAGIC MIRROR', 
        topBlurb: 'Bring the enchantment home—no matter where you are! With our Virtual Magic Visit, your child’s dreams come to life on screen with:', 
        listItems: ['A live 20-minute video call with your chosen princess or character', 'Personalized greetings and interactive conversation', 'A captivating story time, complete with live singing', 'Time for your child to ask questions and share their favorite moments'],
        bottomBlurb: 'Starting at $65 Add more magical friends for $35 each'
    },
    {
        title: 'ENCHANTING EXTRAS', 
        topBlurb: `Add an extra touch of wonder to your celebration with our delightful party add-ons! Each extra is designed to create lasting memories and make your child's special day even more magical:`, 
        listItems: ['Storybook Keepsake $20 - Take home the very storybook your character reads at the party! This beautifully illustrated keepsake is personalized, so your child can relive the magical tale again and again.', 
        'Deluxe Storybook Keepsake $40 - Make story time even more enchanting with our deluxe edition! This special book features over 10 different princess stories, and gorgeous illustrations — a treasure trove of fairy tales to enjoy for years to come.', 
        'Deluxe Princess Set $30 - Let your little royal shine with an upgraded sparkling crown and a themed sash, perfect for a grand coronation and magical photo moments!',
        'Magical Gift Bags $10 per child - Send every guest home with a touch of fairy tale wonder! Each themed gift bag is filled with enchanting surprises and treasures—and now includes an upgrade to the Deluxe Princess Set, featuring a sparkling crown and themed sash for the birthday child. Every child will feel like royalty as they take the magic home!'],
        bottomBlurb: 'Add any of these extras to your party package and let the magic continue long after the celebration ends!'
    },
]

export const masonryPhotos = [
    {
        width: 350,
        height: 500,
        src: '/DSC_0729.jpg'
    },
    {
        width: 350,
        height: 500,
        src: '/IMG_1230.jpg'
    },
    {
        width: 350,
        height: 500,
        src: '/IMG_1962.jpg'
    },
    {
        width: 350,
        height: 500,
        src: '/IMG_2153.jpg'
    },
    {
        width: 350,
        height: 500,
        src: '/IMG_3063.jpg'
    }
]

export const reviews = [
    {
        stars: 5,
        review: 'There is so much attention to detail and each character is very well casted! You can see how much love is put into this company! Highly recommend!!',
        client:'Kennedy P.',
        photo: '/IMG_2153.jpg',
        title: 'Beautiful characters!'
    },
    {
        stars: 5,
        review: 'All the kids were star struck! If you want the real deal you’re in the right place!',
        client:'-Charlotte A.',
        photo: '/IMG_3422.jpg',
        title: 'Such magical, kind & beautiful characters!'
    },
    {
        stars: 5,
        review: "Great communication, wonderful to work with, amazing with the kids, and reasonably priced. My daughter's 4th birthday party was made a million times better by having the princesses join us. They were so professional and sweet and talented. Would highly recommend this as entertainment for your next event!",
        client:'Laura S.',
        photo: '/IMG_2153.jpg',
        title: 'This was an absolute pleasure!'
    },
    {
        stars: 5,
        review: 'There is so much attention to detail and each character is very well casted! You can see how much love is put into this company! Highly recommend!!',
        client:'Kennedy P.',
        photo: '/IMG_2153.jpg',
        title: 'Beautiful characters!'
    },
    {
        stars: 5,
        review: 'All the kids were star struck! If you want the real deal you’re in the right place!',
        client:'-Charlotte A.',
        photo: '/IMG_3422.jpg',
        title: 'Such magical, kind & beautiful characters!'
    },
    {
        stars: 5,
        review: "Great communication, wonderful to work with, amazing with the kids, and reasonably priced. My daughter's 4th birthday party was made a million times better by having the princesses join us. They were so professional and sweet and talented. Would highly recommend this as entertainment for your next event!",
        client:'Laura S.',
        photo: '/IMG_2153.jpg',
        title: 'This was an absolute pleasure!'
    },
]

export const homeReviews = [
    {
        stars: 5,
        review: 'There is so much attention to detail and each character is very well casted! You can see how much love is put into this company! Highly recommend!!',
        client:'Kennedy P.',
        photo: '/IMG_2153.jpg',
        title: 'Beautiful characters!'
    },
    {
        stars: 5,
        review: 'All the kids were star struck! If you want the real deal you’re in the right place!',
        client:'-Charlotte A.',
        photo: '/IMG_3422.jpg',
        title: 'Such magical, kind & beautiful characters!'
    },
    {
        stars: 5,
        review: "Great communication, wonderful to work with, amazing with the kids, and reasonably priced. My daughter's 4th birthday party was made a million times better by having the princesses join us. They were so professional and sweet and talented. Would highly recommend this as entertainment for your next event!",
        client:'Laura S.',
        photo: '/IMG_2153.jpg',
        title: 'This was an absolute pleasure!'
    },
]
