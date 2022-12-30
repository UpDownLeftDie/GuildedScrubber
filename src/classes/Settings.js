export default class Settings {
  static MODES = {
    ENCRYPT: 'encrypt',
    DECRYPT: 'decrypt',
    DELETE: 'delete',
  };

  static SecretKeyLength = 32;

  static #ERRORS = {
    DATES_ORDER: "Invalid Dates: beforeDate can't be earlier than afterDate",
    SECRET_KEY_NOT_FOUND: 'No secret key set!',
    SECRET_KEY_LENGTH: `SecretKey *must* be ${Settings.SecretKeyLength} characters long`,
  };

  constructor({
    mode = Settings.MODES.ENCRYPT,
    secretKey = '',
    beforeDate = null,
    afterDate = null,
    shouldFetchDMs = false,
  } = {}) {
    this.isSet = false;
    this.mode = mode;
    this.secretKey = secretKey;
    this.beforeDate = beforeDate;
    this.afterDate = afterDate;
    this.shouldFetchDMs = shouldFetchDMs;
  }

  static Validate(settings) {
    const { mode } = settings;
    let errors = [];

    if (mode !== Settings.MODES.DELETE) {
      const { errors: secretKeyErrors } = Settings.ValidateSecretKey(settings);
      errors = [...errors, ...secretKeyErrors];
    }

    const { errors: dateErrors } = Settings.ValidateDates(settings);
    errors = [...errors, ...dateErrors];

    const isValid = !errors.length;
    return { isValid, errors };
  }

  static ValidateDates(settings) {
    const { beforeDate, afterDate } = settings;
    let errors = [];
    if (beforeDate && afterDate) {
      if (afterDate >= beforeDate) {
        errors.push(Settings.#ERRORS.DATES_ORDER);
      }
    }

    const isValid = !errors.length;
    return { isValid, errors };
  }

  static ValidateSecretKey(settings) {
    const { secretKey } = settings;
    let errors = [];
    if (!secretKey) {
      return {
        isValid: false,
        errors: [Settings.#ERRORS.SECRET_KEY_NOT_FOUND],
      };
    }

    if (secretKey.length !== this.SecretKeyLength) {
      errors.push(Settings.#ERRORS.SECRET_KEY_LENGTH);
    }

    const isValid = !errors.length;
    return { isValid, errors };
  }
}
