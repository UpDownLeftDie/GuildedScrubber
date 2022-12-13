import * as React from 'react';
import { ListSelector } from '../components';
import GuildedScrubber from '../GuildedScrubber';

const ChannelListSelector = ({
  userId,
  teamChannels,
  decryptMode,
  deleteMode,
}) => {
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

  const lists = Object.entries(teamChannels).map(([team, channels]) => {
    console.log({ team, channels });
    return (
      <div key={team}>
        <span>{team}</span>
        <ListSelector
          items={channels}
          groupName={team}
          submitLabel={label}
          onSubmit={onSubmit}
        />
      </div>
    );
  });

  return <div>{lists}</div>;
};

export default ChannelListSelector;
