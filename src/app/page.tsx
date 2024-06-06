"use client";
// import Image from "next/image";
// import styles from "./page.module.css";
import { Button } from "@/atoms";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button as NButton } from "@nextui-org/button";
import { Snippet } from "@nextui-org/snippet";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "../classes";
import {
  ChannelSelectorPhase,
  LoadUserPhase,
  ProgressPhase,
  SettingsPhase,
  TeamsSelectorPhase,
} from "../molecules";

const pageStyles = {
  color: "#ececee",
  padding: "96px 0",
  marginLeft: "auto",
  marginRight: "auto",
  fontFamily: "Roboto, sans-serif, serif",
  textAlign: "center" as const,
  maxWidth: 600,
  display: "flex",
  flexDirection: "column" as const,
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 20,
};
const sloganStyles = {
  color: "#f5c400",
  fontSize: "1.3rem",
  fontStyle: "italic",
  display: "inline-block",
  fontWeight: "bold",
};

const pageContentStyles = {
  textAlign: "left" as const,
};

enum PHASE {
  Home,
  "Load User",
  Settings,
  Teams,
  Channels,
  Running,
}

// const tagLine = "Don't delete your account till you've scrubbed it!";
// const description = [
//   'Delete all your message before you delete your account!',
// ];

export default function Home() {
  const [user, setUser] = useState(new User());
  const [slogan, setSlogan] = useState("");
  const [currentPhase, setPhase] = useState(PHASE.Home);
  const selectPhase = (phase: PHASE) => {
    setPhase(phase);
  };
  const nextPhase = () => {
    selectPhase(currentPhase + 1);
  };

  function getBreadCrumbs() {
    let crumbs = [];
    for (let i = 0; i <= currentPhase; i++) {
      crumbs.push(
        <BreadcrumbItem key={PHASE[i]} onClick={() => setPhase(i)}>
          {PHASE[i]}
        </BreadcrumbItem>,
      );
    }
    return crumbs;
  }

  const breadCrumbs = getBreadCrumbs();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import("./slogans.json")
      .then((slogans) => {
        const slogan = slogans[Math.floor(Math.random() * slogans.length)];
        setSlogan(`— ${slogan} 🎉🎉🎉`);
        setIsLoading(false); // important to cause rerender for button
      })
      .catch((error) => {
        console.error("error loading slogans 🤷", error);
      });
  }, []);

  return (
    <>
      <main style={pageStyles}>
        {currentPhase === PHASE.Home ? (
          <div style={headingStyles}>
            <Image
              src="/logo.png"
              width={400}
              height={400}
              alt="Guilded Scrubber"
              priority={true}
              style={{ display: "inline-block" }}
            />
            <h1>Guilded Scrubber</h1>
            <span style={sloganStyles}>{slogan}</span>
            <br />
            <Button
              text="Start"
              customStyle={{ fontSize: "3em" }}
              onClick={nextPhase}
              flavor="goldSolid"
            />
            <br />
            <br />
            <br />
            <h3>Delete or encrypt, some or all, of your messages on Guilded!</h3>
            <div>
              Looking to delete your account but don&apos;t want all your messages left behind?
              <br />
              <strong>Guilded Scrubber</strong> lets you select specific teams/server and date
              ranges to remove messages.
              <br />
              Ensuring you remove all personal information that you might have left behind and{" "}
              <u>automatically editing them before deleting them to help maximize your privacy!</u>
              <br />
              <br />
              This can also be a preventative measure if ROBLOX/Guilded ever decides that they want
              to train AI models on chat messages.
            </div>
          </div>
        ) : (
          <Breadcrumbs>{breadCrumbs}</Breadcrumbs>
        )}
        <div style={pageContentStyles}>
          {currentPhase === PHASE["Load User"] ? (
            <LoadUserPhase
              user={user}
              hmac={user.hmac}
              isLoading={isLoading}
              setUser={setUser}
              setIsLoading={setIsLoading}
              nextPhase={nextPhase}
            />
          ) : currentPhase === PHASE.Settings ? (
            <SettingsPhase user={user} nextPhase={nextPhase} />
          ) : currentPhase === PHASE.Teams ? (
            <TeamsSelectorPhase
              user={user}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              nextPhase={nextPhase}
            />
          ) : currentPhase === PHASE.Channels ? (
            <ChannelSelectorPhase user={user} nextPhase={nextPhase} />
          ) : currentPhase === PHASE.Running ? (
            <ProgressPhase user={user} />
          ) : null}
        </div>
        <div style={{ marginTop: "50px" }}>
          <a
            href={`mailto:support@guilded.gg?subject=GDPR Account Deletion Request&body=I would like to withdrawal consent, restriction processing, and request full erasure of all my personal data. My UserId is ${user.id}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <NButton color="danger" variant="bordered">
              📧 Request account deletion
            </NButton>
          </a>
          <br />
          OR
          <br />
          Email:
          <Snippet hideSymbol variant="bordered">
            support@guilded.gg
          </Snippet>
          <br />
          Message:
          <Snippet
            hideSymbol
            variant="bordered"
            classNames={{
              pre: "whitespace-pre-line text-pretty",
            }}
          >
            I would like to withdrawal consent, restriction processing, and request full erasure of
            all my personal data under GDPR. {user?.id && `My UserID is ${user.id}`}
          </Snippet>
        </div>
      </main>
      <a
        className="github-fork-ribbon"
        href="https://github.com/UpDownLeftDie/GuildedScrubber"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      >
        Fork me on GitHub
      </a>
    </>
  );
}
