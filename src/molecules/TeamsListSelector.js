import React from 'react';
import { ContentContainer } from '../templates';
import { ListSelector } from '../components';
import GuildedScrubber from '../GuildedScrubber';

const description =
  'Pick teams you want to load channels from. You will pick which channels to act on in the next step.';

const TeamsListSelector = ({ user, setTeams, isLoading, setIsLoading }) => {
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
      acc[teamId] = { ...teamInfo, ...team };
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
  return (
    <ContentContainer headerText={sectionName} description={description}>
      <ListSelector
        itemCollectionsArray={teamsCollectionArray}
        submitLabel="Load Channels"
        listName={sectionNameSingular}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </ContentContainer>
  );
};

export default TeamsListSelector;
