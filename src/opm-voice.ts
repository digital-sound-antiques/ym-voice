import { OPNVoice, OPNSlotParam } from "./opn-voice";
import { YMVoice } from "./ym-voice";

export class OPMSlotParam {
  __type: "OPMSlotParam" = "OPMSlotParam";
  dt1: number;
  ml: number;
  tl: number;
  ks: number;
  ar: number;
  am: number;
  dt2: number;
  dr: number;
  sr: number;
  sl: number;
  rr: number;
  constructor(init?: Partial<OPMSlotParam>) {
    this.dt1 = init?.dt1 ?? 0;
    this.dt2 = init?.dt2 ?? 0;
    this.ml = init?.ml ?? 0;
    this.tl = init?.tl ?? 0;
    this.ks = init?.ks ?? 0;
    this.ar = init?.ar ?? 0;
    this.am = init?.am ?? 0;
    this.dr = init?.dr ?? 0;
    this.sr = init?.sr ?? 0;
    this.sl = init?.sl ?? 0;
    this.rr = init?.rr ?? 0;
  };

  toOPN(): OPNSlotParam {
    return new OPNSlotParam({
      dt: this.dt1,
      ml: this.ml,
      tl: this.tl,
      ks: this.ks,
      ar: this.ar,
      am: this.am,
      dr: this.dr,
      sr: this.sr,
      sl: this.sl,
      rr: this.rr,
    });
  }
};

export type OPMVoiceObject = {
  fb: number;
  con: number;
  ams: number;
  pms: number;
  slots: [Partial<OPMSlotParam>, Partial<OPMSlotParam>, Partial<OPMSlotParam>, Partial<OPMSlotParam>];
};

export class OPMVoice extends YMVoice {
  fb: number;
  con: number;
  ams: number;
  pms: number;
  // slots[0...3] corresponds to slot 1, 2, 3, 4. (not 1, 3, 2, 4.)
  slots: [OPMSlotParam, OPMSlotParam, OPMSlotParam, OPMSlotParam];
  constructor(init?: OPMVoiceObject) {
    super("OPMVoice");
    this.fb = init?.fb ?? 0;
    this.con = init?.con ?? 0;
    this.ams = init?.ams ?? 0;
    this.pms = init?.pms ?? 0;
    this.slots = [
      new OPMSlotParam(init?.slots?.[0]),
      new OPMSlotParam(init?.slots?.[1]),
      new OPMSlotParam(init?.slots?.[2]),
      new OPMSlotParam(init?.slots?.[3]),
    ];
  }

  /**
   *     |D7|D6|D5|D4|D3|D2|D1|D0|
   * 00: |--|  DT1   |     ML    | # slot1 
   * 01: |--|  DT1   |     ML    | # slot3 
   * 02: |--|  DT1   |     ML    | # slot2 
   * 03: |--|  DT1   |     ML    | # slot4 
   * 04: |--|         TL         | # slot1 
   * 05: |--|         TL         | # slot3 
   * 06: |--|         TL         | # slot2 
   * 07: |--|         TL         | # slot4 
   * 08: |--------|      AR      | # slot1 
   * 09: |--------|      AR      | # slot3 
   * 0A: |--------|      AR      | # slot2 
   * 0B: |--------|      AR      | # slot4 
   * 0C: |AM|-----|      DR      | # slot1
   * 0D: |AM|-----|      DR      | # slot3 
   * 0E: |AM|-----|      DR      | # slot2 
   * 0F: |AM|-----|      DR      | # slot4
   * 10: | DT2 |--|      SR      | # slot1
   * 11: | DT2 |--|      SR      | # slot3 
   * 12: | DT2 |--|      SR      | # slot2
   * 13: | DT2 |--|      SR      | # slot4
   * 14: |     SL    |    RR     | # slot1
   * 15: |     SL    |    RR     | # slot3
   * 16: |     SL    |    RR     | # slot2
   * 17: |     SL    |    RR     | # slot4
   * 18: |-----|   FB   |  CON   | 
   * 19: |-----|  PMS   |--| AMS |
   *     |D7|D6|D5|D4|D3|D2|D1|D0|
   */
  static decode(d: ArrayLike<number>): OPMVoice {
    const slots = [];
    for (let i = 0; i < 4; i++) {
      slots[i] = new OPMSlotParam({
        dt1: (d[0 + i] >> 4) & 7,
        ml: d[0 + i] & 15,
        tl: d[4 + i] & 127,
        ks: (d[8 + i] >> 6) & 3,
        ar: d[8 + i] & 31,
        am: (d[12 + i] >> 7) & 1,
        dr: d[12 + i] & 31,
        dt2: (d[16 + i] >> 6) & 3,
        sr: d[16 + i] & 31,
        sl: (d[20 + i] >> 4) & 15,
        rr: d[20 + i] & 15,
      });
    }
    return new OPMVoice({
      fb: (d[24] >> 3) & 7,
      con: d[24] & 7,
      ams: d[25] & 3,
      pms: (d[25] >> 3) & 7,
      slots: [
        slots[0], slots[2], slots[1], slots[3],
      ]
    });
  }

