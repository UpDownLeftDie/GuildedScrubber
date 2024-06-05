import { GuildedChannel } from "@/classes/Channel";
import { MultiListSelector } from "@/components";
import { CheckItemsLists } from "@/components/MultiListSelector";
import { ContentContainer } from "@/templates";
import { Team, User } from "../classes";

const description =
  "Select which channels you would like to delete/encrypt/decrypt your messages from.";

const ChannelSelectorPhase = ({ user, nextPhase }: { user: User; nextPhase: () => void }) => {
  const sectionNameSingular = "Channel";
  const sectionName = `${sectionNameSingular}s`;

  const onSubmit = async (selectedTeamChannels: CheckItemsLists) => {
    const selectedChannels: Set<GuildedChannel> = new Set();
    for (const [teamName, channelNames] of selectedTeamChannels.entries()) {
      const team = Team.GetTeamByName(teamName, user.settings.selectedTeams);
      if (!team) return;
      for (const channelName of channelNames) {
        const channel = team.channels.find((channel) => channel.name === channelName);
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

  function convertChannelsToCheckItemsList(teams: Team[]): CheckItemsLists {
    const teamsWithChannels: CheckItemsLists = new Map();
    teams.forEach((team) => {
      const listItems = team.channels.map((channel) => channel.name);
      teamsWithChannels.set(team.name, listItems);
    });

    return teamsWithChannels;
  }

  const checkItemsLists = convertChannelsToCheckItemsList(user.settings.selectedTeams);

  return (
    <ContentContainer headerText={sectionName} description={description}>
      <MultiListSelector
        checkItemsLists={checkItemsLists}
        submitLabel="Scrub"
        flavor="goldSolid"
        onSubmit={onSubmit}
        listsName={sectionNameSingular}
      />
    </ContentContainer>
  );
};

export default ChannelSelectorPhase;
