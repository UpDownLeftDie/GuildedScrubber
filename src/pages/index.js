import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { LoadUser, TeamsListSelector, ChannelListSelector } from '../molecules';

const pageStyles = {
  color: '#ececee',
  padding: 96,
  fontFamily: 'Roboto, sans-serif, serif',
  textAlign: 'center',
  maxWidth: 900,
  display: 'flex',
  flexDirection: 'column',
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
};
const sloganStyles = {
  color: '#f5c400',
  fontSize: '1.3rem',
  fontStyle: 'italic',
  display: 'inline-block',
};

const pageContentStyles = {};

const PHASE = {
  LOAD_USER: 1,
  LOAD_CHANNELS: 2,
  SET_OPTIONS: 3,
};

const IndexPage = () => {
  const [slogan, setSlogan] = useState('');
  const [currentPhase, _setPhase] = useState(PHASE.LOAD_USER);
  const setPhase = (phase) => {
    if (currentPhase < phase) {
      _setPhase(phase);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [hmac, _setHmac] = useState(Cookies.get('guilded-hmac') || '');
  const setHmac = (e) => {
    const hmac = e.target.value;
    _setHmac(hmac);
  };
  const [user, setUser] = useState(null);
  const [teamChannels, setTeamChannels] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [decryptMode, setDecryptMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    import('/static/slogans.json').then((slogans) => {
      const slogan = slogans[Math.floor(Math.random() * slogans.length)];
      setSlogan(`— ${slogan} 🎉🎉🎉`);
      setIsLoading(false); // important to cause rerender for button
    });
  }, []);

  useEffect(() => {
    if (user?.teams && !teamChannels) setPhase(PHASE.LOAD_CHANNELS);
  }, [user]);

  useEffect(() => {
    if (teamChannels) setPhase(PHASE.SET_OPTIONS);
  }, [teamChannels]);

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
        ) : currentPhase === PHASE.LOAD_CHANNELS ? (
          <TeamsListSelector
            teams={user.teams}
            setTeamChannels={setTeamChannels}
          />
        ) : currentPhase === PHASE.SET_OPTIONS ? (
          <ChannelListSelector userId={user.id} teamChannels={teamChannels} />
        ) : null}
      </div>
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