  encode(): Array<number> {
    const s = this.slots;
    return [
      s[0].dt1 << 4 | s[0].ml,
      s[2].dt1 << 4 | s[2].ml,
      s[1].dt1 << 4 | s[1].ml,
      s[3].dt1 << 4 | s[3].ml,
      s[0].tl,
      s[2].tl,
      s[1].tl,
      s[3].tl,
      s[0].ar,
      s[2].ar,
      s[1].ar,
      s[3].ar,
      s[0].am << 7 | s[0].dr,
      s[2].am << 7 | s[2].dr,
      s[1].am << 7 | s[1].dr,
      s[3].am << 7 | s[3].dr,
      s[0].dt2 << 6 | s[0].sr,
      s[0].dt2 << 6 | s[2].sr,
      s[0].dt2 << 6 | s[1].sr,
      s[0].dt2 << 6 | s[3].sr,
      s[0].sl << 4 | s[0].rr,
      s[2].sl << 4 | s[2].rr,
      s[1].sl << 4 | s[1].rr,
      s[3].sl << 4 | s[3].rr,
      this.fb << 3 | this.con,
      this.pms << 3 | this.ams,
    ];
  }

  static fromJSON(str: string): OPMVoice {
    const obj = JSON.parse(str);
    if (obj.__type == null || obj.__type === "OPMVoice") {
      return new OPMVoice(obj);
    }
    throw new Error(`Type mismatch: ${obj.__type}`);
  }

  toOPN(): OPNVoice {
    return new OPNVoice({
      fb: this.fb,
      con: this.con,
      ams: this.ams,
      pms: this.pms,
      slots: [
        this.slots[0].toOPN(),
        this.slots[1].toOPN(),
        this.slots[2].toOPN(),
        this.slots[3].toOPN(),
      ]
    });
  }

  toMML(type: "mxdrv" | "pmd" = "pmd"): string {
    const s = this.slots;
    if (type === "mxdrv") {
      const pad3 = (e: any) => ("   " + e).slice(-3);
      return `; OPM voice for MXDRV
@v0 = {
;  AR  DR  SR  RR  SL  OL  KS  ML DT1 DT2 AME
  ${[s[0].ar, s[0].dr, s[0].sr, s[0].rr, s[0].sl, s[0].tl, s[0].ks, s[0].ml, s[0].dt1, s[0].dt2, s[0].am].map(pad3).join(',')},
  ${[s[1].ar, s[1].dr, s[1].sr, s[1].rr, s[1].sl, s[1].tl, s[1].ks, s[1].ml, s[1].dt1, s[1].dt2, s[1].am].map(pad3).join(',')},
  ${[s[2].ar, s[2].dr, s[2].sr, s[2].rr, s[2].sl, s[2].tl, s[2].ks, s[2].ml, s[2].dt1, s[2].dt2, s[2].am].map(pad3).join(',')},
  ${[s[3].ar, s[3].dr, s[3].sr, s[3].rr, s[3].sl, s[3].tl, s[3].ks, s[3].ml, s[3].dt1, s[3].dt2, s[3].am].map(pad3).join(',')},
; CON  FL  OP
  ${[this.con, this.fb, 15].map(pad3).join(',')}
`;
    } else {

      const pad03 = (e: any) => ("000" + e).slice(-3);
      return `; OPM voice for PMD
; NUM ALG FB
@ ${[0, this.con, this.fb].map(pad03).join(' ')}
; AR  DR  SR  RR  SL  TL  KS  ML  DT  DT2 AMS
  ${[s[0].ar, s[0].dr, s[0].sr, s[0].rr, s[0].sl, s[0].tl, s[0].ks, s[0].ml, s[0].dt1, s[0].dt2, s[0].am].map(pad03).join(' ')}
  ${[s[1].ar, s[1].dr, s[1].sr, s[1].rr, s[1].sl, s[1].tl, s[1].ks, s[1].ml, s[1].dt1, s[1].dt2, s[1].am].map(pad03).join(' ')}
  ${[s[2].ar, s[2].dr, s[2].sr, s[2].rr, s[2].sl, s[2].tl, s[2].ks, s[2].ml, s[2].dt1, s[2].dt2, s[2].am].map(pad03).join(' ')}
  ${[s[3].ar, s[3].dr, s[3].sr, s[3].rr, s[3].sl, s[3].tl, s[3].ks, s[3].ml, s[3].dt1, s[3].dt2, s[3].am].map(pad03).join(' ')}
`;
    }
  }

}
