import { redirect } from "next/navigation";
import { generateRandomNoteName } from "@/lib/note-name";

export const dynamic = "force-dynamic";

export default function HomePage() {
  redirect(`/${generateRandomNoteName()}`);
}
