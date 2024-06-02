export default class ForumChannel {
  static async Process({ user, channelId, setAction, deleteMode, decryptMode, messageLimit }) {
    const { settings } = user;
    const { secretKey } = settings;
    let { beforeDate, afterDate } = settings;
    return 0;
  }
}
