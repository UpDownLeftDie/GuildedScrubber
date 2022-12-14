import * as React from 'react';
import { ContentWithHeader } from '../templates';
import { ListSelector } from '../components';
import GuildedScrubber from '../GuildedScrubber';

const ChannelListSelector = ({ userId, teams, decryptMode, deleteMode }) => {
  const sectionNameSingular = 'Channel';
  const sectionName = `${sectionNameSingular}s`;
  const label = decryptMode
    ? 'Decrypt messages'
    : deleteMode
    ? 'Delete messages (unrecoverable)'
    : 'Encrypt messages (recoverable)';

  const onSubmit = async (items) => {
    if (decryptMode) {
    }
    if (deleteMode) {
      if (
        !window.confirm(
          'You have selected delete mode. You will delete all your messages in the selected channels. This is unrecoverable!',
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          'You are about to encrypt messages in the selected channel. Make sure you back up your passphrase if you ever want to decrypt them',
        )
      ) {
        return;
      }
    }

    GuildedScrubber.ScrubChannels(userId, items, decryptMode, deleteMode);
  };

  function getChannelCollections(teams) {
    return Object.values(teams).map((team) => {
      return { sectionName: team.name, items: team.channels };
    });
  }

  const channelCollections = getChannelCollections(teams);
  return (
    <ContentWithHeader headerText={'Channels'}>
      <ListSelector
        itemCollectionsArray={channelCollections}
        submitLabel={label}
        onSubmit={onSubmit}
        listName={sectionName}
      />
    </ContentWithHeader>
  );
};

export default ChannelListSelector;
