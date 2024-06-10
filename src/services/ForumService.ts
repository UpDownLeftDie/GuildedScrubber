import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class ForumService {
  static async GetThreads(
    req: NextApiRequest,
    channelId: string,
    page?: number,
    maxItems?: number,
  ) {
    const { threads } = await _getThreads(req, channelId, page, maxItems);
    console.log({ threads, totalLength: threads.length });

    return threads;
  }
}

async function _getThreads(req: NextApiRequest, channelId: string, page = 1, maxItems = 1000) {
  let params = new URLSearchParams();
  params.append("maxItems", maxItems.toString());
  params.append("page", page.toString());
  const endpoint = `/channels/${channelId}/forums?${params.toString()}`;
  const res = await ApiService.FetchGuilded(req, endpoint);
  let { threads = [] } = res;

  console.log({ initialLength: threads.length });
  return { threads };
}
