import { GuildedChannel } from "@/classes/Channel";
import { SelectableList, Team, User } from "../classes";
import { ListSelector } from "../components";
import { ContentContainer } from "../templates";

const description =
  "Select which channels you would like to delete/encrypt/decrypt your messages from.";

const ChannelSelectorPhase = ({ user, nextPhase }: { user: User; nextPhase: () => void }) => {
  const sectionNameSingular = "Channel";
  const sectionName = `${sectionNameSingular}s`;

  const onSubmit = async (teamsChannels) => {
    const selectedChannels: Set<GuildedChannel> = new Set();
    for (const [teamName, channelIds] of teamsChannels.entries()) {
      const team = Team.GetTeamByName(teamName, user.settings.selectedTeams);
      if (!team) return;
      channelIds.delete("_all");
      for (const channelId of channelIds) {
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

  const selectableList = new SelectableList(user.settings.selectedTeams, "channels");
  return (
    <ContentContainer headerText={sectionName} description={description}>
      <ListSelector
        selectableList={selectableList}
        submitLabel="Scrub"
        forFrom=" "
        flavor="goldSolid"
        onSubmit={onSubmit}
        listName={sectionNameSingular}
      />
    </ContentContainer>
  );
};

export default ChannelSelectorPhase;
