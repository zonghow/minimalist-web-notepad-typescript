import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRawRequest, isValidNoteName } from "@/lib/note-name";

const NOTES_DIRECTORY = path.join(process.cwd(), "_tmp");

export { isRawRequest, isValidNoteName } from "@/lib/note-name";

export function getNotePath(note: string): string {
  return path.join(NOTES_DIRECTORY, note);
}

export async function readNote(note: string): Promise<string | null> {
  try {
    return await readFile(getNotePath(note), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function writeNote(note: string, text: string): Promise<void> {
  await mkdir(NOTES_DIRECTORY, { recursive: true });
  await writeFile(getNotePath(note), text, "utf8");
}

export async function deleteNote(note: string): Promise<void> {
  try {
    await unlink(getNotePath(note));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
