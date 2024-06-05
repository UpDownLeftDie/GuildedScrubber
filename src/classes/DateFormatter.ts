export default class DateFormatter {
  static FormatDate(date: Date): string {
    if (!date) return "";
    try {
      return date.toISOString().slice(0, 16);
    } catch (e) {
      console.error(e, date);
      return "";
    }
    // return (
    //   [
    //     date.getFullYear(),
    //     DateFormatter.#padTo2Digits(date.getMonth() + 1),
    //     DateFormatter.#padTo2Digits(date.getDate()),
    //   ].join("-") +
    //   " " +
    //   [
    //     DateFormatter.#padTo2Digits(date.getHours()),
    //     DateFormatter.#padTo2Digits(date.getMinutes()),
    //     DateFormatter.#padTo2Digits(date.getSeconds()),
    //   ].join(":")
    // );
  }

  static #padTo2Digits(num: number): string {
    return num.toString().padStart(2, "0");
  }
}
