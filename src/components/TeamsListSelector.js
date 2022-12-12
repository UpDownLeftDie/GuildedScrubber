import React from 'react';
import ListSelector from './ListSelector';
import GuildedFetcher from '../GuildedFetcher';

const TeamsListSelector = ({ teams, setTeamChannels }) => {
  const guildedFetcher = GuildedFetcher.getInstance();

  const onSubmit = async (items) => {
    const initLength = items.length;
    items = items.filter((item) => item !== 'dm');
    const getDMs = initLength !== items.length;

    if (getDMs) {
      guildedFetcher.GetDMChannels();
    }
    const teamChannels = await guildedFetcher.GetTeamChannelsFromTeams(items);

    const filteredTeamChannels = Object.fromEntries(
      Object.entries(teamChannels).filter(([key]) => {
        console.log(key, items, items.includes(key));
        if (getDMs && key === 'dm') return true;
        return items.includes(key);
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
