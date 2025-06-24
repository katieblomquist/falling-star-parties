import { ReactNode } from "react";
type Faq = { question: string, answer: string }
type Tab = {label: string, content: ReactNode}
export type TabArray = Array<Tab>
export type FaqArray = Array<Faq>

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
        answer: "We suggest booking 4-6 weeks in advance. However, always try to accommodate any request we receive, so don't hesitate to ask!"
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
]

export const characterPage = [
    {
        titleStart: "Meet our ",
        emphasis: "Enchanted",
        titleEnd: " Characters",
        blurb: "Here you'll find a royal court filled with the most enchanting princesses. From the graceful twirls of our Glass Slipper Princess to the adventurous spirit of our Mermaid Princess, each of our characters brings their own special charm and sparkle to every celebration. Explore their captivating stories, delightful personalities, and the magical moments they bring to life! With a sprinkle of fairy dust and a touch of whimsy, let us help you create an enchanting experience that your little ones will treasure forever!",
        button: "BOOK NOW",
        variant: 1,
        href: "/book",
        images: ["/bubbles/characters/IMG_7324.jpg", "/bubbles/characters/IMG_2519.jpg", "/bubbles/characters/DSC_0752.jpg"]

    },
]

export const servicesPage =[
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
        listItems: ['60 Minutes with 1 Magical Character', 'A Story Time filled with live singing!', 'Princess Lessons straight from the enchanted kingdom', 'The Grandeur of a Royal Coronation Ceremony, complete with a shimmering crystal tiara to cherish!', 'Games and activities led by your character', 'Commemorate the occasion with an enchanting photo opportunity', 'Finish the fairy tale with a Happy Birthday Song!'],
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
