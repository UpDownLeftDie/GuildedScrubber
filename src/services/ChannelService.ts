import { ChannelEndpoint } from "@/classes/Channel";
import HTTPMethod from "http-method-enum";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";

interface ChannelServiceOptions {
  messageLimit?: number;
  maxItems?: number;
  page?: number;
  beforeDate?: string;
  afterDate?: string;
}

export default class ChannelService {
  static async GetChannelEntity(
    req: NextApiRequest,
    channelId: string,
    channelType: ChannelEndpoint,
    options?: ChannelServiceOptions,
  ) {
    let params = new URLSearchParams();
    if (options?.messageLimit) {
      params.append("limit", options.messageLimit.toString());
    } else if (options?.maxItems) {
      params.append("maxItems", options.maxItems.toString());
    }
    if (options?.page) params.append("page", options.page.toString());
    if (options?.beforeDate) params.append("beforeDate", options.beforeDate);
    if (options?.afterDate) params.append("afterDate", options.afterDate);

    const endpoint = `/channels/${channelId}/${channelType}?${params.toString()}`;
    return await ApiService.FetchGuilded(req, endpoint);
  }

  static async UpdateChannelEntity(
    req: NextApiRequest,
    channelId: string,
    channelType: ChannelEndpoint,
    entityId: string,
    body: string,
  ) {
    const endpoint = `/channels/${channelId}/${channelType}/${entityId}`;
    return await ApiService.FetchGuilded(req, endpoint, HTTPMethod.PUT, body);
  }

  static async DeleteChannelEntity(
    req: NextApiRequest,
    channelId: string,
    channelType: ChannelEndpoint,
    entityId: string,
  ) {
    const endpoint = `/channels/${channelId}/${channelType}/${entityId}`;
    return await ApiService.FetchGuilded(req, endpoint, HTTPMethod.DELETE);
  }
}
