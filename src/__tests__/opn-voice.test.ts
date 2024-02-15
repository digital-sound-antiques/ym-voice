import { OPNVoice } from "../opn-voice";

// prettier-ignore
const bin = [
0x73, 0x54, 0x73, 0x54, // DT/ML
0x1A, 0x19, 0x00, 0x00, // TL
0x1F, 0x1F, 0x1F, 0x1F, // KS/AR
0x80, 0x80, 0x80, 0x80, // AM/DR
0x00, 0x00, 0x01, 0x01, // SR
0x0F, 0x0e, 0x3d, 0x3c, // SL/RR
0x01, 0x02, 0x03, 0x04, // SSG-EG
0x34,                   // FB/AL
0x00,                   // AMS/PMS
];

const obj = new OPNVoice({
  fb: 6,
  con: 4,
  ams: 0,
  pms: 0,
  slots: [
    { dt: 7, ml: 3, tl: 26, ks: 0, ar: 31, am: 1, dr: 0, sr: 0, sl: 0, rr: 15, ssg: 1 }, // slot1 (M1)
    { dt: 7, ml: 3, tl: 0, ks: 0, ar: 31, am: 1, dr: 0, sr: 1, sl: 3, rr: 13, ssg: 3 }, // slot2 (C1)
    { dt: 5, ml: 4, tl: 25, ks: 0, ar: 31, am: 1, dr: 0, sr: 0, sl: 0, rr: 14, ssg: 2 }, // slot3 (M2)
    { dt: 5, ml: 4, tl: 0, ks: 0, ar: 31, am: 1, dr: 0, sr: 1, sl: 3, rr: 12, ssg: 4 }, // slot4 (C2)
  ],
});

test("encode", () => {
  const e = obj.encode();
  expect(e).toEqual(bin);
});

test("decode", () => {
  const d = OPNVoice.decode(bin);
  expect(d).toEqual(obj);
});
