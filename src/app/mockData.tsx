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
export const characters = [{ id: 0, name: "Ice Queen", img: "/IMG_4976.jpg" },
{ id: 1, name: "Snow Princess", img: "/IMG_4976.jpg" },
{ id: 2, name: "Mermaid Princess", img: "/IMG_4976.jpg" },
{ id: 3, name: "Rose Princess", img: "/IMG_4976.jpg" },
{ id: 4, name: "Glass Slipper Princess", img: "/IMG_4976.jpg" },
{ id: 5, name: "Sleeping Princess", img: "/IMG_4976.jpg" },
{ id: 6, name: "Tower Princess", img: "/IMG_4976.jpg" },
];

//abstract to DB
export const dresses = [{ id: 0, name: "Ice Dress", img: "/IMG_4976.jpg", characterId: 0 }, { id: 1, name: "Elements Dress", img: "/IMG_4976.jpg", characterId: 0 },
{ id: 2, name: "Adventure Dress", img: "/IMG_4976.jpg", characterId: 0 }, { id: 3, name: "Yuletide Dress", img: "/IMG_4976.jpg", characterId: 0 },
{ id: 4, name: "Coronation Dress", img: "/IMG_4976.jpg", characterId: 1 }, { id: 5, name: "Queen Dress", img: "/IMG_4976.jpg", characterId: 1 },
{ id: 6, name: "Adventure Dress", img: "/IMG_4976.jpg", characterId: 1 }, { id: 7, name: "Yuletide Dress", img: "/IMG_4976.jpg", characterId: 1 },
{ id: 8, name: "Walking Tail", img: "/IMG_4976.jpg", characterId: 2 }, { id: 9, name: "Ballgown", img: "/IMG_4976.jpg", characterId: 2 },
{ id: 10, name: "Ballgown", img: "/IMG_4976.jpg", characterId: 3 }, { id: 11, name: "Holiday Dress", img: "/IMG_4976.jpg", characterId: 3 },
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