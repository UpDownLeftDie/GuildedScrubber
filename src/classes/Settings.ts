export enum MODES {
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
  DELETE = 'delete',
}

export default class Settings {
  static SecretKeyLength = 32;

  static #ERRORS = {
    DATES_ORDER: "Invalid Dates: beforeDate can't be earlier than afterDate",
    SECRET_KEY_NOT_FOUND: 'No secret key set!',
    SECRET_KEY_LENGTH: `SecretKey *must* be ${Settings.SecretKeyLength} characters long`,
  };

  mode: MODES;
  secretKey: string;
  beforeDate?: string;
  afterDate?: string;
  selectedTeams: Map<any, any>;
  selectedChannels: Map<any, any>;

  constructor({
    mode = MODES.ENCRYPT,
    secretKey = '',
    beforeDate = undefined,
    afterDate = undefined,
  } = {}) {
    this.mode = mode;
    this.secretKey = secretKey;
    this.beforeDate = beforeDate;
    this.afterDate = afterDate;
    this.selectedTeams = new Map();
    this.selectedChannels = new Map();
  }

  static Validate(settings: Settings) {
    const { mode } = settings;
    let errors: string[] = [];

    if (mode !== MODES.DELETE) {
      const { errors: secretKeyErrors } = Settings.ValidateSecretKey(settings);
      errors = [...errors, ...secretKeyErrors];
    }

    const { errors: dateErrors } = Settings.ValidateDates(settings);
    errors = [...errors, ...dateErrors];

    const isValid = !errors.length;
    return { isValid, errors };
  }

  static ValidateDates(settings: Settings) {
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

  static ValidateSecretKey(settings: Settings) {
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
