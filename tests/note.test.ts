import assert from "node:assert/strict";
import test from "node:test";
import { deleteNote, MAX_NOTE_LENGTH_BYTES, NoteTooLargeError, readNote, writeNote } from "../lib/note";
import {
  generateRandomNoteName,
  isRawRequest,
  isValidNoteName,
  MAX_NOTE_NAME_LENGTH,
  RANDOM_NOTE_LENGTH,
  RANDOM_NOTE_CHARACTERS,
} from "../lib/note-name";

test("accepts valid note names", () => {
  assert.equal(isValidNoteName("abc-DEF_123"), true);
});

test("rejects invalid note names", () => {
  assert.equal(isValidNoteName(""), false);
  assert.equal(isValidNoteName("bad/name"), false);
  assert.equal(isValidNoteName("a".repeat(MAX_NOTE_NAME_LENGTH + 1)), false);
});

test("generates a five character unambiguous note name", () => {
  const note = generateRandomNoteName();

  assert.equal(note.length, RANDOM_NOTE_LENGTH);
  assert.match(note, new RegExp(`^[${RANDOM_NOTE_CHARACTERS}]{${RANDOM_NOTE_LENGTH}}$`));
});

test("detects raw requests from query or user agent", () => {
  assert.equal(isRawRequest(new URLSearchParams(), "curl/8.0.1"), true);
  assert.equal(isRawRequest(new URLSearchParams(), "Wget/1.0"), true);
  assert.equal(isRawRequest(new URLSearchParams("raw=1"), "Mozilla/5.0"), true);
  assert.equal(isRawRequest(new URLSearchParams(), "Mozilla/5.0"), false);
});

test("writes note content up to the UTF-8 byte limit", async (t) => {
  const note = `limit-${Date.now()}`;
  const text = "中".repeat(Math.floor(MAX_NOTE_LENGTH_BYTES / Buffer.byteLength("中", "utf8")));

  t.after(async () => {
    await deleteNote(note);
  });

  await writeNote(note, text);
  assert.equal(await readNote(note), text);
});

test("rejects note content over the UTF-8 byte limit", async () => {
  const note = `too-large-${Date.now()}`;
  const text = "中".repeat(Math.floor(MAX_NOTE_LENGTH_BYTES / Buffer.byteLength("中", "utf8")) + 1);

  await assert.rejects(writeNote(note, text), NoteTooLargeError);
  assert.equal(await readNote(note), null);
});
