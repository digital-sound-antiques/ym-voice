import { OPMSlotParam, OPMVoice } from "./opm-voice";
import { OPLSlotParam, OPLVoice } from "./opl-voice";
import { YMVoice } from "./ym-voice";

const pad3 = (e: any) => ("   " + e).slice(-3);
export class OPNSlotParam {
  __type: "OPNSlotParam" = "OPNSlotParam";
  dt: number;
  ml: number;
  tl: number;
  ks: number;
  ar: number;
  am: number;
  dr: number;
  sr: number;
  sl: number;
  rr: number;
  ssg: number;
  constructor(init?: Partial<OPNSlotParam>) {
    this.dt = init?.dt ?? 0;
    this.ml = init?.ml ?? 0;
    this.tl = init?.tl ?? 0;
    this.ks = init?.ks ?? 0;
    this.ar = init?.ar ?? 0;
    this.am = init?.am ?? 0;
    this.dr = init?.dr ?? 0;
    this.sr = init?.sr ?? 0;
    this.sl = init?.sl ?? 0;
    this.rr = init?.rr ?? 0;
    this.ssg = init?.ssg ?? 0;
  };

  toOPL(key: boolean): OPLSlotParam {
    function _AR(a: number) {
      switch (a) {
        case 31:
          return 15;
        case 0:
          return 0;
        default:
          return Math.max(1, Math.min(15, (a * 28) >> 6));
      }
    }
    function _DR(a: number) {
      switch (a) {
        case 31:
          return 15;
        case 0:
          return 0;
        default:
          return Math.max(1, Math.min(15, (a * 28) >> 6));
      }
    }
    function _RR(a: number) {
      return a == 0 ? 1 : a;
    }
    return new OPLSlotParam({
      am: this.am,
      pm: 0,
      eg: key ? 0 : 1,
      kr: this.ks >> 1,
      ml: this.ml,
      kl: 0,
      tl: Math.min(63, this.tl),
      ar: _AR(this.ar),
      dr: _DR(this.dr),
      sl: this.sl,
      rr: key ? _DR(this.sr) : _RR(this.rr),
      ws: 0
    });
  }


  toOPM(): OPMSlotParam {
    return new OPMSlotParam({
      dt1: this.dt,
      ml: this.ml,
      tl: this.tl,
      ks: this.ks,
      ar: this.ar,
      am: this.am,
      dr: this.dr,
      sr: this.sr,
      rr: this.rr,
    });
  }
};

export type OPNVoiceObject = {
  fb: number;
  con: number;
  ams: number;
  pms: number;
  slots: [Partial<OPNSlotParam>, Partial<OPNSlotParam>, Partial<OPNSlotParam>, Partial<OPNSlotParam>];
};

export class OPNVoice extends YMVoice {
  fb: number;
  con: number;
  ams: number;
  pms: number;
  // slots[0...3] corresponds to slot 1, 2, 3, 4. (not 1, 3, 2, 4.)
  slots: [OPNSlotParam, OPNSlotParam, OPNSlotParam, OPNSlotParam];
  constructor(init?: OPNVoiceObject) {
    super("OPNVoice");
    this.fb = init?.fb ?? 0;
    this.con = init?.con ?? 0;
    this.ams = init?.ams ?? 0;
    this.pms = init?.pms ?? 0;
    this.slots = [
      new OPNSlotParam(init?.slots?.[0]),
      new OPNSlotParam(init?.slots?.[1]),
      new OPNSlotParam(init?.slots?.[2]),
      new OPNSlotParam(init?.slots?.[3]),
    ];
  }

