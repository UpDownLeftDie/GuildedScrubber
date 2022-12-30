import React from 'react';
import { ContentContainer } from '../templates';
import { ListSelector } from '../components';
import { GuildedScrubber, SelectableList } from '../classes';

const description =
  'Pick teams you want to load channels from. You will pick which channels to act on in the next step.';

const TeamsSelectorPhase = ({
  user,
  setTeams,
  isLoading,
  setIsLoading,
  mode,
}) => {
  const sectionNameSingular = 'Team';
  const sectionName = `${sectionNameSingular}s`;
  const onSubmit = async (sectionsArray) => {
    setIsLoading(true);
    const teamIds = sectionsArray.map((team) => team.id);

    // const shouldFetchDMs = teamIds.has('dm');
    // teamIds.delete('dm');
    // teamIds = Array.from(teamIds);
    const teams = await GuildedScrubber.GetAllTeams(teamIds);

    const fullTeams = Object.entries(teams).reduce((acc, [teamId, team]) => {
      const teamInfo = user.teams.find((userTeam) => userTeam.id === teamId);
      console.log({ team });
      const filteredChannels = GuildedScrubber.FilterChannelsByMode(
        team.channels,
        mode,
      );
      console.log({ teams: team.channels, filteredChannels });
      acc[teamId] = { ...teamInfo, ...team, channels: filteredChannels };
      return acc;
    }, {});

    setIsLoading(false);
    setTeams(fullTeams);
  };

  const teamsCollectionArray = [
    {
      sectionName,
      items: user.teams,
    },
  ];

  const selectableList = new SelectableList(
    new Map([[null, { name: sectionName, teams: user.teams }]]),
    'teams',
  );
  console.log(selectableList);
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
