import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class ListService {
  static async GetListItems(
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
    const endpoint = `/channels/${channelId}/listitems?${params.toString()}`;

    const listItems = (await ApiService.FetchGuilded(req, endpoint)) ?? [];
    console.log({ listItems, totalLength: listItems.length });

    return listItems;
  }
}
