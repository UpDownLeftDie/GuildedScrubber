import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { LoadUser, TeamsListSelector, ChannelListSelector } from '../molecules';

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

const pageContentStyles = {};

const PHASE = {
  LOAD_USER: 1,
  LOAD_CHANNELS: 2,
  SET_OPTIONS: 3,
};

const IndexPage = () => {
  const [slogan, setSlogan] = useState('');
  const [currentPhase, setPhase] = useState(PHASE.LOAD_USER);
  const handlePhase = (phase) => {
    if (currentPhase < phase) {
      setPhase(phase);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [hmac, setHmac] = useState(Cookies.get('guilded-hmac') || '');
  const handleHmac = (e) => {
    const hmac = e.target.value;
    setHmac(hmac);
  };
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState(null);
  // const [beforeDate, setBeforeDate] = useState(null);
  // const [afterDate, setAfterDate] = useState(null);
  // const [passphrase, setPassphrase] = useState('');
  // const [decryptMode, setDecryptMode] = useState(false);
  // const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    import('/static/slogans.json').then((slogans) => {
      const slogan = slogans[Math.floor(Math.random() * slogans.length)];
      setSlogan(`— ${slogan} 🎉🎉🎉`);
      setIsLoading(false); // important to cause rerender for button
    });
  }, []);

  useEffect(() => {
    if (user?.teams && !teams) handlePhase(PHASE.LOAD_CHANNELS);
  }, [user, teams]);

  useEffect(() => {
    if (teams) handlePhase(PHASE.SET_OPTIONS);
  }, [teams]);

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
            setHmac={handleHmac}
            user={user}
            setUser={setUser}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : currentPhase === PHASE.LOAD_CHANNELS ? (
          <TeamsListSelector user={user} setTeams={setTeams} />
        ) : currentPhase === PHASE.SET_OPTIONS ? (
          <ChannelListSelector userId={user.id} teams={teams} />
        ) : null}
      </div>
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
