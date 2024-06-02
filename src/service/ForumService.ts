export default class ForumService {
  static async GetThreads({ hmac, channelId, maxItems, page }) {
    const { threads } = await _getThreads({
      hmac,
      channelId,
      maxItems,
      page,
    });
    console.log({ threads, totalLength: threads.length });

    return threads;
  }
}

async function _getThreads({ hmac, channelId, maxItems = 1000, page = 1 }) {
  let params = new URLSearchParams();
  params.append("maxItems", maxItems);
  params.append("page", page);
  const url = `/channels/${channelId}/forums?${params.toString()}`;
  const res = await ApiService.FetchGuilded({ hmac, url });
  let { threads = [] } = res;

  console.log({ initialLength: threads.length });
  return { threads };
}
