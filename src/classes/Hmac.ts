export default class Hmac {
  static Sanitize(_hmac: string | string[] | undefined): string {
    let hmac = "";
    if (Array.isArray(_hmac)) {
      hmac = _hmac.join("");
    } else if (_hmac) {
      hmac = _hmac;
    }

    return hmac.trim().replace(/[^0-9^a-z^A-Z^\.]/g, "");
  }
}
