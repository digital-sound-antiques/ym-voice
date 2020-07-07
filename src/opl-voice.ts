import { OPLLVoice, OPLLVoiceMap, OPLLSlotParam } from "./opll-voice";
import { OPNSlotParam } from "./opn-voice";
import { YMVoice } from "./ym-voice";

const _ml_tbl = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 12, 12, 15, 15];

export class OPLSlotParam {
  __type: "OPLSlotParam" = "OPLSlotParam";
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
  constructor(init?: Partial<OPLSlotParam>) {
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
  };
  
  toOPLL() {
    const _klfix = [0, 2, 1, 3];
    return new OPLLSlotParam({
      am: this.am,
      pm: this.pm,
      eg: this.eg,
      ml: this.ml,
      kr: this.kr,
      kl: _klfix[this.kl],
      tl: this.tl & 0x3f,
      ar: this.ar,
      dr: this.dr,
      sl: this.sl,
      rr: this.rr,
      ws: 0 < this.ws ? 1 : 0,
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
      ssg: 0
    });
  }
};

export type OPLVoiceObject = {
  fb: number;
  con: number;
  slots: [Partial<OPLSlotParam>, Partial<OPLSlotParam>];
};

export class OPLVoice extends YMVoice {
  fb: number;
  con: number;
  slots: [OPLSlotParam, OPLSlotParam];

  constructor(init?: OPLVoiceObject) {
    super("OPLVoice");
    this.fb = init?.fb ?? 0;
    this.con = init?.con ?? 0;
    this.slots = [
      new OPLSlotParam(init?.slots?.[0]),
      new OPLSlotParam(init?.slots?.[1]),
    ];
  }

  /**
   *    |D7|D6|D5|D4|D3|D2|D1|D0|
   * 0: |AM|PM|EG|KR|    ML     | # slot1 
   * 1: |AM|PM|EG|KR|    ML     | # slot2
   * 2: |  KL |        TL       | # slot1
   * 3: |  KL |        TL       | # slot2
   * 4: |     AR    |    DR     | # slot1 
   * 5: |     AR    |    DR     | # slot2
   * 6: |     SL    |    RR     | # slot1
   * 7: |     SL    |    RR     | # slot2
   * 8: |-----------------| WS  | # slot1
   * 9: |-----------------| WS  | # slot2
   * A: |-----------|   FB   |CN|
   *    |D7|D6|D5|D4|D3|D2|D1|D0|
   */
  encode(): Array<number> {
    const s = this.slots;
    return [
      (s[0].am << 7) | (s[0].pm << 6) | (s[0].eg << 5) | (s[0].kr << 4) | s[0].ml,
      (s[1].am << 7) | (s[1].pm << 6) | (s[1].eg << 5) | (s[1].kr << 4) | s[1].ml,
      (s[0].kl << 6) | s[0].tl,
      (s[1].kl << 6) | s[1].tl,
      (s[0].ar << 4) | s[0].dr,
      (s[1].ar << 4) | s[1].dr,
      (s[0].sl << 4) | s[0].rr,
      (s[1].sl << 4) | s[1].rr,
      s[0].ws,
      s[1].ws,
      (this.fb << 1) | this.con
    ];
  }

  static decode(d: ArrayLike<number>): OPLVoice {
    return new OPLVoice({
      fb: d[10] & 7,
      con: d[10] & 1,
      slots: [
        new OPLSlotParam({
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
          ws: d[8] & 3
        }),
        new OPLSlotParam({
          am: (d[1] >> 7) & 1,
          pm: (d[1] >> 6) & 1,
          eg: (d[1] >> 5) & 1,
          kr: (d[1] >> 4) & 1,
          ml: d[1] & 0xf,
          kl: (d[3] >> 6) & 3,
          tl: d[3] & 0x3f,
          ar: (d[5] >> 4) & 0xf,
          dr: d[5] & 0xf,
          sl: (d[7] >> 4) & 0xf,
          rr: d[7] & 0xf,
          ws: d[9] & 3
        })
      ]
    });
  }

  static fromJSON(str: string): OPLVoice {
    const obj = JSON.parse(str);
    if (obj.__type == null || obj.__type === "OPLVoice") {
      return new OPLVoice(obj);
    }
    throw new Error(`Type mismatch: ${obj.__type}`);
  }

  toOPLLVoice(): OPLLVoice {
    return new OPLLVoice({
      fb: this.fb,
      slots: [
        this.con === 0 ? this.slots[0].toOPLL() : new OPLLSlotParam(),
        this.slots[1].toOPLL(),
      ]
    });
  }

  toOPLLROMVoice(): { program: number; volumeOffset: number; octaveOffset: number } {
    let diff = Infinity;
    let program = 0;
    for (let i = 1; i < 16; i++) {
      const opll = OPLLVoiceMap[i];
      if (i == 13) continue;
      let d = 0;
      const ml_a = this.slots[1].ml / _ml_tbl[this.slots[0].ml];
      const ml_b = opll.slots[1].ml / _ml_tbl[opll.slots[0].ml];
      d += Math.abs(ml_a - ml_b) << 1;
      d += Math.abs(this.fb - opll.fb) >> 1;
      d += Math.abs(this.slots[0].ar - opll.slots[0].ar);
      d += Math.abs(this.slots[1].ar - opll.slots[1].ar);
      d += Math.abs(this.slots[0].dr - opll.slots[0].dr);
      d += Math.abs(this.slots[1].dr - opll.slots[1].dr);
      d +=
        Math.min(
          63,
          4 * Math.abs(this.slots[0].sl - opll.slots[0].sl) +
          Math.abs(this.slots[0].tl - (opll.slots[0].tl + opll.slots[0].ws ? 8 : 0))
        ) >> 3;
      if (this.slots[1].rr === 0) {
        // sustainable tone
        if (opll.slots[1].eg === 0) {
          continue;
        }
        d += Math.abs(this.slots[1].sl - opll.slots[1].sl);
      } else {
        // percusive tone
        if (opll.slots[1].eg === 1) {
          continue;
        }
        d += Math.abs(this.slots[1].rr - opll.slots[1].rr);
      }
      if (d < diff) {
        program = i;
        diff = d;
      }
    }
    const opll = OPLLVoiceMap[program];
    const ooff = Math.floor(Math.log2(_ml_tbl[this.slots[1].ml] / _ml_tbl[opll.slots[1].ml]) / 2);
    let voff = 1;
    if (opll.slots[1].ws) {
      voff -= 2;
      if (opll.slots[0].ws) {
        voff -= 2;
      }
    }
    return {
      program,
      volumeOffset: voff,
      octaveOffset: ooff,
    };
  }

  toMML(type: "pmd" = "pmd"):string {
    const s = this.slots;
    const pad03 = (e: any) => ("000" + e).slice(-3);
    return `; OPL voice for PMD
; NUM ALG FB
@ ${[0, this.con, this.fb].map(pad03).join(' ')}
; AR  DR  RR  SL  TL  KSL ML  KSR EGT VIB AM
  ${[s[0].ar, s[0].dr, s[0].rr, s[0].sl, s[0].tl, s[0].kl, s[0].ml, s[0].kr, s[0].eg, s[0].pm, s[0].am].map(pad03).join(' ')}
  ${[s[1].ar, s[1].dr, s[1].rr, s[1].sl, s[1].tl, s[1].kl, s[1].ml, s[1].kr, s[1].eg, s[1].pm, s[1].am].map(pad03).join(' ')}
`;
  }

}