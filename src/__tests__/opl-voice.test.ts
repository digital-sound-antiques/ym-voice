import { OPLVoice } from "../opl-voice";

const bin = [0x13, 0x41, 0x1a, 0x00, 0xd8, 0xf7, 0x23, 0x13, 0x01, 0x02, 0x0f];
const obj = new OPLVoice({
  fb: 7,
  con: 1,
  slots: [
    { am: 0, pm: 0, eg: 0, ml: 3, kr: 1, kl: 0, tl: 26, ar: 13, dr: 8, sl: 2, rr: 3, ws: 1 }, // slot1 (M)
    { am: 0, pm: 1, eg: 0, ml: 1, kr: 0, kl: 0, tl: 0, ar: 15, dr: 7, sl: 1, rr: 3, ws: 2 }, // slot2 (C)
  ],
});

test("encode", () => {
  const e = obj.encode();
  expect(e).toEqual(bin);
});

test("decode", () => {
  const d = OPLVoice.decode(bin);
  expect(d).toEqual(obj);
});
