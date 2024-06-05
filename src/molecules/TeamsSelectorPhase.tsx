import React, { Dispatch, SetStateAction } from 'react';
import { ContentContainer } from '../templates';
import { ListSelector } from '../components';
import { Channel, SelectableList, User } from '../classes';

const description =
  'Pick teams you want to load channels from. You will pick which channels to act on in the next step.';

const DMs = 'DMs';

interface props {
  user: User
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
  mode?: any,
  nextPhase: () => void
}
const TeamsSelectorPhase = ({
  user,
  isLoading,
  setIsLoading,
  mode,
  nextPhase,
}: props) => {
  const sectionNameSingular = 'Team';
  const sectionName = `${sectionNameSingular}s`;
  const onSubmit = async (selectedTeams) => {
    setIsLoading(true);

    let teamIds: Set<string> = new Set();

    if (selectedTeams.get(DMs).size) {
      await user.LoadDMs();
      teamIds.add('DMs');
    }

    teamIds = new Set([...teamIds, ...selectedTeams.get(sectionName)]);

    const teams = new Map();
    teamIds.forEach((teamId) => {
      const team = user.teams.get(teamId);
      const filteredChannels = Channel.FilterChannelsByMode(
        team.channels,
        mode,
      );
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
  const selectableList = new SelectableList(teamsCollection, 'teams');
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
