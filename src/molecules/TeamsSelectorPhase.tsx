import MultiListSelector, { CheckItemsLists } from "@/components/MultiListSelector";
import { Dispatch, SetStateAction } from "react";
import { Channel, Team, User } from "../classes";
import { ContentContainer } from "../templates";

const description =
  "Pick teams you want to load channels from. You will pick which channels to act on in the next step.";

interface props {
  user: User;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  nextPhase: () => void;
}
const TeamsSelectorPhase = ({ user, isLoading, setIsLoading, nextPhase }: props) => {
  const sectionNameSingular = "team";
  const sectionName = `${sectionNameSingular}s`;

  const onSubmit = async (selectedItemsList: CheckItemsLists) => {
    const teamNames = selectedItemsList.get("Teams");
    if (!teamNames) return;
    setIsLoading(true);

    const teams: Team[] = [];
    teamNames.forEach((teamName) => {
      const team = user.teams.find((team) => team.name === teamName);
      if (!team) return;
      const filteredChannels = Channel.FilterChannelsByMode(team.channels, user.settings.mode);
      team.channels = filteredChannels;
      teams.push(team);
    });

    if (teamNames.includes("DMs")) {
      await user.LoadDMs();
    }

    user.settings.selectedTeams = teams;
    setIsLoading(false);
    nextPhase();
  };

  function convertTeamsToCheckItemsList(teams: Team[]): CheckItemsLists {
    const listItems = teams.map((team) => team.name);
    return new Map([["Teams", listItems]]);
  }

  const checkItemsLists = convertTeamsToCheckItemsList(user.teams);

  return (
    <ContentContainer headerText={sectionName} description={description}>
      <MultiListSelector
        submitLabel="Load Channels"
        listsName="Teams"
        checkItemsLists={checkItemsLists}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </ContentContainer>
  );
};

export default TeamsSelectorPhase;
