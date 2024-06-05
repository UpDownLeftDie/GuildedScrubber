import { Dispatch, SetStateAction } from "react";
import User from "./User";

export default class ForumChannel {
  static async Process({
    user,
    channelId,
    setAction,
    deleteMode,
    decryptMode,
    maxItems,
  }: {
    user: User;
    channelId: string;
    setAction: Dispatch<SetStateAction<string>>;
    deleteMode: boolean;
    decryptMode: boolean;
    maxItems: number;
  }) {
    const { settings } = user;
    const { secretKey } = settings;
    let { beforeDate, afterDate } = settings;
    return 0;
  }
}
