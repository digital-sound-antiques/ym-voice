import { OPMVoice } from "../opm-voice";

// prettier-ignore
const bin = [
0x73, 0x54, 0x45, 0x36, // DT1/ML
0x1A, 0x19, 0x00, 0x00, // TL
0x1F, 0x1F, 0x1F, 0x1F, // KS/AR
0x81, 0x82, 0x03, 0x04, // AM/DR
0x01, 0x42, 0x83, 0xc4, // DT2/SR
0x0F, 0x3e, 0x0d, 0x3c, // SL/RR
0x34,                   // FB/CON
0x00,                   // AMS/PMS
];

const obj = new OPMVoice({
  fb: 6,
  con: 4,
  ams: 0,
  pms: 0,
  slots: [
    { dt1: 7, ml: 3, tl: 26, ks: 0, ar: 31, am: 1, dr: 1, dt2: 0, sr: 1, sl: 0, rr: 15 }, // slot1 (M1)
    { dt1: 4, ml: 5, tl: 0, ks: 0, ar: 31, am: 0, dr: 3, dt2: 2, sr: 3, sl: 0, rr: 13 }, // slot2 (C1)
    { dt1: 5, ml: 4, tl: 25, ks: 0, ar: 31, am: 1, dr: 2, dt2: 1, sr: 2, sl: 3, rr: 14 }, // slot3 (M2)
    { dt1: 3, ml: 6, tl: 0, ks: 0, ar: 31, am: 0, dr: 4, dt2: 3, sr: 4, sl: 3, rr: 12 }, // slot4 (C2)
  ],
});

test("encode", () => {
  const e = obj.encode();
  expect(e).toEqual(bin);
});

test("decode", () => {
  const d = OPMVoice.decode(bin);
  expect(d).toEqual(obj);
});
