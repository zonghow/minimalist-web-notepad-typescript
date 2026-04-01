import assert from "node:assert/strict";
import test from "node:test";
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
