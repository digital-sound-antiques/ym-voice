import { OPMSlotParam, OPMVoice } from "./opm-voice";

function parseOPMLine(line: string): {
  lineType: string | undefined;
  values: number[];
} {
  const lineType = line.match(/\w{2,3}:/)?.[0];

  if (!lineType) {
    return { lineType, values: [] };
  }

  const values = line
    .slice(lineType.length)
    .split(/\s+/)
    .filter((raw) => raw !== "")
    .map((raw) => parseInt(raw));

  return { lineType, values };
}

function parseOPMSlot(values: number[]): Partial<OPMSlotParam> {
  const [ar, dr, sr, rr, sl, tl, ks, ml, dt1, dt2, am] = values;
  return { ar, dr, sr, rr, sl, tl, ks, ml, dt1, dt2, am };
}

function buildVoice(voiceNumber: number, values: ParsedOPMValues): OPMVoice | undefined {
  if (
    values.channelValues?.length !== 7 ||
    values.op0Values?.length !== 11 ||
    values.op1Values?.length !== 11 ||
    values.op2Values?.length !== 11 ||
    values.op3Values?.length !== 11
  ) {
    console.warn(`@:${voiceNumber}: Malformed OPM instrument, skipping...`);
    return;
  }
  const [_pan, fb, con, ams, pms, _slot, _noiseEnable] = values.channelValues;

  return new OPMVoice({
    fb,
    con,
    ams,
    pms,
    slots: [
      parseOPMSlot(values.op0Values),
      parseOPMSlot(values.op1Values),
      parseOPMSlot(values.op2Values),
      parseOPMSlot(values.op3Values),
    ],
  });
}

interface ParsedOPMValues {
  lfoValues?: number[];
  channelValues?: number[];
  op0Values?: number[];
  op1Values?: number[];
  op2Values?: number[];
  op3Values?: number[];
  voiceComments?: string[];
}

export function parseOPM(fileData: string): {
  voices: { [voiceNumber: number]: OPMVoice };
  comments: { [voiceNumber: number]: string[] };
} {
  if (fileData.indexOf("@:") === -1) {
    return { voices: [], comments: [] };
  }

  const voices: { [voiceNumber: number]: OPMVoice } = {};
  const comments: { [voiceNumber: number]: string[] } = {};

  let lastVoiceNumber = -1;
  let parsedValues: ParsedOPMValues = {};
  let voiceComments: string[] = [];

  function appendVoice(voiceNumber: number, values: ParsedOPMValues) {
    const newVoice = buildVoice(voiceNumber, values);
    if (newVoice) {
      voices[voiceNumber] = newVoice;
      comments[voiceNumber] = voiceComments;
    }
  }

  const lines = fileData.split(/\r\n|\n/).map((line) => line.trim());

  lines.forEach((line, index) => {
    if (line.length === 0) {
      return;
    } else if (line.startsWith("@:")) {
      if (lastVoiceNumber >= 0) {
        appendVoice(lastVoiceNumber, parsedValues);
        comments[lastVoiceNumber] = voiceComments;
      }
      parsedValues = {};
      voiceComments = [];

      lastVoiceNumber = parseInt(line.slice(2).split(/\s+/)[0]);
    } else if (line.slice(0, 2) === "//") {
      voiceComments.push(line);
    } else {
      const { lineType, values } = parseOPMLine(line);
      switch (lineType) {
        case "LFO:":
          parsedValues.lfoValues = values;
          break;
        case "CH:":
          parsedValues.channelValues = values;
          break;
        case "M1:":
          parsedValues.op0Values = values;
          break;
        case "C1:":
          parsedValues.op1Values = values;
          break;
        case "M2:":
          parsedValues.op2Values = values;
          break;
        case "C2:":
          parsedValues.op3Values = values;
          break;
        default:
          console.warn(`Line ${index}: Unexpected line type "${lineType || line.slice(0, 3)}"`);
      }
    }
  });

  appendVoice(lastVoiceNumber, parsedValues);
  comments[lastVoiceNumber] = voiceComments;

  return { voices, comments };
}
