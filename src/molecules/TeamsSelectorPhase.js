import React from 'react';
import { ContentContainer } from '../templates';
import { ListSelector } from '../components';
import { Channel, SelectableList } from '../classes';

const description =
  'Pick teams you want to load channels from. You will pick which channels to act on in the next step.';

const TeamsSelectorPhase = ({
  user,
  isLoading,
  setIsLoading,
  mode,
  nextPhase,
}) => {
  const sectionNameSingular = 'Team';
  const sectionName = `${sectionNameSingular}s`;
  const onSubmit = async (selectedTeams) => {
    setIsLoading(true);
    const teamIds = selectedTeams.get(sectionName);
    console.log({ selectedTeams, teamIds, teams: user.teams });

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

    // const teams = user.teams.reduce((acc, [teamId, team]) => {
    //   const teamInfo = user.teams.find((userTeam) => userTeam.id === teamId);

    //   const filteredChannels = GuildedScrubber.FilterChannelsByMode(
    //     team.channels,
    //     mode,
    //   );
    //   console.log({ teams: team.channels, filteredChannels });
    //   acc[teamId] = { ...teamInfo, ...team, channels: filteredChannels };
    //   return acc;
    // }, {});

    setIsLoading(false);
    user.settings.selectedTeams = teams;
    nextPhase();
  };

  const selectableList = new SelectableList(
    new Map([[null, { name: sectionName, teams: user.teams }]]),
    'teams',
  );
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
