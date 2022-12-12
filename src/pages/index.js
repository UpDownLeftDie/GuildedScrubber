import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { Input, Button } from '../atoms';
import { TeamsListSelector, ChannelListSelector } from '../components';
import GuildedFetcher from '../GuildedFetcher';
import GuildedScrubber from '../GuildedScrubber';

const pageStyles = {
  color: '#ececee',
  padding: 96,
  fontFamily: '-apple-system, Roboto, sans-serif, serif',
  textAlign: 'center',
  maxWidth: 900,
  display: 'flex',
  flexDirection: 'column',
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
};
const headingAccentStyles = {
  color: '#f5c400',
  fontSize: '1.3rem',
  fontStyle: 'italic',
};
const paragraphStyles = {
  marginBottom: 48,
};

const listStyles = {
  marginBottom: 96,
  paddingLeft: 0,
};
const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 30,
};

const linkStyle = {
  color: '#8954A8',
  fontWeight: 'bold',
  fontSize: 16,
  verticalAlign: '5%',
};

const links = [
  {
    text: 'Tutorial',
    url: 'https://www.gatsbyjs.com/docs/tutorial/',
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",
    color: '#E95800',
  },
];

const slogans = [
  'Goodbye Guilded!',
  '#GetGuilded out of your life!',
  'Gut Guilded!',
  'Get rid of Guilded!',
  'Gutterball Guilded!',
  'Guildead!',
];

const IndexPage = () => {
  let guildedFetcher;
  let guildedScrubber;
  const [isLoading, setIsLoading] = useState(false);
  const [guildedCookie, _setGuildedCookie] = useState(
    Cookies.get('guilded-cookie') || '',
  );
  const setGuildedCookie = (e) => {
    const guildedCookie = e.target.value;
    _setGuildedCookie(guildedCookie);
    Cookies.set('guilded-cookie', guildedCookie);
  };
  const [user, setUser] = useState(null);
  const [teamChannels, setTeamChannels] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [decryptMode, setDecryptMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const load = async () => {
    setIsLoading(true);
    guildedFetcher = GuildedFetcher.getInstance(guildedCookie);
    const user = await guildedFetcher.LoadUser();
    setIsLoading(false);
    setUser(user);
    console.log({ userid: user.id });
    guildedScrubber = GuildedScrubber.getInstance(
      guildedFetcher,
      user.id,
      'abcdefghijklmnopqrstuvwxyzABCDEF',
    );
  };

  return (
    <main style={pageStyles}>
      <div style={headingStyles}>
        <h1>
          Guilded Scrubber
          <br />
          <span style={headingAccentStyles}>
            — {slogans[Math.floor(Math.random() * slogans.length)]} 🎉🎉🎉
          </span>
        </h1>
        <a href="https://stackoverflow.com/a/3177718">
          This site must be ran with CORS disabled
        </a>
      </div>
      <Input
        label="Guilded hmac_signed_session"
        value={guildedCookie}
        onChange={setGuildedCookie}
        placeholder="b35f6d54a296b2b37e6b9ecf8e63a5bf08b287278579865eae467632927162dcd746912e7ae108bb7736e594d38e.09d6921215c6fec2c44d0c6d5b1b48ac.f890adc436fb9474fd423e0f3ca34412219f96c55a79539e86297052da9ecd0c"
      />
      <Button
        disabled={!guildedCookie || !!user?.id || isLoading}
        text={!!user?.id ? `Loaded: ${user.name}` : 'Load...'}
        onClick={load}
      />
      {user?.teams && !teamChannels ? (
        <TeamsListSelector
          teams={user.teams}
          setTeamChannels={setTeamChannels}
        />
      ) : null}
      {teamChannels ? (
        <ChannelListSelector teamChannels={teamChannels} />
      ) : null}
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
