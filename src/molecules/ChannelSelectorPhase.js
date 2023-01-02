import * as React from 'react';
import { ContentContainer } from '../templates';
import { ListSelector } from '../components';
import { SelectableList, Team } from '../classes';

const description =
  'Select which channels you would like to delete/encrypt/decrypt your messages from.';

const ChannelSelectorPhase = ({ user, nextPhase }) => {
  const sectionNameSingular = 'Channel';
  const sectionName = `${sectionNameSingular}s`;

  const onSubmit = async (teamsChannels) => {
    const selectedChannels = new Set();
    for (const [teamName, channelIds] of teamsChannels.entries()) {
      const team = Team.GetTeamByName(teamName, user.settings.selectedTeams);
      channelIds.delete('_all');
      for (const channelId of channelIds) {
        const channel = team.channels.get(channelId);
        selectedChannels.add({
          ...channel,
          teamName,
        });
      }
    }

    user.settings.selectedChannels = selectedChannels;
    console.log({ selectedChannels });
    nextPhase();
  };

  const selectableList = new SelectableList(
    user.settings.selectedTeams,
    'channels',
  );
  return (
    <ContentContainer headerText={sectionName} description={description}>
      <ListSelector
        selectableList={selectableList}
        submitLabel="Scrub"
        forFrom=" "
        flavor="goldSolid"
        onSubmit={onSubmit}
        listName={sectionNameSingular}
      />
    </ContentContainer>
  );
};

export default ChannelSelectorPhase;
