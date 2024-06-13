import { ChannelEndpoint } from "@/classes/Channel";
import HTTPMethod from "http-method-enum";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class ChannelService {
  static async DeleteChannelEntity(
    req: NextApiRequest,
    channelId: string,
    channelType: ChannelEndpoint,
    entityId: string,
  ) {
    "use server";
    const endpoint = `/channels/${channelId}/${channelType}/${entityId}`;
    return await ApiService.FetchGuilded(req, endpoint, HTTPMethod.DELETE);
  }
}
