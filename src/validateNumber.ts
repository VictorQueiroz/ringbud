import RingBufferException from "./RingBufferException";

interface IValidateNumberOptions {
  name: string;
  value: number;
  validations: {
    integer: boolean;
    min: number;
    max: number;
  };
}

export default function validateNumber({
  name,
  value,
  validations
}: IValidateNumberOptions) {
  const errors = new Array<string>();
  if (validations.integer && !Number.isSafeInteger(value)) {
    errors.push("It must be an integer.");
  }
  if (value > validations.max) {
    errors.push(`It must be up to ${validations.max}.`);
  }
  if (value < validations.min) {
    errors.push(`It must be at least ${validations.min}.`);
  }
  if (errors.length > 0) {
    throw new RingBufferException(
      [
        `"${value}" is not a valid value for ${name}. It failed to following validations:\n`,
        ...errors.map((error) => `\t- ${error}`)
      ].join("")
    );
  }
  return value;
}
