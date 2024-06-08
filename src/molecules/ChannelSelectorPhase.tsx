import { Team, User } from "@/classes";
import { GuildedChannel } from "@/classes/Channel";
import { MultiListSelector } from "@/components";
import { CheckListItems, CheckLists } from "@/components/MultiListSelector";
import { ContentContainer } from "@/templates";
const description =
  "Select which channels you would like to delete/encrypt/decrypt your messages from.";

const ChannelSelectorPhase = ({ user, nextPhase }: { user: User; nextPhase: () => void }) => {
  const sectionNameSingular = "Channel";
  const sectionName = `${sectionNameSingular}s`;

  const onSubmit = async (selectedItemsList: CheckLists) => {
    const selectedChannels: Set<GuildedChannel> = new Set();
    for (const [teamName, channelsMappedById] of selectedItemsList.entries()) {
      console.log({ teamName, channelsMappedById });
      const team = Team.GetTeamByName(teamName, user.settings.selectedTeams);
      if (!team) return;
      for (const channelId of channelsMappedById.keys()) {
        const channel = team.channels.find((channel) => channel.id === channelId);
        if (!channel) continue;
        selectedChannels.add({
          ...channel,
          teamName,
        });
      }
    }

    user.settings.selectedChannels = selectedChannels;
    nextPhase();
  };

  function convertChannelsToCheckLists(teams: Team[]): CheckLists {
    const teamsWithChannels: CheckLists = new Map();
    teams.forEach((team) => {
      const listItems: CheckListItems = new Map(
        team.channels.map((channel) => {
          const channelName = `${channel.groupName ? `[${channel.groupName}] ` : ""}${channel.name}`;
          return [channel.id, channelName];
        }),
      );
      if (listItems.size) {
        teamsWithChannels.set(team.name, listItems);
      }
    });

    return teamsWithChannels;
  }

  console.log({ selectedTeams: user.settings.selectedTeams });
  const checkLists = convertChannelsToCheckLists(user.settings.selectedTeams);

  return (
    <ContentContainer headerText={sectionName} description={description}>
      <MultiListSelector
        checkLists={checkLists}
        submitLabel="Scrub"
        flavor="goldSolid"
        size="xl"
        onSubmit={onSubmit}
        listsName={sectionNameSingular}
      />
    </ContentContainer>
  );
};

export default ChannelSelectorPhase;
