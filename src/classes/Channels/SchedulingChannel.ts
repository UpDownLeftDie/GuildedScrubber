import { Message, User } from "@/classes";
import { Dispatch, SetStateAction } from "react";
import { ChannelEndpoint } from "../Channel";
import { GuildedMessage, GuildedMessageContentsById } from "../Message";

export default class SchedulingChannel {
  static async Process({
    user,
    channelId,
    setAction,
    limit = 100,
  }: {
    user: User;
    channelId: string;
    setAction: Dispatch<SetStateAction<string>>;
    limit?: number;
  }) {
    const { settings } = user;
    let { beforeDate, afterDate } = settings;
    let entries: AvailabilityEntry[] = [];
    let entryCount = 0;
    do {
      setAction("Loading availability/schedule entries");
      entries = await Message.GetMessages<AvailabilityEntry>(
        channelId,
        ChannelEndpoint.AVAILABILITY,
        {
          beforeDate,
          afterDate,
          maxItems: limit,
        },
      );

      console.log({ entries });

      if (!entries?.length) break;
      beforeDate = new Date(entries[entries.length - 1].createdAt);

      const filteredEntries = entries.reduce((acc, entry) => {
        if (entry.userId === user.id) {
          acc[entry.id] = {} as GuildedMessage;
        }
        return acc;
      }, {} as GuildedMessageContentsById);
      const length = Object.keys(filteredEntries).length;
      if (!length) {
        continue;
      }
      entryCount += length;

      setAction("Deleting availability/schedule Entries");
      await Message.DeleteMessages(channelId, ChannelEndpoint.AVAILABILITY, filteredEntries);
    } while (entries?.length >= limit);

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
