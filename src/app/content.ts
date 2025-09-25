import { ReactNode } from "react";
type Faq = { question: string, answer: string }
type Tab = { label: string, content: ReactNode }
export type TabArray = Array<Tab>
export type FaqArray = Array<Faq>
export type CharacterDress = { id: number, name: String, img: String, characterId: number };

export const homePage = [
    {
        titleStart: "Bring the ",
        emphasis: "Fairy Tale",
        titleEnd: " to Life!",
        blurb: "At Falling Star Parties, we're on a mission to sprinkle a little extra magic into every celebration! Whether you're planning a princess-themed birthday bash or a corporate event fit for royalty, we've got you covered. Our enchanting array of services include mesmerizing storytelling sessions, toe-tapping sing-alongs, interactive games, and delightful activities that will leave guests of all ages spellbound!",
        button: "VIEW SERVICES",
        variant: 1,
        href: "/services",
        images: ["/bubbles/home/IMG_5510.jpg", "/bubbles/home/IMG_8921.jpg", "/bubbles/home/IMG_5496.jpg"]

    },
    {
        titleStart: "Make the ",
        emphasis: "Dream",
        titleEnd: " Come True!",
        blurb: "Falling Star Parties has always been dedicated to providing the most realistic character entertainment possible. From our exquisite one-of-a-kind costuming to our talented cast, we strive to maintain the highest standards in character entertainment. Whether we’re with you in real life or on your magic mirror, our characters are sure to feel like they stepped right out of a story book and into your living room!",
        button: "VIEW CHARACTERS",
        variant: 2,
        href: "/characters",
        images: ["/bubbles/home/IMG_3268.jpg", "/bubbles/home/IMG_3422.jpg", "/bubbles/home/IMG_3114.jpg"]
    }

]

export const reviews = [
    {
        stars: 5,
        review: "Falling Star Parties was absolutely AMAZING! They made sure that my daughter Frozen themed birthday party was extraordinary! From the beginning with the communication of setting up the event to the end was excellent with Katelyn. Katelyn made sure everything was organized and in place for the special day! Also, the Ice Queen was reasonably priced with all of the fun games and interactions included! At the event the Ice Queen was phenomenal! The Ice Queen was ready to interact with all of the children especially the birthday girl. All of the children were amazed and was so excited about story time with musical fun, face painting, bubbles, coronation dance lessons, pictures, and singing happy birthday! The attendant was great as well, made sure the party flowed well and kept everything aligned!! All of the children and parents couldn’t stop talking about all the fun they had with the Ice Queen!! My daughters 3rd birthday was a SUCCESS!! Thank you so much Falling Star Parties!!",
        client: 'Laura S.',
        photo: "/IMG_8921.jpg",
        title: 'My daughters 3rd birthday was a SUCCESS!!'
    },
    {
        stars: 5,
        review: 'Katelyn was great to work with throughout the whole process, from first email to last. She responded quickly, answered any questions we had. At the party, all of the girls were so excited to meet the Ice Queen! She was in character the whole time and the kids loved it! Even the parents were impressed! She read a story, sang songs. She played games with the kids, gave princess lessons, answered their questions when they were interrogating her to see if she was really the Ice Queen. She gave the birthday girl a special crown and a Wishing Star, she sang happy birthday. She even played freeze dance with the kids! She was amazing! We will definitely be using her next time we need a princess! And I will definitely be recommending this to everyone!',
        client: '-Joanna P.',
        photo: "/IMG_8921.jpg",
        title: 'She was amazing!'
    },
    {
        stars: 5,
        review: "There's not enough good things I can say about Falling Star Parties. First off, we had a princess Jasmine from another company come down with flu. Needless to say we where in a terrible situation. My soon to be five year old was counting on seeing Jasmine. We called all over looking for another one but, no one was available. We talked with Falling Star Parties and they offered to send another princess with a gift for my five year old from princess Jasmine explaining she had to return to her kingdom and was unable to make it. Now, they don't normally give a gift to a birthday girl, but they did. They also waived their 50 mile outside their area fee. Which they didn't have to do. The princess they sent was my daughter's second favorite, The Little Mermaid. She was on time and did exactly what they said she would. On top of that, her singing voice was wonderful. My daughter and her friends loved The Little Mermaid. So I would highly recommend Falling Star Parties. They will. Go above and beyond to make sure your little ones birthday us the best it can be.",
        client: 'Charlotte A.',
        photo: "/IMG_8921.jpg",
        title: 'They will go above and beyond to make sure your little ones birthday us the best it can be.'
    },
    {
        stars: 5,
        review: "I am beyond pleased! Because of COVID-19 mandates, we were forced to indefinitely postpone my daughter’s 3 year old princess birthday event. :(. But in true princess spirit, Katie made sure to still make my daughter’s day one to remember! She setup a story time video call where the ‘snow princess’ (in full princess costume) read a fun bedtime story and sang a beautiful lullaby to my little girl. It was truly something special! I can’t say enough wonderful things about the owner - she was so sweet and so committed to making this a wonderful experience (despite current events). One to remember! Thank you, Katie!",
        client: 'Amy D.',
        photo: "/IMG_8921.jpg",
        title: 'It was truly something special!'
    }

]

