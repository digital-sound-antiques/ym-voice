import { OPNSlotParam, OPNVoice } from "./opn-voice";
import { OPMVoice } from "./opm-voice";
import { OPLSlotParam, OPLVoice } from "./opl-voice";
import { YMVoice } from "./ym-voice";

const _OPLL_ROM_PATCHES = [
  [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  [0x71, 0x61, 0x1e, 0x17, 0xd0, 0x78, 0x00, 0x17], // 1: Violin
  [0x13, 0x41, 0x1a, 0x0d, 0xd8, 0xf7, 0x23, 0x13], // 2: Guitar
  [0x13, 0x01, 0x99, 0x00, 0xf2, 0xd4, 0x21, 0x23], // 3: Piano
  [0x11, 0x61, 0x0e, 0x07, 0x8d, 0x64, 0x70, 0x27], // 4: Flute
  [0x32, 0x21, 0x1e, 0x06, 0xe1, 0x76, 0x01, 0x28], // 5: Clarinet
  [0x31, 0x22, 0x16, 0x05, 0xe0, 0x71, 0x00, 0x18], // 6: Oboe
  [0x21, 0x61, 0x1d, 0x07, 0x82, 0x81, 0x11, 0x07], // 7: Trumpet
  [0x33, 0x21, 0x2d, 0x13, 0xb0, 0x70, 0x00, 0x07], // 8: Organ
  [0x61, 0x61, 0x1b, 0x06, 0x64, 0x65, 0x10, 0x17], // 9: Horn
  [0x41, 0x61, 0x0b, 0x18, 0x85, 0xf0, 0x81, 0x07], // A: Synthesizer
  [0x33, 0x01, 0x83, 0x11, 0xea, 0xef, 0x10, 0x04], // B: Harpsichord
  [0x17, 0xc1, 0x24, 0x07, 0xf8, 0xf8, 0x22, 0x12], // C: Vibraphone
  [0x61, 0x50, 0x0c, 0x05, 0xd2, 0xf5, 0x40, 0x42], // D: Synthsizer Bass
  [0x01, 0x01, 0x55, 0x03, 0xe4, 0x90, 0x03, 0x02], // E: Acoustic Bass
  [0x41, 0x41, 0x89, 0x03, 0xf1, 0xe4, 0xc0, 0x13], // F: Electric Guitar
  [0x01, 0x01, 0x18, 0x0f, 0xdf, 0xf8, 0x6a, 0x6d], // R: Bass Drum
  [0x01, 0x01, 0x00, 0x00, 0xc8, 0xd8, 0xa7, 0x68], // R: High-Hat(M) / Snare Drum(C)
  [0x05, 0x01, 0x00, 0x00, 0xf8, 0xaa, 0x59, 0x55], // R: Tom-tom(M) / Top Cymbal(C)
];

const _VRC7_ROM_PATCHES = [
  [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  [0x03, 0x21, 0x05, 0x06, 0xe8, 0x81, 0x42, 0x27],
  [0x13, 0x41, 0x14, 0x0d, 0xd8, 0xf6, 0x23, 0x12],
  [0x11, 0x11, 0x08, 0x08, 0xfa, 0xb2, 0x20, 0x12],
  [0x31, 0x61, 0x0c, 0x07, 0xa8, 0x64, 0x61, 0x27],
  [0x32, 0x21, 0x1e, 0x06, 0xe1, 0x76, 0x01, 0x28],
  [0x02, 0x01, 0x06, 0x00, 0xa3, 0xe2, 0xf4, 0xf4],
  [0x21, 0x61, 0x1d, 0x07, 0x82, 0x81, 0x11, 0x07],
  [0x23, 0x21, 0x22, 0x17, 0xa2, 0x72, 0x01, 0x17],
  [0x35, 0x11, 0x25, 0x00, 0x40, 0x73, 0x72, 0x01],
  [0xb5, 0x01, 0x0f, 0x0f, 0xa8, 0xa5, 0x51, 0x02],
  [0x17, 0xc1, 0x24, 0x07, 0xf8, 0xf8, 0x22, 0x12],
  [0x71, 0x23, 0x11, 0x06, 0x65, 0x74, 0x18, 0x16],
  [0x01, 0x02, 0xd3, 0x05, 0xc9, 0x95, 0x03, 0x02],
  [0x61, 0x63, 0x0c, 0x00, 0x94, 0xc0, 0x33, 0xf6],
  [0x21, 0x72, 0x0d, 0x00, 0xc1, 0xd5, 0x56, 0x06],
  [0x01, 0x01, 0x18, 0x0f, 0xdf, 0xf8, 0x6a, 0x6d],
  [0x01, 0x01, 0x00, 0x00, 0xc8, 0xd8, 0xa7, 0x68],
  [0x05, 0x01, 0x00, 0x00, 0xf8, 0xaa, 0x59, 0x55],
];

export class OPLLSlotParam {
  __type = "OPLLSlotParam" as const;
  am: number;
  pm: number;
  eg: number;
  ml: number;
  kr: number;
  kl: number;
  tl: number;
  ar: number;
  dr: number;
  sl: number;
  rr: number;
  ws: number;
  constructor(init?: Partial<OPLLSlotParam>) {
    this.am = init?.am ?? 0;
    this.pm = init?.pm ?? 0;
    this.eg = init?.eg ?? 0;
    this.ml = init?.ml ?? 0;
    this.kr = init?.kr ?? 0;
    this.kl = init?.kl ?? 0;
    this.tl = init?.tl ?? 0;
    this.ar = init?.ar ?? 0;
    this.dr = init?.dr ?? 0;
    this.sl = init?.sl ?? 0;
    this.rr = init?.rr ?? 0;
    this.ws = init?.ws ?? 0;
  }

  toOPL(): OPLSlotParam {
    const _klfix = [0, 2, 1, 3];
    return new OPLSlotParam({
      am: this.am,
      pm: this.pm,
      eg: this.eg,
      ml: this.ml,
      kr: this.kr,
      kl: _klfix[this.kl],
      tl: this.tl,
      ar: this.ar,
      dr: this.dr,
      sl: this.sl,
      rr: this.rr,
      ws: this.ws,
    });
  }

  toOPN(car: boolean): OPNSlotParam {
    function _RR(rate: number): number {
      switch (rate) {
        case 0:
          return 0;
        case 15:
          return 31;
        default:
          return Math.min(31, Math.round((rate + 1.5) * 2));
      }
    }
    return new OPNSlotParam({
      dt: 0,
      ml: this.ml,
      tl: Math.min(127, this.tl + (this.ws ? (car ? 8 : 5) : 0)),
      ks: this.kr * 2,
      ar: _RR(this.ar),
      am: this.am,
      dr: _RR(this.dr),
      sr: _RR(this.eg ? 0 : this.rr),
      sl: this.sl,
      rr: this.eg ? Math.min(15, this.rr + 1) : car ? 8 : 0,
      ssg: 0,
    });
  }
}

export type OPLLVoiceObject = {
  fb: number;
  slots: [Partial<OPLLSlotParam>, Partial<OPLLSlotParam>];
};

export class OPLLVoice extends YMVoice {
  fb: number;
  slots: [OPLLSlotParam, OPLLSlotParam];

  constructor(init?: OPLLVoiceObject) {
    super("OPLLVoice");
    this.fb = init?.fb ?? 0;
    this.slots = [new OPLLSlotParam(init?.slots?.[0]), new OPLLSlotParam(init?.slots?.[1])];
  }

  /**
   *    |D7|D6|D5|D4|D3|D2|D1|D0|
   * 0: |AM|PM|EG|KR|    ML     | # slot1
   * 1: |AM|PM|EG|KR|    ML     | # slot2
   * 2: |  KL |        TL       | # slot1
   * 3: |  KL |--|WC|WM|   FB   | # slot2
   * 4: |     AR    |    DR     | # slot1
   * 5: |     AR    |    DR     | # slot2
   * 6: |     SL    |    RR     | # slot1
   * 7: |     SL    |    RR     | # slot2
   *    |D7|D6|D5|D4|D3|D2|D1|D0|
   *
   * WC/WM is waveform for slot#2 and slot#1, respectively.
   */
  encode(): Array<number> {
    const s = this.slots;
    return [
      (s[0].am << 7) | (s[0].pm << 6) | (s[0].eg << 5) | (s[0].kr << 4) | s[0].ml,
      (s[1].am << 7) | (s[1].pm << 6) | (s[1].eg << 5) | (s[1].kr << 4) | s[1].ml,
      (s[0].kl << 6) | s[0].tl,
      (s[1].kl << 6) | (s[1].ws << 4) | (s[0].ws << 3) | this.fb,
      (s[0].ar << 4) | s[0].dr,
      (s[1].ar << 4) | s[1].dr,
      (s[0].sl << 4) | s[0].rr,
      (s[1].sl << 4) | s[1].rr,
    ];
  }

  static decode(d: ArrayLike<number>): OPLLVoice {
    return new OPLLVoice({
      fb: d[3] & 7,
      slots: [
        new OPLLSlotParam({
          am: (d[0] >> 7) & 1,
          pm: (d[0] >> 6) & 1,
          eg: (d[0] >> 5) & 1,
          kr: (d[0] >> 4) & 1,
          ml: d[0] & 0xf,
          kl: (d[2] >> 6) & 3,
          tl: d[2] & 0x3f,
          ar: (d[4] >> 4) & 0xf,
          dr: d[4] & 0xf,
          sl: (d[6] >> 4) & 0xf,
          rr: d[6] & 0xf,
          ws: (d[3] >> 3) & 1,
        }),
        new OPLLSlotParam({
          am: (d[1] >> 7) & 1,
          pm: (d[1] >> 6) & 1,
          eg: (d[1] >> 5) & 1,
          kr: (d[1] >> 4) & 1,
          ml: d[1] & 0xf,
          kl: (d[3] >> 6) & 3,
          tl: 0,
          ar: (d[5] >> 4) & 0xf,
          dr: d[5] & 0xf,
          sl: (d[7] >> 4) & 0xf,
          rr: d[7] & 0xf,
          ws: (d[3] >> 4) & 1,
        }),
      ],
    });
  }

  static fromJSON(str: string): OPLLVoice {
    const obj = JSON.parse(str);
    if (obj.__type == null || obj.__type === "OPLLVoice") {
      return new OPLLVoice(obj);
    }
    throw new Error(`Type mismatch: ${obj.__type}`);
  }

  toOPN(): OPNVoice {
    const s = this.slots;
    return new OPNVoice({
      fb: s[0].ws ? Math.min(7, this.fb + 6) : this.fb,
      con: 2,
      ams: 4, // 5.9dB
      pms: s[0].pm || s[1].pm ? 2 : 0, // 6.7cent or 0
      slots: [s[0].toOPN(false), new OPNSlotParam(), new OPNSlotParam(), s[1].toOPN(true)],
    });
  }

  toOPM(): OPMVoice {
    return this.toOPN().toOPM();
  }

  toOPL(): OPLVoice {
    return new OPLVoice({
      fb: this.fb,
      con: 0,
      slots: [this.slots[0].toOPL(), this.slots[1].toOPL()],
    });
  }

  toMML(_type: "mgsdrv" = "mgsdrv"): string {
    const s = this.slots;
    const pad2 = (e: number) => ("  " + e).slice(-2);
    return `; OPLL voice for MGSDRV
@v15 = {
; TL FB
  ${[s[0].tl, this.fb].map(pad2).join(",")},
; AR DR SL RR KL MT AM PM EG KR DT
  ${[s[0].ar, s[0].dr, s[0].sl, s[0].rr, s[0].kl, s[0].ml, s[0].am, s[0].pm, s[0].eg, s[0].kr, s[0].ws].map(pad2).join(",")},
  ${[s[1].ar, s[1].dr, s[1].sl, s[1].rr, s[1].kl, s[1].ml, s[1].am, s[1].pm, s[1].eg, s[1].kr, s[1].ws].map(pad2).join(",")} }
`;
  }

  toFile(): string | Uint8Array {
    return "";
  }
}

export const OPLLVoiceMap = _OPLL_ROM_PATCHES.map((e) => OPLLVoice.decode(e));
export const VRC7VoiceMap = _VRC7_ROM_PATCHES.map((e) => OPLLVoice.decode(e));
