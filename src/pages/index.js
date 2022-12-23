import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  ChannelListSelector,
  LoadUser,
  Progress,
  Settings,
  TeamsListSelector,
} from '../molecules';
import GuildedScrubber from '../GuildedScrubber';
const MODES = GuildedScrubber.MODES;

const pageStyles = {
  color: '#ececee',
  padding: '96px 0',
  marginLeft: 'auto',
  marginRight: 'auto',
  fontFamily: 'Roboto, sans-serif, serif',
  textAlign: 'center',
  maxWidth: 600,
  display: 'flex',
  flexDirection: 'column',
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 20,
};
const sloganStyles = {
  color: '#f5c400',
  fontSize: '1.3rem',
  fontStyle: 'italic',
  display: 'inline-block',
};

const pageContentStyles = {
  textAlign: 'left',
};

const PHASE = {
  LOAD_USER: 1,
  SELECT_TEAMS: 2,
  SELECT_CHANNELS: 3,
  SETTINGS: 4,
  RUNNING: 5,
};

const tagLine = "Don't delete your account till you've scrubbed it!";
const description = [
  'Delete all your message before you delete your account!',
  <br />,
  'Did you know that when you delete your account on Guilded your messages remain. If this bothers you, this tool is for you! Easily delete all your message with just a few clicks of a button.',
];

const IndexPage = () => {
  const [slogan, setSlogan] = useState('');
  const [currentPhase, setPhase] = useState(PHASE.LOAD_USER);
  const handlePhase = (phase) => {
    if (currentPhase < phase) {
      setPhase(phase);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [hmac, setHmac] = useState(Cookies.get('guilded-hmac') || '');
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState(null);
  const [beforeDate, setBeforeDate] = useState(null);
  const [afterDate, setAfterDate] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [mode, setMode] = useState(MODES.ENCRYPT);

  useEffect(() => {
    import('/static/slogans.json').then((slogans) => {
      const slogan = slogans[Math.floor(Math.random() * slogans.length)];
      setSlogan(`— ${slogan} 🎉🎉🎉`);
      setIsLoading(false); // important to cause rerender for button
    });
  }, []);

  useEffect(() => {
    if (user?.teams && !teams) handlePhase(PHASE.SELECT_TEAMS);
    if (teams) handlePhase(PHASE.SELECT_CHANNELS);
    if (selectedChannels) handlePhase(PHASE.SETTINGS);
    if (isRunning) handlePhase(PHASE.RUNNING);
  }, [user, teams, selectedChannels, isRunning]);

  return (
    <main style={pageStyles}>
      <div style={headingStyles}>
        <h1>
          Guilded Scrubber
          <br />
          <span style={sloganStyles}>{slogan}</span>
        </h1>
      </div>
      <div style={pageContentStyles}>
        {currentPhase === PHASE.LOAD_USER ? (
          <LoadUser
            hmac={hmac}
            setHmac={setHmac}
            user={user}
            setUser={setUser}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : currentPhase === PHASE.SELECT_TEAMS ? (
          <TeamsListSelector
            user={user}
            setTeams={setTeams}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : currentPhase === PHASE.SELECT_CHANNELS ? (
          <ChannelListSelector
            userId={user.id}
            teams={teams}
            setSelectedChannels={setSelectedChannels}
          />
        ) : currentPhase === PHASE.SETTINGS ? (
          <Settings
            mode={mode}
            setMode={setMode}
            passphrase={passphrase}
            setPassphrase={setPassphrase}
            beforeDate={beforeDate}
            setBeforeDate={setBeforeDate}
            afterDate={afterDate}
            setAfterDate={setAfterDate}
            setIsRunning={setIsRunning}
          />
        ) : currentPhase === PHASE.RUNNING ? (
          <Progress
            user={user}
            mode={mode}
            passphrase={passphrase}
            beforeDate={beforeDate}
            afterDate={afterDate}
            channels={selectedChannels}
          />
        ) : null}
      </div>
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
