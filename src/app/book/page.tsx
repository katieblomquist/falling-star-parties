import type { Metadata } from "next";
import BookClient from "./BookClient";

export const metadata: Metadata = {
  title: "Book a Party",
  description:
    "Book a princess character experience with Falling Star Parties. Fill out our simple form to request your date and bring fairy tale magic to your event in Maryland.",
  alternates: {
    canonical: "https://fallingstarparties.com/book",
  },
  openGraph: {
    title: "Book a Party",
    description:
      "Book a princess character experience with Falling Star Parties. Fill out our simple form to request your date in Maryland.",
    url: "https://fallingstarparties.com/book",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Book a princess party with Falling Star Parties in Maryland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default function BookPage() {
  return <BookClient />;
}
