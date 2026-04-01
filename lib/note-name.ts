export const NOTE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const RANDOM_NOTE_CHARACTERS = "234579abcdefghjkmnpqrstwxyz";
export const RANDOM_NOTE_LENGTH = 5;
export const MAX_NOTE_NAME_LENGTH = 64;

export function isValidNoteName(note: string): boolean {
  return note.length > 0 && note.length <= MAX_NOTE_NAME_LENGTH && NOTE_NAME_PATTERN.test(note);
}

export function generateRandomNoteName(): string {
  let result = "";

  for (let index = 0; index < RANDOM_NOTE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * RANDOM_NOTE_CHARACTERS.length);
    result += RANDOM_NOTE_CHARACTERS[randomIndex];
  }

  return result;
}

export function isRawRequest(searchParams: URLSearchParams, userAgent: string | null): boolean {
  return searchParams.has("raw") || userAgent?.startsWith("curl") === true || userAgent?.startsWith("Wget") === true;
}
