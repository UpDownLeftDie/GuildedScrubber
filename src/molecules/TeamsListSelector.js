import React from 'react';
import { ContentWithHeader } from '../templates';
import { ListSelector } from '../components';
import GuildedScrubber from '../GuildedScrubber';

const TeamsListSelector = ({ user, setTeams }) => {
  const sectionNameSingular = 'Team';
  const sectionName = `${sectionNameSingular}s`;
  const onSubmit = async (sections) => {
    let teamIds = sections[sectionName];
    const shouldFetchDMs = teamIds.has('dm');
    teamIds.delete('dm');
    teamIds = Array.from(teamIds);
    const teams = await GuildedScrubber.GetAllTeams(teamIds, shouldFetchDMs);

    const fullTeams = Object.entries(teams).reduce((acc, [teamId, team]) => {
      const teamInfo = user.teams.find((userTeam) => userTeam.id === teamId);
      acc[teamId] = { ...teamInfo, ...team };
      return acc;
    }, {});

    setTeams(fullTeams);
  };

  const teamsCollectionArray = [
    {
      sectionName,
      items: user.teams,
    },
  ];
  return (
    <ContentWithHeader headerText={'Teams'}>
      <ListSelector
        itemCollectionsArray={teamsCollectionArray}
        submitLabel="Load Channels"
        listName={sectionNameSingular}
        onSubmit={onSubmit}
      />
    </ContentWithHeader>
  );
};

export default TeamsListSelector;
