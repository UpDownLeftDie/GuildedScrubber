import React, { useState, useEffect } from 'react';
import GuildedScrubber from '../GuildedScrubber';
import { ContentContainer } from '../templates';

const Progress = ({
  user,
  mode,
  passphrase,
  channels,
  beforeDate,
  afterDate,
}) => {
  const [channelsCount, setChannelsCount] = useState(1);
  const [action, setAction] = useState('');
  const [history, setHistory] = useState({});

  useEffect(() => {
    GuildedScrubber.ScrubChannels(
      user.id,
      channels,
      mode,
      passphrase,
      beforeDate,
      afterDate,
      setChannelsCount,
      setAction,
      setHistory,
    );
  }, []);

  return (
    <ContentContainer headerText={'Scrubbing...'}>
      {channelsCount} of {channels.length} Channels
      <br />
      <progress value={channelsCount} max={channels.length} />
      <br />
      <div>Currently: {action}</div>
    </ContentContainer>
  );
};

export default Progress;
