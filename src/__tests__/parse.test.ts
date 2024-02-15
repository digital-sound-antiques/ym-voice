import { parseOPM } from "../parse";

describe("parseOPM", () => {
  test("parses single-voice OPM", () => {
    const opmFile = `
//VOPM tone data
//Ripped by vgm-conv
@:0 CH0,1,2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   3   4   1   2  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  18   1   2   6   4  35   1   2   6   0   0
C1:  19   0   0   6   0   0   0   2   5   0   0
M2:  17   0   0   6   0  35   0   2   1   0   0
C2:  16   0   0   6   0   0   0   2   0   0   0
`;
    const parsed = parseOPM(opmFile).voices[0];
    // check channel-level parameters
    expect(parsed.fb).toEqual(3);
    expect(parsed.con).toEqual(4);
    expect(parsed.ams).toEqual(1);
    expect(parsed.pms).toEqual(2);

    // check all parameters of slot 0
    expect(parsed.slots[0].ar).toEqual(18);
    expect(parsed.slots[0].dr).toEqual(1);
    expect(parsed.slots[0].sr).toEqual(2);
    expect(parsed.slots[0].rr).toEqual(6);
    expect(parsed.slots[0].sl).toEqual(4);
    expect(parsed.slots[0].tl).toEqual(35);
    expect(parsed.slots[0].ks).toEqual(1);
    expect(parsed.slots[0].ml).toEqual(2);
    expect(parsed.slots[0].dt1).toEqual(6);
    expect(parsed.slots[0].dt2).toEqual(0);

    // check first parameter of slots 1-3
    expect(parsed.slots[1].ar).toEqual(19);
    expect(parsed.slots[2].ar).toEqual(17);
    expect(parsed.slots[3].ar).toEqual(16);
  });

  test("adheres to voice number", () => {
    const opmFile = `
//VOPM tone data
//Ripped by vgm-conv
@:3 CH0,1,2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   1   2  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  18   1   2   6   4  35   1   2   6   0   0
C1:  19   0   0   6   0   0   0   2   5   0   0
M2:  17   0   0   6   0  35   0   2   1   0   0
C2:  16   0   0   6   0   0   0   2   0   0   0
`;
    const parsed = parseOPM(opmFile).voices[3];
    expect(parsed).not.toBeUndefined();
    expect(parsed.fb).toEqual(7);
  });

  test("handles multiple voices", () => {
    const opmFile = `
//VOPM tone data
//Ripped by vgm-conv
@:0 CH0,1,2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   1   2  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  18   1   2   6   4  35   1   2   6   0   0
C1:  19   0   0   6   0   0   0   2   5   0   0
M2:  17   0   0   6   0  35   0   2   1   0   0
C2:  16   0   0   6   0   0   0   2   0   0   0
@:1 CH2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   0   0  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  31   2   2   0   0  33   2   2   6   0   0
C1:  22   2   3   4   0   0   1   2   5   0   0
M2:  31   2   2   0   0  13   1   1   2   0   0
C2:  22   2   3   4   0   0   1   2   1   0   0
`;
    const parsed = parseOPM(opmFile);
    const voice0 = parsed.voices[0];
    const voice1 = parsed.voices[1];
    expect(voice0).not.toBeUndefined();
    expect(voice1).not.toBeUndefined();
    expect(voice0.slots[0].ar).toEqual(18);
    expect(voice1.slots[0].ar).toEqual(31);
  });

  test("ignores malformed OPM voices", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const opmFile = `
//VOPM tone data
//Ripped by vgm-conv
@:0 CH0,1,2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   0   0  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  31   2   2   0   0  33   2   2   6   0   0
C1:  22   2   3   4   0   0   1   2   5   0   0
M2:  31   2   2   0   0  13   1   1
C2:  22   2   3   4   0   0   1   2   1   0   0
@:1 CH0,1,2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0    0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   0   0  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  31   2   2   0   0  33   2   2   6   0   0
C1:  22   2   3   4   0   0   1   2   5   0   0
M2:  31   2   2   0   0  13   1   1   5   0   0
@:2 CH0,1
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   0   0  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  31   0   8   0   0  32   3   1   2   0   0
C1:  25   7   7   7   0   0   2   1   4   0   0
M2:  31   0   8   0   0  28   3   3   5   0   0
C2:  25   8   6   7   0   0   2   1   1   0   0
`;
    const parsed = parseOPM(opmFile);
    const voice0 = parsed.voices[0];
    const voice1 = parsed.voices[1];
    const voice2 = parsed.voices[2];
    expect(voice0).toBeUndefined();
    expect(voice1).toBeUndefined();
    expect(voice2).not.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });

  test("collects comments", () => {
    const opmFile = `
//VOPM tone data
//Ripped by vgm-conv
@:0 CH0,1,2
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   1   2  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  18   1   2   6   4  35   1   2   6   0   0
C1:  19   0   0   6   0   0   0   2   5   0   0
M2:  17   0   0   6   0  35   0   2   1   0   0
C2:  16   0   0   6   0   0   0   2   0   0   0
// voice 0 comment
@:1 CH2
// voice 1 comment
//  LFRQ AMD PMD  WF NFRQ
LFO:   0   0   0   0   0
//  PAN  FL CON AMS PMS SLOT  NE
CH:  64   7   4   0   0  15   0
//   AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN
M1:  31   2   2   0   0  33   2   2   6   0   0
C1:  22   2   3   4   0   0   1   2   5   0   0
M2:  31   2   2   0   0  13   1   1   2   0   0
C2:  22   2   3   4   0   0   1   2   1   0   0
`;
    const parsed = parseOPM(opmFile);
    const voice0comments = parsed.comments[0];
    const voice1comments = parsed.comments[1];

    expect(voice0comments).toContain("// voice 0 comment");
    expect(voice0comments).not.toContain("// voice 1 comment");

    expect(voice1comments).toContain("// voice 1 comment");
    expect(voice1comments).not.toContain("// voice 0 comment");
  });
});
