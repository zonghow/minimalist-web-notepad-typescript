import { redirect } from "next/navigation";
import { generateRandomNoteName } from "@/lib/note-name";

export default function HomePage() {
  redirect(`/${generateRandomNoteName()}`);
}
