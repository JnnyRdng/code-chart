import { Char } from "./Char";

export class Buffer {
  #buf: string;

  constructor() {
    this.#buf = '';
  }

  push(c: Char): void {
    this.#buf += c.toString();
  }

  clear(): void {
    this.#buf = '';
  }

  toString(): string {
    return this.#buf;
  }

  equals(value: string): boolean {
    return this.#buf === value;
  }

  hasContents(): boolean {
    return this.length() > 0;
  }

  length(): number {
    return this.#buf.length;
  }
}