  /**
   *     |D7|D6|D5|D4|D3|D2|D1|D0|
   * 00: |--|   DT   |     ML    | # slot1 
   * 01: |--|   DT   |     ML    | # slot3 
   * 02: |--|   DT   |     ML    | # slot2 
   * 03: |--|   DT   |     ML    | # slot4 
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
   * 10: |--------|      SR      | # slot1
   * 11: |--------|      SR      | # slot3 
   * 12: |--------|      SR      | # slot2
   * 13: |--------|      SR      | # slot4
   * 14: |     SL    |    RR     | # slot1
   * 15: |     SL    |    RR     | # slot3
   * 16: |     SL    |    RR     | # slot2
   * 17: |     SL    |    RR     | # slot4
   * 18: |-----------|   SSG-EG  | # slot1
   * 19: |-----------|   SSG-EG  | # slot3
   * 1A: |-----------|   SSG-EG  | # slot2
   * 1B: |-----------|   SSG-EG  | # slot4
   * 1C: |-----|   FB   |  CON   | 
   * 1D: |--|--| AMS |--|  PMS   | 
   *     |D7|D6|D5|D4|D3|D2|D1|D0|
   */
  static decode(d: ArrayLike<number>): OPNVoice {
    const slots = [];
    for (let i = 0; i < 4; i++) {
      slots[i] = new OPNSlotParam({
        dt: (d[0 + i] >> 4) & 7,
        ml: d[0 + i] & 15,
        tl: d[4 + i] & 127,
        ks: (d[8 + i] >> 6) & 3,
        ar: d[8 + i] & 31,
        am: (d[12 + i] >> 7) & 1,
        dr: d[12 + i] & 31,
        sr: d[16 + i] & 31,
        sl: (d[20 + i] >> 4) & 15,
        rr: d[20 + i] & 15,
        ssg: d[24 + i] & 15
      });
    }
    return new OPNVoice({
      fb: (d[28] >> 3) & 7,
      con: d[28] & 7,
      ams: (d[29] >> 4) & 3,
      pms: d[29] & 7,
      slots: [
        slots[0], slots[2], slots[1], slots[3],
      ]
    });
  }

  encode(): Array<number> {
    const s = this.slots;
    return [
      s[0].dt << 4 | s[0].ml,
      s[2].dt << 4 | s[2].ml,
      s[1].dt << 4 | s[1].ml,
      s[3].dt << 4 | s[3].ml,
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
      s[0].sr,
      s[2].sr,
      s[1].sr,
      s[3].sr,
      s[0].sl << 4 | s[0].rr,
      s[2].sl << 4 | s[2].rr,
      s[1].sl << 4 | s[1].rr,
      s[3].sl << 4 | s[3].rr,
      s[0].ssg,
      s[2].ssg,
      s[1].ssg,
      s[3].ssg,
      this.fb << 3 | this.con,
      this.ams << 4 | this.pms,
    ];
  }

  static fromJSON(str: string): OPNVoice {
    const obj = JSON.parse(str);
    if (obj.__type == null || obj.__type === "OPNVoice") {
      return new OPNVoice(obj);
    }
    throw new Error(`Type mismatch: ${obj.__type}`);
  }

  toOPM(): OPMVoice {
    return new OPMVoice({
      fb: this.fb,
      con: this.con,
      ams: this.ams,
      pms: this.pms,
      slots: [
        this.slots[0].toOPM(),
        this.slots[1].toOPM(),
        this.slots[2].toOPM(),
        this.slots[3].toOPM(),
      ],
    });
  }

