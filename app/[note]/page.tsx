import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Notepad } from "@/components/notepad";
import { generateRandomNoteName, isValidNoteName } from "@/lib/note-name";
import { readNote } from "@/lib/note";

type NotePageProps = {
  params: Promise<{
    note: string;
  }>;
};

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { note } = await params;

  return {
    title: note,
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { note } = await params;

  if (!isValidNoteName(note)) {
    redirect(`/${generateRandomNoteName()}`);
  }

  const initialContent = (await readNote(note)) ?? "";

  return <Notepad initialContent={initialContent} note={note} />;
}
