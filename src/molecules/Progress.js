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
      <br />
      <br />
      <div>
        <a
          href={`mailto:support@guilded.gg?subject=GDPR Account Deletion Request&body=I would like to withdrawal consent, restriction processing, and request full erasure of all my personal data. My UserId is ${user.id}`}
          target="_blank"
          rel="noopener noreferrer nofollow">
          Request account deletion
        </a>
        <br />
        OR
        <br />
        Email: support@guilded.gg
        <br />
        Message: I would like to withdrawal consent, restriction processing, and
        request full erasure of all my personal data. My UserId is {user.id}
      </div>
    </ContentContainer>
  );
};

export default Progress;
