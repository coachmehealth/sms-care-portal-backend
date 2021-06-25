import {
  classifyGlucoseValue,
  extractNumerics,
  parseInboundPatientMessage,
} from '../../src/domain/message_parsing';

describe('extractNumerics', () => {
  it('can handle only 1 number as the only text', () => {
    expect(extractNumerics('100')).toEqual([100]);
    expect(extractNumerics(' 100  ')).toEqual([100]);
  });

  it('can handle 2 number separated by single space', () => {
    expect(extractNumerics('100 200')).toEqual([100, 200]);
  });

  it('can handle extra text before number', () => {
    expect(extractNumerics(' my score is 100')).toEqual([100]);
  });

  it('can handle extra between multiple scores text before number', () => {
    expect(extractNumerics(' my score is 100 other score is 200  ')).toEqual([
      100,
      200,
    ]);
  });
});

describe('parseInboundPatientMessage', () => {
  it('indicates an erorr when the message contains no text', () => {
    const parsedResponse = parseInboundPatientMessage('');
    expect(parsedResponse.error).toEqual('catchall');
  });

  it('can handle a member saying no to their reading', () => {
    let parsedResponse = parseInboundPatientMessage('No');
    expect(parsedResponse.error).toEqual('no_from_patient');

    parsedResponse = parseInboundPatientMessage('no');
    expect(parsedResponse.error).toEqual('no_from_patient');
  });

  it('indicates an error if the messages contains more than 1 reading', () => {
    let parsedResponse = parseInboundPatientMessage(
      'my first reading is 123 my 2nd is 456',
    );
    expect(parsedResponse.error).toEqual('too_many_readings');

    parsedResponse = parseInboundPatientMessage('my first reading is 123 456');
    expect(parsedResponse.error).toEqual('too_many_readings');
  });

  it('returns a parsed glucose reading when given a single number', () => {
    const parsedResponse = parseInboundPatientMessage('my score is 100');

    expect(parsedResponse.error).toBeUndefined();
    expect(parsedResponse.glucoseReading).toEqual({
      score: 100,
      classification: 'green',
    });
  });
});

describe('classifyGlucoseValue', () => {
  it('can handle very low values', () => {
    expect(classifyGlucoseValue(32)).toEqual('<70');
  });

  it('can handle low values', () => {
    expect(classifyGlucoseValue(72)).toEqual('<80');
  });

  it('can handle good values', () => {
    expect(classifyGlucoseValue(85)).toEqual('green');
  });

  it('can handle moderate values', () => {
    expect(classifyGlucoseValue(131)).toEqual('yellow');
  });

  it('can handle high values', () => {
    expect(classifyGlucoseValue(181)).toEqual('red');
  });

  it('can handle very high values', () => {
    expect(classifyGlucoseValue(301)).toEqual('>300');
  });
});
