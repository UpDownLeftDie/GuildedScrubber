import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class AnnouncementService {
  static async GetAnnouncements(
    req: NextApiRequest,
    channelId: string,
    {
      maxItems = 1000,
      beforeDate,
      afterDate,
    }: {
      maxItems?: number;
      beforeDate?: string;
      afterDate?: string;
    },
  ) {
    let params = new URLSearchParams();
    params.append("maxItems", maxItems.toString());
    if (beforeDate) params.append("beforeDate", beforeDate);
    if (afterDate) params.append("afterDate", afterDate);
    const endpoint = `/channels/${channelId}/announcements?${params.toString()}`;

    const { announcements = [] } = await ApiService.FetchGuilded(req, endpoint);

    console.log({ announcements, totalLength: announcements.length });

    return announcements;
  }
}
