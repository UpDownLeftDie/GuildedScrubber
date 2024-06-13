import HTTPMethod from "http-method-enum";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export enum ChannelType {
  ANNOUNCEMENTS = "announcements",
  AVAILABILITY = "availability",
  FORUMS = "forums",
  LIST_ITEMS = "listitems",
  MESSAGES = "messages",
}

export default class ChannelService {
  static async DeleteChannelEntity(
    req: NextApiRequest,
    channelId: string,
    channelType: ChannelType,
    entityId: string,
  ) {
    const endpoint = `/channels/${channelId}/${channelType}/${entityId}`;
    return await ApiService.FetchGuilded(req, endpoint, HTTPMethod.DELETE);
  }
}
