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
  },
};

export default function BookPage() {
  return <BookClient />;
}
