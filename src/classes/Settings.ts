import { ErrorListError } from "@/components/ErrorList";
import { GuildedChannel } from "./Channel";
import Team from "./Team";

export enum MODES {
  ENCRYPT = "encrypt",
  DECRYPT = "decrypt",
  DELETE = "delete",
}

export default class Settings {
  static SecretKeyLength = 32;

  static #ERRORS = {
    DATES_ORDER: "Invalid Dates: beforeDate can't be earlier than afterDate",
    SECRET_KEY_NOT_FOUND: "No secret key set!",
    SECRET_KEY_LENGTH: `SecretKey *must* be ${Settings.SecretKeyLength} characters long`,
  };

  mode: MODES;
  secretKey: string;
  beforeDate?: Date;
  afterDate?: Date;
  selectedTeams: Map<any, Team>;
  selectedChannels: Map<any, GuildedChannel>;

  constructor({
    mode = MODES.DELETE,
    secretKey = "",
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
    let errors: ErrorListError[] = [];

    if (mode !== MODES.DELETE) {
      const { errors: secretKeyErrors } = Settings.ValidateSecretKey(settings);
      errors = [...errors, ...secretKeyErrors];
    }

    const isValid = !errors.length;
    return { isValid, errors };
  }

  static ValidateSecretKey(settings: Settings) {
    const { secretKey } = settings;
    let errors: ErrorListError[] = [];
    if (!secretKey) {
      return {
        isValid: false,
        errors: [{ type: "SECRET_KEY_NOT_FOUND", text: Settings.#ERRORS.SECRET_KEY_NOT_FOUND }],
      };
    }

    if (secretKey.length !== this.SecretKeyLength) {
      errors.push({ type: "SECRET_KEY_LENGTH", text: Settings.#ERRORS.SECRET_KEY_LENGTH });
    }

    const isValid = !errors.length;
    return { isValid, errors };
  }
}
