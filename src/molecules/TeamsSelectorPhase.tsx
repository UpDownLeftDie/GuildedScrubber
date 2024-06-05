import { Dispatch, SetStateAction } from "react";
import { Channel, SelectableList, User } from "../classes";
import { ListSelector } from "../components";
import { ContentContainer } from "../templates";

const description =
  "Pick teams you want to load channels from. You will pick which channels to act on in the next step.";

const DMs = "DMs";

interface props {
  user: User;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  nextPhase: () => void;
}
const TeamsSelectorPhase = ({ user, isLoading, setIsLoading, nextPhase }: props) => {
  const sectionNameSingular = "Team";
  const sectionName = `${sectionNameSingular}s`;
  const onSubmit = async (selectedTeams) => {
    setIsLoading(true);

    let teamIds: Set<string> = new Set();

    if (selectedTeams.get(DMs).size) {
      await user.LoadDMs();
      teamIds.add("DMs");
    }

    teamIds = new Set([...teamIds, ...selectedTeams.get(sectionName)]);

    const teams = new Map();
    teamIds.forEach((teamId) => {
      const team = user.teams.find(team => team.id === teamId);
      if (!team) return;
      const filteredChannels = Channel.FilterChannelsByMode(team.channels, user.settings.mode);
      team.channels = filteredChannels;
      teams.set(team.id, team);
    });

    setIsLoading(false);
    user.settings.selectedTeams = teams;
    nextPhase();
  };

  const teamsCollection = new Map([
    [0, { name: DMs }],
    [1, { name: sectionName, teams: user.teams }],
  ]);
  const selectableList = new SelectableList(teamsCollection, "teams");
  return (
    <ContentContainer headerText={sectionName} description={description}>
      <ListSelector
        submitLabel="Load Channels"
        selectableList={selectableList}
        listName={sectionNameSingular}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </ContentContainer>
  );
};

export default TeamsSelectorPhase;
