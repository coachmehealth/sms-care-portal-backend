const containsNumber = (input: string): boolean => {
  return /\b\d{2}\b/.test(input) || /\b\d{3}\b/.test(input);
};

const containsMany = (input: string): boolean => {
  const rex = /-?\d(?:[\d]*\.\d+|[\d]*)/g;
  let nums = 0;
  while (rex.exec(input)) {
    nums += 1;
    if (nums > 1) {
      return true;
    }
  }
  return false;
};

// regex function to get the number from the string (use in conjunction with contains)
// check for 2 digit number and if null check for 3 digit number
const getNumber = (input_s: string): any => {
  if (input_s.match(/\b\d{3}\b/g) != null) {
    return input_s.match(/\d{3}/g);
  }

  return input_s.match(/\b\d{2}\b/g);
};

// classify numeric user responses. We do not use spacing for the inequalities to be consistent, mostly for the mapping
// currently, we have this as a switch statement but ultimately we want to create some sort of data structure for this as well
const classifyNumeric = (input: string): string => {
  const number: number = parseInt(input, 10);
  if (number < 70) {
    return 'toolow';
  }
  if (number >= 70 && number <= 79) {
    return '<80';
  }
  if (number >= 80 && number <= 130) {
    return 'green';
  }
  if (number >= 131 && number <= 180) {
    return 'yellow';
  }
  if (number >= 181 && number <= 300) {
    return 'red';
  }

  return '>=301';
};

export { containsNumber, getNumber, classifyNumeric, containsMany };
