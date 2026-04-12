import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Explore our princess party packages for private parties and public events throughout Maryland. See pricing, activities, and add-ons available for your celebration.",
  alternates: {
    canonical: "https://fallingstarparties.com/services",
  },
  openGraph: {
    title: "Services & Pricing",
    description:
      "Explore our princess party packages for private parties and public events throughout Maryland. See pricing, activities, and add-ons.",
    url: "https://fallingstarparties.com/services",
    images: [
      {
        url: "/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "Falling Star Parties services and pricing — princess party packages in Maryland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-services.jpg"],
  },
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Falling Star Parties — Princess Party Packages",
  description:
    "Princess character entertainment packages for private birthday parties, public events, and charity events throughout Maryland.",
  url: "https://fallingstarparties.com/services",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Dream Package",
        description:
          "30-minute private birthday party experience. Includes Story Time, Coronation Ceremony, Photo Opportunity, and Birthday Song. Base price covers one character; additional characters available for $100 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "200",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Sparkle Package",
        description:
          "60-minute private birthday party experience. Includes Story Time, Coronation Ceremony, Party Games, Photo Opportunity, and Birthday Song. Base price covers one character; additional characters available for $150 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "275",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Shine Package",
        description:
          "90-minute private birthday party experience. Includes Story Time, Coronation Ceremony, Party Games, Face Painting, Photo Opportunity, and Birthday Song. Base price covers one character; additional characters available for $200 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "350",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "Public Event — One Hour Meet and Greet",
        description:
          "60-minute princess character appearance for public events, festivals, school events, and corporate functions. Base price covers one character; additional characters available for $150 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "250",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Service",
        name: "Public Event — Two Hour Meet and Greet",
        description:
          "120-minute princess character appearance for public events, festivals, school events, and corporate functions. Base price covers one character; additional characters available for $300 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "400",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 6,
      item: {
        "@type": "Service",
        name: "Charity Event — One Hour Meet and Greet",
        description:
          "60-minute princess character appearance for charity and nonprofit events. Base price covers one character; additional characters available for $75 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "175",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 7,
      item: {
        "@type": "Service",
        name: "Charity Event — Two Hour Meet and Greet",
        description:
          "120-minute princess character appearance for charity and nonprofit events. Base price covers one character; additional characters available for $150 each.",
        provider: { "@type": "Organization", name: "Falling Star Parties" },
        areaServed: { "@type": "State", name: "Maryland" },
        offers: {
          "@type": "Offer",
          price: "250",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://fallingstarparties.com/book",
        },
      },
    },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <ServicesClient />
    </>
  );
}
