import type { Metadata } from "next";
import "./globals.css";
import { dhyana } from "./fonts";
import "reflect-metadata"

const SITE_URL = "https://fallingstarparties.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Falling Star Parties",
    template: "%s | Falling Star Parties",
  },
  description:
    "Falling Star Parties brings fairy tale magic to life in Maryland. Book a princess character experience for birthdays, corporate events, and special celebrations.",
  keywords: [
    "princess party Maryland",
    "character party Maryland",
    "Elsa party",
    "Ariel party",
    "Belle party",
    "Cinderella party",
    "Rapunzel party",
    "Aurora party",
    "Snow White party",
    "princess birthday party",
    "fairy tale party",
    "children's entertainment Maryland",
  ],
  openGraph: {
    type: "website",
    siteName: "Falling Star Parties",
    title: "Falling Star Parties",
    description:
      "Falling Star Parties brings fairy tale magic to life in Maryland. Book a princess character experience for birthdays, corporate events, and special celebrations.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 2048,
        height: 1365,
        alt: "Falling Star Parties — princess character entertainment in Maryland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Falling Star Parties",
    description:
      "Falling Star Parties brings fairy tale magic to life in Maryland. Book a princess character experience for birthdays, corporate events, and special celebrations.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EntertainmentBusiness",
  name: "Falling Star Parties",
  url: SITE_URL,
  description:
    "Princess character entertainment for birthdays, corporate events, and special celebrations throughout Maryland. Featuring Elsa, Ariel, Belle, Cinderella, Rapunzel, Aurora, Snow White, and more.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Middle River",
    addressRegion: "MD",
    postalCode: "21220",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 39.3326,
      longitude: -76.4516,
    },
    geoRadius: "80467",
  },
  priceRange: "$175–$400",
  serviceType: [
    "Princess Party Entertainment",
    "Character Appearances",
    "Birthday Party Entertainment",
    "Corporate Event Entertainment",
    "Charity Event Entertainment",
    "Public Event Entertainment",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Princess Party Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Dream Package",
          description:
            "30-minute private birthday party experience including Story Time, Coronation Ceremony, Photo Opportunity, and Birthday Song.",
        },
        price: "200",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Sparkle Package",
          description:
            "60-minute private birthday party experience including Story Time, Coronation Ceremony, Party Games, Photo Opportunity, and Birthday Song.",
        },
        price: "275",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Shine Package",
          description:
            "90-minute private birthday party experience including Story Time, Coronation Ceremony, Party Games, Face Painting, Photo Opportunity, and Birthday Song.",
        },
        price: "350",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "One Hour Meet and Greet",
          description:
            "60-minute public or charity event appearance with princess character meet and greet.",
        },
        price: "250",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Two Hour Meet and Greet",
          description:
            "120-minute public or charity event appearance with princess character meet and greet.",
        },
        price: "400",
        priceCurrency: "USD",
      },
    ],
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dhyana.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
