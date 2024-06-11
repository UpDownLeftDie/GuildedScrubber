import HTTPMethod from "http-method-enum";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export enum EntityType {
  AVAILABILITY = "availability",
  MESSAGES = "messages",
}

export default class ChannelService {
  static async DeleteChannelEntity(
    req: NextApiRequest,
    channelId: string,
    entityType: EntityType,
    entityId: string,
  ) {
    const endpoint = `/channels/${channelId}/${entityType}/${entityId}`;
    return await ApiService.FetchGuilded(req, endpoint, HTTPMethod.DELETE);
  }
}
