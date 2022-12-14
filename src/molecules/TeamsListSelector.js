import React from 'react';
import { ListSelector } from '../components';
import GuildedScrubber from '../GuildedScrubber';

const TeamsListSelector = ({ teams, setTeamChannels }) => {
  const onSubmit = async ({ Teams }) => {
    const shouldFetchDMs = Teams.has('dm');
    Teams.delete('dm');

    const teamChannels = await GuildedScrubber.GetAllTeamChannels(
      teams,
      shouldFetchDMs,
    );
    console.log({ teamChannels });
    const filteredTeamChannels = Object.fromEntries(
      Object.entries(teamChannels).filter(([key]) => {
        if (shouldFetchDMs && key === 'dm') return true;
        return teams.includes(key);
      }),
    );
    console.log({ filteredTeamChannels });
    setTeamChannels(filteredTeamChannels);
  };

  // teams.unshift({ name: 'DMs', id: 'dm' });
  const teamsCollectionArray = [
    {
      section: 'Teams',
      items: teams,
    },
  ];
  return (
    <ListSelector
      itemCollectionsArray={teamsCollectionArray}
      groupName="Teams"
      submitLabel="Load Channels"
      onSubmit={onSubmit}
    />
  );
};

export default TeamsListSelector;
