export abstract class YMVoice {
  abstract encode(): Array<number>;
  constructor(public __type: string) {}
  toHash(): string {
    return this.encode()
      .map((e) => ("0" + e.toString(16)).slice(-2))
      .join("");
  }
  abstract toMML(type?: string | null): string;
  abstract toFile(type?: string | null, parameters?: { [key: string]: unknown }): string | Uint8Array;
}
