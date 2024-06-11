import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class AvailabilityService {
  static async GetAvailabilities(
    req: NextApiRequest,
    channelId: string,
    {
      beforeDate,
      afterDate,
    }: {
      beforeDate?: string;
      afterDate?: string;
    },
  ) {
    let params = new URLSearchParams();
    if (beforeDate) params.append("beforeDate", beforeDate);
    if (afterDate) params.append("afterDate", afterDate);
    const endpoint = `/channels/${channelId}/availability?${params.toString()}`;

    const availabilities = (await ApiService.FetchGuilded(req, endpoint)) ?? [];
    console.log({ availabilities, totalLength: availabilities.length });

    return availabilities;
  }
}
