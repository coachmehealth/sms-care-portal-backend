type GlucoseClassification =
  | '>300'
  | 'red'
  | 'yellow'
  | 'green'
  | '<80'
  | '<70';

export type GlucoseReading = {
  classification: GlucoseClassification;
  score: number;
};

export type ParsedMessage = {
  error?: 'no_from_patient' | 'catchall' | 'too_many_readings';
  glucoseReading?: GlucoseReading;
};

export const extractNumerics = (rawMessage: string) => {
  const matches = rawMessage.match(/\b(\d+)\b/gm);
  return matches?.map((s) => parseInt(s, 10));
};

export const classifyGlucoseValue = (
  glucoseValue: number,
): GlucoseClassification => {
  if (glucoseValue < 70) {
    return '<70';
  }
  if (glucoseValue >= 70 && glucoseValue < 80) {
    return '<80';
  }
  if (glucoseValue >= 80 && glucoseValue < 131) {
    return 'green';
  }
  if (glucoseValue >= 131 && glucoseValue < 181) {
    return 'yellow';
  }
  if (glucoseValue >= 181 && glucoseValue < 301) {
    return 'red';
  }

  return '>300';
};

export const parseInboundPatientMessage = (
  rawMessage: string,
): ParsedMessage => {
  if (rawMessage.toLowerCase() === 'no') {
    return { error: 'no_from_patient' };
  }

  const numericScores = extractNumerics(rawMessage);

  if (!numericScores) {
    return { error: 'catchall' };
  }

  if (numericScores.length > 1) {
    return { error: 'too_many_readings' };
  }

  const glucoseValue = numericScores[0];

  return {
    glucoseReading: {
      classification: classifyGlucoseValue(glucoseValue),
      score: glucoseValue,
    },
  };
};