  /** 
   * @param keyOn: if true, the resulting parameter is for key-on. otherwise for key-off. 
   * @returns OPL voice parameters for simulating OPN voice with dual OPL channels.
   * Use `toOPL()[0]` for single OPL channel.
   */
  toOPL(keyOn: boolean = true): [OPLVoice, OPLVoice] {
    const ss = [
      this.slots[0].toOPL(keyOn),
      this.slots[1].toOPL(keyOn),
      this.slots[2].toOPL(keyOn),
      this.slots[3].toOPL(keyOn),
    ];
    switch (this.con) {
      case 0:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], new OPLSlotParam({ ...ss[3], ml: ss[1].ml, tl: Math.min(63, Math.max(0, ss[1].tl - 2) + ss[3].tl) })]
          }),
          new OPLVoice({
            fb: 0,
            con: 0,
            slots: [ss[2], ss[3]]
          })
        ];
      case 1:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], new OPLSlotParam({ ...ss[3], ml: ss[2].ml, tl: Math.min(63, Math.max(0, ss[2].tl - 2) + ss[3].tl) })]
          }),
          new OPLVoice({
            fb: 0,
            con: 0,
            slots: [ss[2], ss[3]]
          })
        ];
      case 2:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], ss[3]]
          }),
          new OPLVoice({
            fb: 0,
            con: 0,
            slots: [ss[2], ss[3]]
          })
        ];
      case 3:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], new OPLSlotParam({ ...ss[3], ml: ss[1].ml, tl: Math.min(63, Math.max(0, ss[1].tl - 2) + ss[3].tl) })]
          }),
          new OPLVoice({
            fb: 0,
            con: 0,
            slots: [ss[2], ss[3]]
          })
        ];

      case 4:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], ss[1]]
          }),
          new OPLVoice({
            fb: 0,
            con: 0,
            slots: [ss[2], ss[3]]
          })
        ];
      case 5:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], ss[1]]
          }),
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], ss[3]]
          })
        ];
      case 6:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 0,
            slots: [ss[0], ss[1]]
          }),
          new OPLVoice({
            fb: 0,
            con: 1,
            slots: [ss[2], ss[3]]
          })
        ];
      default:
        return [
          new OPLVoice({
            fb: this.fb,
            con: 1,
            slots: [ss[0], ss[1]]
          }),
          new OPLVoice({
            fb: 0,
            con: 1,
            slots: [ss[2], ss[3]]
          }),
        ];
    }
  }

  toMML(type: "mucom88" | "mucom88:poll_v" | "pmd" = "pmd"): string {
    const s = this.slots;
    if (type === "mucom88:poll_v") {
      const pad0x3 = (e: any) => "$" + (("000" + e.toString(16).toUpperCase()).slice(-3));
      const raw = this.encode();
      const data = [...raw.slice(0, 24), raw[0x1c]];
      return `; OPN voice for MUCOM88(POLL V)
@%000
${data.slice(0, 4).map(pad0x3).join(',')} ; DT/ML
${data.slice(4, 8).map(pad0x3).join(',')} ; TL
${data.slice(8, 12).map(pad0x3).join(',')} ; KS/AR
${data.slice(12, 16).map(pad0x3).join(',')} ; AM/DR
${data.slice(16, 20).map(pad0x3).join(',')} ; SR
${data.slice(20, 24).map(pad0x3).join(',')} ; SL/RR
${data.slice(24).map(pad0x3).join(',')}                ; FB/AL
    `
    } if (type === "mucom88") {
      return `; OPN voice for MUCOM88
  @0
${[this.fb, this.con].map(pad3).join(',')}
${[s[0].ar, s[0].dr, s[0].sr, s[0].rr, s[0].sl, s[0].tl, s[0].ks, s[0].ml, s[0].dt].map(pad3).join(',')}
${[s[1].ar, s[1].dr, s[1].sr, s[1].rr, s[1].sl, s[1].tl, s[1].ks, s[1].ml, s[1].dt].map(pad3).join(',')}
${[s[2].ar, s[2].dr, s[2].sr, s[2].rr, s[2].sl, s[2].tl, s[2].ks, s[2].ml, s[2].dt].map(pad3).join(',')}
${[s[3].ar, s[3].dr, s[3].sr, s[3].rr, s[3].sl, s[3].tl, s[3].ks, s[3].ml, s[3].dt].map(pad3).join(',')}
`;
    } else {
      const pad03 = (e: any) => ("000" + e).slice(-3);
      return `; OPN voice for PMD
; NUM ALG FB
@ ${[0, this.con, this.fb].map(pad03).join(' ')}
; AR  DR  SR  RR  SL  TL  KS  ML  DT  AMS
  ${[s[0].ar, s[0].dr, s[0].sr, s[0].rr, s[0].sl, s[0].tl, s[0].ks, s[0].ml, s[0].dt, s[0].am].map(pad03).join(' ')}
  ${[s[1].ar, s[1].dr, s[1].sr, s[1].rr, s[1].sl, s[1].tl, s[1].ks, s[1].ml, s[1].dt, s[1].am].map(pad03).join(' ')}
  ${[s[2].ar, s[2].dr, s[2].sr, s[2].rr, s[2].sl, s[2].tl, s[2].ks, s[2].ml, s[2].dt, s[2].am].map(pad03).join(' ')}
  ${[s[3].ar, s[3].dr, s[3].sr, s[3].rr, s[3].sl, s[3].tl, s[3].ks, s[3].ml, s[3].dt, s[3].am].map(pad03).join(' ')}
`;
    }
  }

  toFile(type: "dmp" | "tfi" | "vgi" = "tfi"): string | Uint8Array {
    const s = this.slots;
    const convertDetune = (detune: number) => detune > 3 ? 7 - detune : detune;
    if (type === "dmp") {
      return new Uint8Array([
        ...[0x0a, 1, this.pms, this.fb, this.con, this.ams],
        ...[s[0].ml, s[0].tl, s[0].ar, s[0].dr, s[0].sl, s[0].rr, s[0].am, s[0].ks, s[0].dt, s[0].sr, 0],
        ...[s[1].ml, s[1].tl, s[1].ar, s[1].dr, s[1].sl, s[1].rr, s[1].am, s[1].ks, s[1].dt, s[1].sr, 0],
        ...[s[2].ml, s[2].tl, s[2].ar, s[2].dr, s[2].sl, s[2].rr, s[2].am, s[2].ks, s[2].dt, s[2].sr, 0],
        ...[s[3].ml, s[3].tl, s[3].ar, s[3].dr, s[3].sl, s[3].rr, s[3].am, s[3].ks, s[3].dt, s[3].sr, 0],
      ]);
    } else if (type === "vgi") {
      return new Uint8Array([
        ...[this.con, this.fb, this.pms | this.ams << 4],
        ...[s[0].ml, convertDetune(s[0].dt), s[0].tl, s[0].ks, s[0].ar, s[0].dr, s[0].sr, s[0].rr, s[0].sl, 0],
        ...[s[1].ml, convertDetune(s[1].dt), s[1].tl, s[1].ks, s[1].ar, s[1].dr, s[1].sr, s[1].rr, s[1].sl, 0],
        ...[s[2].ml, convertDetune(s[2].dt), s[2].tl, s[2].ks, s[2].ar, s[2].dr, s[2].sr, s[2].rr, s[2].sl, 0],
        ...[s[3].ml, convertDetune(s[3].dt), s[3].tl, s[3].ks, s[3].ar, s[3].dr, s[3].sr, s[3].rr, s[3].sl, 0],
      ]);
    } else {
      return new Uint8Array([
        ...[this.con, this.fb],
        ...[s[0].ml, convertDetune(s[0].dt), s[0].tl, s[0].ks, s[0].ar, s[0].dr, s[0].sr, s[0].rr, s[0].sl, 0],
        ...[s[1].ml, convertDetune(s[1].dt), s[1].tl, s[1].ks, s[1].ar, s[1].dr, s[1].sr, s[1].rr, s[1].sl, 0],
        ...[s[2].ml, convertDetune(s[2].dt), s[2].tl, s[2].ks, s[2].ar, s[2].dr, s[2].sr, s[2].rr, s[2].sl, 0],
        ...[s[3].ml, convertDetune(s[3].dt), s[3].tl, s[3].ks, s[3].ar, s[3].dr, s[3].sr, s[3].rr, s[3].sl, 0],
      ]);
    }
  }
}
