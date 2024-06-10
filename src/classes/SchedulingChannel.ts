import { Dispatch, SetStateAction } from "react";
import FetchApi from "./FetchApi";
import User from "./User";

export default class SchedulingChannel {
  static async #GetAvailability({
    channelId,
    beforeDate,
    afterDate,
  }: {
    channelId: string;
    beforeDate: Date;
    afterDate: Date;
  }): Promise<AvailabilityEntry[]> {
    return await FetchApi({
      route: `channel/${channelId}/availability`,
      headers: new Headers([
        ["before-date", beforeDate.toISOString()],
        ["after-date", afterDate.toISOString()],
      ]),
    });
  }

  static async #DeleteAvailability(availabilityEntries: AvailabilityEntry[]) {
    for (const availabilityEntry of availabilityEntries) {
      console.log({
        availabilityEntry,
        channelId: availabilityEntry.channelId,
        id: availabilityEntry.id,
      });
      await FetchApi({
        route: `channel/${availabilityEntry.channelId}/availability/${availabilityEntry.id}`,
        method: "DELETE",
      });
    }
  }

  static async Process({
    user,
    channelId,
    setAction,
    messageLimit,
  }: {
    user: User;
    channelId: string;
    setAction: Dispatch<SetStateAction<string>>;
    messageLimit: number;
  }) {
    const { settings } = user;
    let { beforeDate, afterDate } = settings;
    let entries: AvailabilityEntry[] = [];
    let entryCount = 0;
    do {
      setAction("Loading availability/schedule entries");
      entries = await SchedulingChannel.#GetAvailability({
        channelId,
        beforeDate,
        afterDate,
      });

      console.log({ entries });

      if (!entries?.length) break;
      beforeDate = new Date(entries[entries.length - 1].createdAt);

      const filteredEntries = entries.filter((entry) => entry.userId === user.id);
      if (!filteredEntries?.length) {
        continue;
      }
      entryCount += filteredEntries.length;

      setAction("Deleting availability/schedule Entries");
      await SchedulingChannel.#DeleteAvailability(filteredEntries);
    } while (entries?.length >= messageLimit);

    return entryCount;
  }
}

interface AvailabilityEntry {
  id: number;
  availabilityId: number;
  teamId: string;
  channelId: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  startDate: string;
  endDate: string;
}