export const aboutUs = [
    {
        titleStart: "Maryland's Most ",
        emphasis: "Magical",
        titleEnd: "",
        blurb: "Welcome to Falling Star Parties, where we're all about bringing a touch of magic to your events! Based in Baltimore, MD, we're dedicated to providing top-notch character entertainment for birthdays, corporate events, charity events, and more. With our stunning costumes and talented cast, we guarantee an experience that's both unforgettable and enchanting. And guess what? Our magic isn't confined to Maryland—we offer Virtual Services across the United States. So whether you're near or far, let Falling Star Parties sprinkle some joy into your next celebration!",
        button: "VIEW SERVICES",
        variant: 2,
        href: "/services",
        images: ["/bubbles/about/IMG_4332-2.jpg", "/bubbles/about/IMG_1076.jpg", "/bubbles/about/IMG_4628.jpg"]

    },
    {
        titleStart: "Meet the Owner",
        emphasis: "",
        titleEnd: "",
        blurb: "Introducing Katelyn, the imaginative mind behind Falling Star Parties! Since opening in 2018, she's enchanted guests with her stunning characters and artistry. A seasoned performer, Katelyn's brought joy to audiences across the country. With a heart full of whimsy and a passion for making dreams come true, she's dedicated to crafting unforgettable moments for your little one's special day. Let Katelyn and her team sprinkle some magic into your celebrations, creating memories that shine brighter than the stars!",
        images: ["/bubbles/about/IMG_0078.jpg", "/bubbles/about/IMG_0121-3.jpg", "/bubbles/about/IMG_4842.jpg"]
    }
]

