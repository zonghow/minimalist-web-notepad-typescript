import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const NOTES_DIRECTORY = path.join(process.cwd(), "_tmp");
export const MAX_NOTE_LENGTH_BYTES = 256 * 1024;

export { isRawRequest, isValidNoteName } from "@/lib/note-name";

export class NoteTooLargeError extends Error {
  constructor() {
    super(`Note content exceeds ${MAX_NOTE_LENGTH_BYTES} bytes.`);
    this.name = "NoteTooLargeError";
  }
}

function assertNoteLengthWithinLimit(text: string): void {
  if (Buffer.byteLength(text, "utf8") > MAX_NOTE_LENGTH_BYTES) {
    throw new NoteTooLargeError();
  }
}

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
  assertNoteLengthWithinLimit(text);
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
