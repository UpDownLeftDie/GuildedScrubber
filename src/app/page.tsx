'use client'
// import Image from "next/image";
// import styles from "./page.module.css";
import Head from "next/head";
import {
  ChannelSelectorPhase,
  LoadUserPhase,
  ProgressPhase,
  SettingsPhase,
  TeamsSelectorPhase,
} from '../molecules'
import { User } from '../classes'
import { useEffect, useState } from "react";


const pageStyles = {
  color: '#ececee',
  padding: '96px 0',
  marginLeft: 'auto',
  marginRight: 'auto',
  fontFamily: 'Roboto, sans-serif, serif',
  textAlign: 'center' as const,
  maxWidth: 600,
  display: 'flex',
  flexDirection: 'column' as const,
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
  textAlign: 'left' as const,
};

const PHASE = {
  LOAD_USER: 1,
  SETTINGS: 2,
  SELECT_TEAMS: 3,
  SELECT_CHANNELS: 4,
  RUNNING: 5,
};

// const tagLine = "Don't delete your account till you've scrubbed it!";
// const description = [
//   'Delete all your message before you delete your account!',
//   <br />,
//   'Did you know that when you delete your account on Guilded your messages remain. If this bothers you, this tool is for you! Easily delete all your message with just a few clicks of a button.',
// ];



export default function Home() {
  const user = new User();
  const [slogan, setSlogan] = useState('');
  const [currentPhase, setPhase] = useState(PHASE.LOAD_USER);
  const nextPhase = () => {
    setPhase(currentPhase + 1);
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('./public/slogans.json').then((slogans) => {
      const slogan = slogans[Math.floor(Math.random() * slogans.length)];
      setSlogan(`— ${slogan} 🎉🎉🎉`);
      setIsLoading(false); // important to cause rerender for button
    });
  }, []);

  return (
    <>
    <Head>
    <title>Guilded Scrubber</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css" />
    </Head>
    <main style={pageStyles}>
      <a className="github-fork-ribbon" href="https://github.com/UpDownLeftDie/GuildedScrubber" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
      <div style={headingStyles}>
        <h1>
          Guilded Scrubber
          <br />
          <span style={sloganStyles}>{slogan}</span>
        </h1>
      </div>
      <div style={pageContentStyles}>
        {currentPhase === PHASE.LOAD_USER ? (
          <LoadUserPhase
            user={user}
            hmac={user.hmac}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            nextPhase={nextPhase}
          />
        ) : currentPhase === PHASE.SETTINGS ? (
          <SettingsPhase
            user={user}
            setIsLoading={setIsLoading}
            nextPhase={nextPhase}
          />
        ) : currentPhase === PHASE.SELECT_TEAMS ? (
          <TeamsSelectorPhase
            user={user}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            nextPhase={nextPhase}
          />
        ) : currentPhase === PHASE.SELECT_CHANNELS ? (
          <ChannelSelectorPhase user={user} nextPhase={nextPhase} />
        ) : currentPhase === PHASE.RUNNING ? (
          <ProgressPhase user={user} />
        ) : null}
      </div>
    </main>
    </>
  );
}
