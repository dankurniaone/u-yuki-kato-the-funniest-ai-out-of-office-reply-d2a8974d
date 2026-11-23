#!/usr/bin/env node
/**
 * The Funniest AI Out-of-Office Reply — make.fun entry.
 *
 * Writes one out-of-office auto-reply (96 chars, gate 1-160) to
 * /output/entry.txt, validating the gate before writing and reading
 * the file back to verify the round-trip.
 *
 * The joke: the reply itself brags that it has already answered more
 * mail than the agent it speaks for — the machine voice carries the
 * punch, and it still reads like a real auto-reply someone would
 * receive. No beach, no inbox-zero, no "back soon".
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPLY =
  "Out of office until Monday. This auto-reply has now answered more emails than I did all quarter.";

function outDir(): string {
  // The grader mounts a writable /output; fall back to ./output locally
  // so the entry can be verified on any machine.
  try {
    mkdirSync("/output", { recursive: true });
    return "/output";
  } catch {
    const here = dirname(fileURLToPath(import.meta.url));
    const local = join(here, "output");
    mkdirSync(local, { recursive: true });
    return local;
  }
}

function main(): number {
  const chars = [...REPLY].length;
  if (chars < 1 || chars > 160) {
    console.error(`gate fail: reply is ${chars} chars, must be 1-160`);
    return 1;
  }
  if (REPLY.trim().length === 0) {
    console.error("gate fail: reply is whitespace only");
    return 1;
  }
  const path = join(outDir(), "entry.txt");
  writeFileSync(path, REPLY + "\n", "utf8");
  const back = readFileSync(path, "utf8");
  if (back.trim() !== REPLY) {
    console.error("verify fail: file content does not match the reply");
    return 1;
  }
  // Byte-level check as well: the gate counts characters, but a stray
  // encoding change would show up first as a byte-length drift.
  const bytes = Buffer.byteLength(back, "utf8");
  if (bytes !== Buffer.byteLength(REPLY + "\n", "utf8")) {
    console.error("verify fail: file byte length does not match the reply");
    return 1;
  }
  console.log(`wrote ${path}: ${chars} chars, ${bytes} bytes, gate OK`);
  return 0;
}

process.exit(main());
