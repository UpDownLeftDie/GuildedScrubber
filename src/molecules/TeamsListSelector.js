import React from 'react';
import { ListSelector } from '../components';
import GuildedScrubber from '../GuildedScrubber';

const TeamsListSelector = ({ teams, setTeamChannels }) => {
  const onSubmit = async (teams) => {
    const initLength = teams.length;
    teams = teams.filter((team) => team !== 'dm');
    const getDMs = initLength !== teams.length;

    // const teamChannels = await guildedFetcher.GetTeamChannelsFromTeams(items);
    const teamChannels = await GuildedScrubber.GetAllTeamChannels(
      teams,
      getDMs,
    );
    console.log({ teamChannels });
    const filteredTeamChannels = Object.fromEntries(
      Object.entries(teamChannels).filter(([key]) => {
        if (getDMs && key === 'dm') return true;
        return teams.includes(key);
      }),
    );
    console.log({ filteredTeamChannels });
    setTeamChannels(filteredTeamChannels);
  };

  teams.unshift({ name: 'DMs', id: 'dm' });
  return (
    <ListSelector
      items={teams}
      groupName="Teams"
      submitLabel="Load Channels"
      onSubmit={onSubmit}
    />
  );
};

export default TeamsListSelector;
