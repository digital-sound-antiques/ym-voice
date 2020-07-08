# YMVoice
[![npm version](https://badge.fury.io/js/ym-voice.svg)](https://badge.fury.io/js/ym-voice)

FM voice parameter decoder/encoder library for YAMAHA's legacy sound chips.

# Supported Chips
- OPM(YM2151)
- OPN(YM2203), OPN2(YM2612), OPNA(YM2608)
- OPL(Y8950), OPL2(YM3812)
- OPLL(YM2413)

# Usage
## Create instance
```
const opll = new OPLLVoice({
  fb: 5,
  slots: [
    { am: 0, pm: 0, eg: 0, ml: 3, kr: 1, kl: 0, tl: 26, ar: 13, dr: 8, sl: 2, rr: 3, ws: 1 },
    { am: 0, pm: 1, eg: 0, ml: 1, kr: 0, kl: 0, tl: 0, ar: 15, dr: 7, sl: 1, rr: 3, ws: 0 },
  ],
});

const opn = new OPNVoice({
  fb: 6, con: 4, ams: 0, pms: 0,
  slots: [
    { dt: 7, ml: 3, tl: 26, ks: 0, ar: 31, am: 1, dr: 0, sr: 0, sl: 0, rr: 15, ssg: 0 },
    { dt: 7, ml: 3, tl: 0, ks: 0, ar: 31, am: 1, dr: 0, sr: 1, sl: 3, rr: 15, ssg: 0 },
    { dt: 5, ml: 4, tl: 25, ks: 0, ar: 31, am: 1, dr: 0, sr: 0, sl: 0, rr: 15, ssg: 0 },
    { dt: 5, ml: 4, tl: 0, ks: 0, ar: 31, am: 1, dr: 0, sr: 1, sl: 3, rr: 15, ssg: 0 },
  ],
});
```

## Decode from Binary
### Code
```
const opn = OPNVoice.decode(
  [
    0x73, 0x54, 0x73, 0x54, // DT/ML
    0x1A, 0x19, 0x00, 0x00, // TL
    0x1F, 0x1F, 0x1F, 0x1F, // KS/AR
    0x80, 0x80, 0x80, 0x80, // AM/DR
    0x00, 0x00, 0x01, 0x01, // SR
    0x0F, 0x0F, 0x3F, 0x3F, // SL/RR
    0x00, 0x00, 0x00, 0x00, // SSG-EG
    0x34,                   // FB/AL
  ]);
console.log(opn);
```

### Output
```
OPNVoice {
  __type: 'OPNVoice',
  fb: 6, con: 4, ams: 0, pms: 0,
  slots: [
    OPNSlotParam {
      __type: 'OPNSlotParam',
      dt: 7, ml: 3, tl: 26, ks: 0, ar: 31, am: 1, dr: 0, sr: 0, sl: 0, rr: 15, ssg: 0
    },
    OPNSlotParam {
      __type: 'OPNSlotParam',
      dt: 7, ml: 3, tl: 0, ks: 0, ar: 31, am: 1, dr: 0, sr: 1, sl: 3, rr: 15, ssg: 0
    },
    OPNSlotParam {
      __type: 'OPNSlotParam',
      dt: 5, ml: 4, tl: 25, ks: 0, ar: 31, am: 1, dr: 0, sr: 0, sl: 0, rr: 15, ssg: 0
    },
    OPNSlotParam {
      __type: 'OPNSlotParam',
      dt: 5, ml: 4, tl: 0, ks: 0, ar: 31, am: 1, dr: 0, sr: 1, sl: 3, rr: 15, ssg: 0
    }
  ]
}
```

## Encode to Binary
### Code
```
const guitar = new OPLLVoice({
  fb: 5,
  slots: [
    { am: 0, pm: 0, eg: 0, ml: 3, kr: 1, kl: 0, tl: 26, ar: 13, dr: 8, sl: 2, rr: 3, ws: 1 },
    { am: 0, pm: 1, eg: 0, ml: 1, kr: 0, kl: 0, tl: 0, ar: 15, dr: 7, sl: 1, rr: 3, ws: 0 }
  ]
});
const toHex = (e) => "$" + (("0" + e.toString(16)).slice(-2));
console.log(guitar.encode().map(toHex).join(','));
```
### Output
```
$13,$41,$1a,$05,$d8,$f7,$23,$13
```

## MML builder
### Code
```
const opn = OPNVoice.decode(
  [
    0x73, 0x54, 0x73, 0x54, // DT/ML
    0x1A, 0x19, 0x00, 0x00, // TL
    0x1F, 0x1F, 0x1F, 0x1F, // KS/AR
    0x80, 0x80, 0x80, 0x80, // AM/DR
    0x00, 0x00, 0x01, 0x01, // SR
    0x0F, 0x0F, 0x3F, 0x3F, // SL/RR
    0x00, 0x00, 0x00, 0x00, // SSG-EG
    0x34,                   // FB/AL
  ]);
console.log(opn.toMML());
console.log(opn.toMML("mucom88"));
console.log(opn.toMML("mucom88:poll_v"));
```
### Output
```
; OPN voice for PMD
; NUM ALG FB
@ 000 004 006
; AR  DR  SR  RR  SL  TL  KS  ML  DT  AMS
  031 000 000 015 000 026 000 003 007 001
  031 000 001 015 003 000 000 003 007 001
  031 000 000 015 000 025 000 004 005 001
  031 000 001 015 003 000 000 004 005 001

; OPN voice for MUCOM88
  @0
  6,  4
 31,  0,  0, 15,  0, 26,  0,  3,  7
 31,  0,  1, 15,  3,  0,  0,  3,  7
 31,  0,  0, 15,  0, 25,  0,  4,  5
 31,  0,  1, 15,  3,  0,  0,  4,  5

; OPN voice for MUCOM88(POLL V)
@%000
$073,$054,$073,$054 ; DT/ML
$01A,$019,$000,$000 ; TL
$01F,$01F,$01F,$01F ; KS/AR
$080,$080,$080,$080 ; AM/DR
$000,$000,$001,$001 ; SR
$00F,$00F,$03F,$03F ; SL/RR
$034                ; FB/AL
```

## Type Conversion
### Code
```
const opll = OPLLVoice.decode([0x13, 0x41, 0x1a, 0x0d, 0xd8, 0xf7, 0x23, 0x13]);
console.lot(opll.toMML());
console.log(opll.toOPM().toMML("mxdrv"));
```

### Output
```
; OPLL voice for MGSDRV
@v15 = {
; TL FB
  25, 0,
; AR DR SL RR KL MT AM PM EG KR DT
  15, 2, 2, 1, 2, 3, 0, 0, 0, 1, 0,
  13, 4, 2, 3, 0, 1, 0, 0, 0, 0, 0 }

; OPM voice for MXDRV
@v0 = {
;  AR  DR  SR  RR  SL  OL  KS  ML DT1 DT2 AME
   31,  7,  5,  0,  0, 25,  2,  3,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
   29, 11,  9,  8,  0,  0,  0,  1,  0,  0,  0,
; CON  FL  OP
    2,  0, 15
```

# Binary Format
## OPLL(YM2413)
```
   |D7|D6|D5|D4|D3|D2|D1|D0|
0: |AM|PM|EG|KR|    ML     | # slot1 
1: |AM|PM|EG|KR|    ML     | # slot2
2: |  KL |        TL       | # slot1
3: |  KL |--|WC|WM|   FB   | # slot2 
4: |     AR    |    DR     | # slot1 
5: |     AR    |    DR     | # slot2
6: |     SL    |    RR     | # slot1
7: |     SL    |    RR     | # slot2
   |D7|D6|D5|D4|D3|D2|D1|D0|

WC/WM is waveform for slot#2 and slot#1, respectively.
```

## OPL(YM3526)/OPL2(YM3812)
```
   |D7|D6|D5|D4|D3|D2|D1|D0|
0: |AM|PM|EG|KR|    ML     | # slot1 
1: |AM|PM|EG|KR|    ML     | # slot2
2: |  KL |        TL       | # slot1
3: |  KL |        TL       | # slot2
4: |     AR    |    DR     | # slot1 
5: |     AR    |    DR     | # slot2
6: |     SL    |    RR     | # slot1
7: |     SL    |    RR     | # slot2
8: |-----------------| WS  | # slot1
9: |-----------------| WS  | # slot2
A: |-----------|   FB   |CN|
   |D7|D6|D5|D4|D3|D2|D1|D0|
```

## OPN(YM2203)/OPN2(YM2612)/OPNA(YM2608)
```
    |D7|D6|D5|D4|D3|D2|D1|D0|
00: |--|   DT   |     ML    | # slot1 
01: |--|   DT   |     ML    | # slot3 
02: |--|   DT   |     ML    | # slot2 
03: |--|   DT   |     ML    | # slot4 
04: |--|         TL         | # slot1 
05: |--|         TL         | # slot3 
06: |--|         TL         | # slot2 
07: |--|         TL         | # slot4 
08: |--------|      AR      | # slot1 
09: |--------|      AR      | # slot3 
0A: |--------|      AR      | # slot2 
0B: |--------|      AR      | # slot4 
0C: |AM|-----|      DR      | # slot1
0D: |AM|-----|      DR      | # slot3 
0E: |AM|-----|      DR      | # slot2 
0F: |AM|-----|      DR      | # slot4
10: |--------|      SR      | # slot1
11: |--------|      SR      | # slot3 
12: |--------|      SR      | # slot2
13: |--------|      SR      | # slot4
14: |     SL    |    RR     | # slot1
15: |     SL    |    RR     | # slot3
16: |     SL    |    RR     | # slot2
17: |     SL    |    RR     | # slot4
18: |-----------|   SSG-EG  | # slot1
19: |-----------|   SSG-EG  | # slot3
1A: |-----------|   SSG-EG  | # slot2
1B: |-----------|   SSG-EG  | # slot4
1C: |-----|   FB   |  CON   | 
1D: |--|--| AMS |--|  PMS   | 
    |D7|D6|D5|D4|D3|D2|D1|D0|
```

## OPM(YM2151)
```
    |D7|D6|D5|D4|D3|D2|D1|D0|
00: |--|  DT1   |     ML    | # slot1 
01: |--|  DT1   |     ML    | # slot3 
02: |--|  DT1   |     ML    | # slot2 
03: |--|  DT1   |     ML    | # slot4 
04: |--|         TL         | # slot1 
05: |--|         TL         | # slot3 
06: |--|         TL         | # slot2 
07: |--|         TL         | # slot4 
08: |--------|      AR      | # slot1 
09: |--------|      AR      | # slot3 
0A: |--------|      AR      | # slot2 
0B: |--------|      AR      | # slot4 
0C: |AM|-----|      DR      | # slot1
0D: |AM|-----|      DR      | # slot3 
0E: |AM|-----|      DR      | # slot2 
0F: |AM|-----|      DR      | # slot4
10: | DT2 |--|      SR      | # slot1
11: | DT2 |--|      SR      | # slot3 
12: | DT2 |--|      SR      | # slot2
13: | DT2 |--|      SR      | # slot4
14: |     SL    |    RR     | # slot1
15: |     SL    |    RR     | # slot3
16: |     SL    |    RR     | # slot2
17: |     SL    |    RR     | # slot4
18: |-----|   FB   |  CON   | 
19: |-----|  PMS   |--| AMS |
    |D7|D6|D5|D4|D3|D2|D1|D0|
```
