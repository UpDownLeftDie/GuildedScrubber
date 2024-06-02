export default class DateFormatter {
  static FormatDate(date) {
    if (!date) return "";
    return (
      [
        date.getFullYear(),
        DateFormatter.#padTo2Digits(date.getMonth() + 1),
        DateFormatter.#padTo2Digits(date.getDate()),
      ].join("-") +
      " " +
      [
        DateFormatter.#padTo2Digits(date.getHours()),
        DateFormatter.#padTo2Digits(date.getMinutes()),
        DateFormatter.#padTo2Digits(date.getSeconds()),
      ].join(":")
    );
  }

  static #padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }
}
