import * as React from 'react';
import { ContentContainer } from '../templates';
import { ListSelector } from '../components';
import { SelectableList } from '../classes';

const description =
  'Select which channels you would like to delete/encrypt/decrypt your messages from.';

const ChannelSelectorPhase = ({ user }) => {
  const sectionNameSingular = 'Channel';
  const sectionName = `${sectionNameSingular}s`;

  const onSubmit = async (teamsChannels) => {
    const selectedChannels = teamsChannels.map((channel) => ({
      id: channel.id,
      type: channel.contentType,
      teamName: channel.parentName,
    }));

    // setSelectedChannels(selectedChannels);
  };

  // function getChannelCollections(teams) {
  //   return Object.values(teams).map((team) => {
  //     return { sectionName: team.name, items: team.channels };
  //   });
  // }

  // const channelCollections = getChannelCollections(teams);

  const selectableList = new SelectableList(user.teams, 'channels');
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