export const bookingFaqs = [
    {
        question: 'How far in advance should I book?',
        answer: "We suggest booking 6 weeks in advance. However, always try to accommodate any request we receive, so don't hesitate to ask!"
    },
    {
        question: 'Do you offer price matching?',
        answer: "Yes! We will match the price of any legally registered and insured business in Maryland. When you submit your booking request, make a note that you'd like us to match a quote given by another company, and one of our Fairy Godmothers should be in touch within 24 hours. Unsure if the business you're wanting us to match qualifies? You can look them up on the Maryland Goverment Website. If the business is currently leagally registered, it will be listed as being in Good Standing."
    },
    {
        question: 'Can I have a character at corporte, public, or school events?',
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

export const videoCallsFaqs = [
    {
        question: 'How do video calls work?',
        answer: "Once your booking is finalized, you’ll receive a google calendar invite to the email you provide that includes a link to a google meet call (We send this link again when we confirm your booking the week before). If you’re connecting from a laptop or desktop computer (which we strongly recommend as computers tend to hold the connection better), all you’d need to do on the day of is Click on the link and select join meeting. If you choose to connect on a mobile device, you would additionally need to download the google meet app and sign into your google account."
    }
];

export const inPersonFaqs = [
    {
        question: 'How far do you travel?',
        answer: "Our performers are currently located in the Baltimore area and service Maryland, Southern Pennsylvania, and parts of Delaware. We will travel within a 30-mile radius of our home location free of charge. However, we are happy to travel farther for a small travel fee. There is an additional fee for tolls regardless of location."
    },
    {
        question: 'Do you perform outdoors?',
        answer: "Yes! However, please be aware that an alternate indoor location is required for temperatures above 90 degrees and below 50 degrees  as well as extreme weather. This is for the safety of your guests and our performers."
    },
    {
        question: 'What do I need to do to prepare for your arrival?',
        answer: "Our performers will bring all the supplies they need to entertain at your party! However, there are some things you can do to make things go a little more smoothly. We ask that there be a place for our performers to sit and an open space for them to entertain. Additionally, we will need a table if your event includes face painting."
    },
    {
        question: 'Do I need to be present during the party?',
        answer: "Yes! We love working with kids, but their safety is our first priority. For the children's safety, please make sure there are at least one adult present for every 5 children the duration of your party."
    }
];

export const generalFaqs = [
    {
        question: 'Are your parties appropriate for all ages?',
        answer: "Yes! Falling Star Parties LLC is committed to providing a family friendly experience. Our parties work best for children ages 2-6 years of age. However, all ages enjoy our performances."
    },
    {
        question: 'Should I tip the performer?',
        answer: "Absolutely! We do not factor gratuity into our prices, and tipping is a great way to let our team know they've done a wonderful job."
    },
    {
        question: 'How do I have my children featured on your website or social media?',
        answer: "Feel free to send us any photos from your event that you would like to have featured. You can send photos to info@fallingstarparties.com"
    },
    {
        question: 'Do your performers sing?',
        answer: "Absolutely! Our performers sing songs related to our characters during their story time and throughout the party"
    }
];

export const characters = [
    {
        name: "Ice Queen",
        desc: "Through love, bravery, and the power of letting go, our Ice Queen learns to embrace her uniqueness and find strength in her icy powers. With her mesmerizing presence, she is sure to captivate your guests and inspire them to embrace their true selves and the magic within.",
        background: "/backgrounds/IceQueenBackground.png",
        dresses: [
            { id: 0, name: "Ice Dress", img: "/bubbles/characters/DSC_0729.jpg", characterId: 0 }, { id: 1, name: "Elements Dress", img: "/bubbles/characters/IMG_4976.jpg", characterId: 0 },
            { id: 2, name: "Adventure Dress", img: "/bubbles/characters/IMG_4976.jpg", characterId: 0 }, { id: 3, name: "Yuletide Dress", img: "/bubbles/characters/IMG_2153.jpg", characterId: 0 }
        ]
    },
    {
        name: "Snow Princess",
        desc: "With boundless optimism, courage, and a heart full of love, our Snow Princess proves that true strength lies in never giving up on those you care about. Her warmth and adventurous spirit light up every room, inspiring your guests to face challenges with hope and to believe in the power of family and friendship. Her infectious energy is sure to enchant everyone and remind them that love can thaw even the coldest of hearts.",
        background: "/backgrounds/SnowPrincessBackground.png",
        dresses: [
            { id: 4, name: "Coronation Dress", img: "/bubbles/characters/IMG_1962.jpg", characterId: 1 }, { id: 5, name: "Queen Dress", img: "/bubbles/characters/IMG_9963.jpg", characterId: 1 },
            { id: 6, name: "Adventure Dress", img: "/bubbles/characters/IMG_7410.jpg", characterId: 1 }, { id: 7, name: "Yuletide Dress", img: "/bubbles/characters/IMG_3821.jpg", characterId: 1 }
        ]
    },
    {
        name: "Mermaid Princess",
        desc: "With an adventurous spirit, boundless curiosity, and a heart full of dreams, our Mermaid Princess dives fearlessly into the unknown to discover a world beyond the sea. Her determination and zest for life inspire everyone she meets to embrace new adventures and follow their passions, no matter the obstacles. Her enchanting presence will captivate your guests, encouraging them to celebrate their individuality and believe in the magic of pursuing their own dreams.",
        background: "/backgrounds/MermaidPrincessBackground.png",
        dresses: [
            { id: 8, name: "Walking Tail", img: "/bubbles/characters/IMG_6126.jpg", characterId: 2 }, { id: 9, name: "Ballgown", img: "/bubbles/characters/IMG_3063.jpg", characterId: 2 }
        ]
    },
    {
        name: "Rose Princess",
        desc: "With a love for books, a thirst for adventure, and a heart full of compassion, our Rose Princess shows that true beauty shines from within. Her intelligence, courage, and kindness inspire everyone she meets to look beyond appearances and embrace the magic of empathy and open-mindedness. Her presence brings a touch of wonder to every gathering, inviting guests to imagine new worlds and discover the extraordinary in the everyday.",
        background: "/backgrounds/RosePrincessBackground.png",
        dresses: [
            { id: 10, name: "Ballgown", img: "/bubbles/characters/IMG_3510.jpg", characterId: 3 }, { id: 11, name: "Holiday Dress", img: "/bubbles/characters/IMG_1230.jpg", characterId: 3 }
        ]
    },
    {
        name: "Glass Slipper Princess",
        desc: "With grace, kindness, and unwavering hope, our Glass Slipper Princess shows that dreams can come true no matter where you start. Her gentle spirit and resilience inspire everyone she meets to believe in themselves and treat others with compassion. Her presence adds a touch of magic to any celebration, encouraging guests to find joy in every moment and to never stop wishing for their own happily ever after.",
        background: "/backgrounds/GlassSlipperPrincessBackground.png",
        dresses: [
            { id: 10, name: "Ballgown", img: "/bubbles/characters/IMG_2752.jpg", characterId: 3 },
        ]
    },
    {
        name: "Tower Princess",
        desc: "With boundless curiosity, creativity, and a heart full of hope, our Tower Princess turns every challenge into an adventure. Her optimism, resilience, and kindness inspire those around her to embrace the unknown and see the beauty in every new experience. Her infectious spirit brings light and laughter wherever she goes, inviting guests to dream big, explore fearlessly, and find magic in the world beyond their comfort zone.",
        background: "/backgrounds/TowerPrincessBackground.png",
        dresses: [
            { id: 10, name: "Adventure Dress", img: "/bubbles/characters/IMG_0078.jpg", characterId: 3 }, { id: 11, name: "Holiday Dress", img: "/bubbles/characters/IMG_3827.jpg", characterId: 3 }
        ]
    },
    {
        name: "Sleeping Princess",
        desc: "With a gentle heart, graceful charm, and a dreamy spirit, our Sleeping Princess blossoms from a sheltered life into a young woman longing for adventure and true love. Her kindness and quiet strength inspire those around her to believe in the magic of hope and the beauty of new beginnings. Her enchanting presence brings a timeless sense of romance and wonder, inviting guests to embrace their dreams and the promise of happily ever after.",
        background: "/backgrounds/SleepingPrincessBackground.png",
        dresses: [
            { id: 10, name: "Ballgown", img: "/bubbles/characters/IMG_3291.jpg", characterId: 3 }
        ]
    },
    {
        name: "Bubble Queen",
        desc: "With sparkling wit, boundless charm, and a heart as bright as her famous bubbles, the Bubble Queen floats into every gathering with a spirit that lifts and inspires. Radiantly optimistic and endlessly encouraging, she believes in the power of kindness, friendship, and helping others find their inner sparkle. Whether offering a whimsical laugh or gentle wisdom, her magical presence delights guests of all ages and reminds everyone that sometimes the greatest magic is choosing to do good.",
        background: "/backgrounds/BubbleQueenBackground.png",
        dresses: [
            { id: 10, name: "Ballgown", img: "/bubbles/characters/IMG_5468.jpg", characterId: 3 }
        ]
    },

]

export const servicesPage = [
    {
        titleStart: "Something ",
        emphasis: "Special",
        titleEnd: " For any Occasion",
        blurb: "Our enchanting services offer a royal touch to any occasion! Our professionally trained performers bring beloved characters to life with mesmerizing storytelling, interactive games, enchanting sing-alongs, and dazzling photo opportunities. From princess lessons to fanciful facepainting, we ensure an unforgettable experience for every little prince and princess.",
        button: "BOOK NOW",
        variant: 2,
        href: "/book",
        images: ["/bubbles/service/IMG_8921.jpg", "/bubbles/service/IMG_5339.jpg", "/bubbles/service/IMG_6192.jpg"]
    }
]

export const privateParties = [
    {
        primary: false,
        type: 'Private',
        title: 'Dream',
        time: '30 Minutes',
        activities: ['An Enchanting Story Time', 'Princess Lessons and Coronation', 'Magical Photo Opportunity', 'Happy Birthday Song'],
        basePrice: 200,
        addCharacter: 100
    },
    {
        primary: true,
        type: 'Private',
        title: 'Sparkle',
        time: '60 Minutes',
        activities: ['An Enchanting Story Time', 'Princess Lessons and Coronation', 'Party Games', 'Magical Photo Opportunity', 'Happy Birthday Song'],
        basePrice: 275,
        addCharacter: 150
    },
    {
        primary: false,
        type: 'Private',
        title: 'Shine',
        time: '90 Minutes',
        activities: ['An Enchanting Story Time', 'Princess Lessons and Coronation', 'Party Games', 'Fanciful Face Painting', 'Magical Photo Opportunity', 'Happy Birthday Song'],
        basePrice: 350,
        addCharacter: 200
    },
]

export const privateExtras = [
    {
        title: 'Stoyrbook Keepsake',
        price: 'Starting at $20',
        description: 'Take home the very storybook your character reads at the party! This beautifully illustrated keepsake is personalized, so your child can relive the magical tale again and again.',
        icon: '/icons/book.svg'
    },
    {
        title: 'Deluxe Princess Set',
        price: '$30',
        description: 'Let your little royal shine with an upgraded sparkling crown and a themed sash, perfect for a grand coronation and magical photo moments!',
        icon: '/icons/crown.svg'
    },
    {
        title: 'Gift Bags',
        price: '$10 per child',
        description: 'Send every guest home with a touch of fairy tale wonder! Each themed gift bag is filled with enchanting surprises and treasures—and now includes an upgrade to the Deluxe Princess Set!',
        icon: '/icons/giftBag.svg'
    },
]

export const publicEvents = [
    {
        primary: false,
        type: 'Public',
        title: 'Meet and Greet',
        time: '',
        activities: ['Magical Encounters', 'Smiles and Warm Hugs', 'Magical Photo Opportunity'],
        basePrice: 250,
        addCharacter: 150
    },
    {
        primary: false,
        type: 'Private',
        title: 'Story Time',
        time: '',
        activities: ['An Enchanting Story Time', 'Magical Encounters', 'Smiles and Warm Hugs', 'Magical Photo Opportunity'],
        basePrice: 250,
        addCharacter: 150
    },
]

export const publicExtras = [
    {
        title: 'Interactive Story Time',
        price: '$75',
        description: 'Step into the story with our interactive adventure! Children get to use special props to help act out the tale alongside our character, making story time an engaging, hands-on experience they’ll remember long after the day is over.',
        icon: '/icons/book.svg'
    },
    {
        title: 'Character Cards',
        price: '$10 per child',
        description: 'Take home a special memory from your magical day! Each child receives a dazzling character signature card, signed by their favorite storybook friend—a cherished keepsake to remember their enchanting encounter.',
        icon: '/icons/crown.svg'
    },
]

export const masonryPhotos = [
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4256.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4330.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4332.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4339.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4492.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4756.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5315.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5326.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5339.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5355.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5403.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5432.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5441.jpg'
    },
    {
        width: 600,
        height: 600,
        src: '/parties/IMG_5496.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5510.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_8918.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_8921.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_8932.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_8936.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5785.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5882.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5935.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5938.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_5949.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6079.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6001.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6169.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6192.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6201.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6245.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6321.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6369.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6386.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6393.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6398.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9282.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9358.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9374.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_9409.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_9450.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9666.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9727.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9739.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9807.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_0002.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_0041.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_0055.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9936.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9960.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9978.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_0220.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_1676.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1745.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1781.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1802.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1812.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1822.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6451.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6483.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6501.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6547.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6609.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6647.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6722.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_6865.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_7083.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_7143.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4654.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7496.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7565.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7612.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7624.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7751.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8027.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8057.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8088.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8091.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8202.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8225.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8233.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8247.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_8377.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8545.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8559.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4530.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_4544.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7757.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1046.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1076.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1106.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1125.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1210.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1295.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1662.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_1722.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_3529.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_3555.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_3980.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_6250.jpg'
    },
    {
        width: 600,
        height: 900,
        src: '/parties/IMG_6653.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7836.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_7870.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8021.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8613.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8630.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8659.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8662.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8665.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8682.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8683.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_8998.jpg'
    },
    {
        width: 900,
        height: 600,
        src: '/parties/IMG_9497.jpg'
    },
    
]
