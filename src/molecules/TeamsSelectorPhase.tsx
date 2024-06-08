import { GSCheckbox } from "@/atoms";
import { Team } from "@/classes";
import User, { GuildedUserTeam } from "@/classes/User";
import MultiListSelector, { CheckListItems, CheckLists } from "@/components/MultiListSelector";
import { ContentContainer } from "@/templates";
import { Dispatch, SetStateAction, useState } from "react";

const description = "Pick teams you want to load channels from.";

interface props {
  user: User;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  nextPhase: () => void;
}
const TeamsSelectorPhase = ({ user, isLoading, setIsLoading, nextPhase }: props) => {
  const sectionNameSingular = "team";
  const sectionName = `${sectionNameSingular}s`;

  const [isDMsChecked, setIsDMsChecked] = useState(false);
  function handleOnChange() {
    setIsDMsChecked((isChecked) => !isChecked);
  }

  async function onSubmit(selectedItemsList: CheckLists = new Map()) {
    const teamNames = selectedItemsList.get("Teams");
    if (!teamNames && !isDMsChecked) return;
    setIsLoading(true);

    const guildedTeams: GuildedUserTeam[] = [];
    teamNames?.forEach((teamName) => {
      const guildedTeam = user.guildedUserTeams.find((team) => team.name === teamName);
      if (!guildedTeam) return;
      guildedTeams.push(guildedTeam);
    });
    const [selectedTeams, dms] = await Promise.all([
      user.LoadTeams(guildedTeams),
      isDMsChecked ? user.LoadDMs() : Promise.resolve({} as Team),
    ]);

    // const filteredChannels = Channel.FilterChannelsByMode(team.channels, user.settings.mode);
    // team.channels = filteredChannels;
    // teams.push(team);

    if (dms?.channels?.length) {
      selectedTeams.unshift(dms);
    }
    user.settings.selectedTeams = selectedTeams;
    setIsLoading(false);
    nextPhase();
  }

  function convertTeamsToCheckLists(teams: GuildedUserTeam[]): CheckLists {
    const listItems: CheckListItems = new Map(teams.map((team) => [team.id, team.name]));
    return new Map([["Teams", listItems]]);
  }

  const checkLists = convertTeamsToCheckLists(user.guildedUserTeams);

  return (
    <ContentContainer headerText={sectionName} description={description}>
      <GSCheckbox value={"DMs"} checked={isDMsChecked} onChange={handleOnChange}>
        Direct Messages
      </GSCheckbox>
      <br />
      <br />
      <MultiListSelector
        submitLabel="Load Channels"
        listsName="Teams"
        checkLists={checkLists}
        onSubmit={onSubmit}
        isLoading={isLoading}
        additionalSelectedCount={isDMsChecked ? 1 : 0}
      />
    </ContentContainer>
  );
};

export default TeamsSelectorPhase;
