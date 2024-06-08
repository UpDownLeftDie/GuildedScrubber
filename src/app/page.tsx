"use client";
// import Image from "next/image";
// import styles from "./page.module.css";
import { GSButton } from "@/atoms";
import { User } from "@/classes";
import {
  ChannelSelectorPhase,
  DeleteAccount,
  LoadUserPhase,
  ProgressPhase,
  SettingsPhase,
  TeamsSelectorPhase,
} from "@/molecules";
import { BreadcrumbItem, Breadcrumbs, Divider } from "@nextui-org/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const pageStyles = {
  color: "#ececee",
  padding: "50px 35px 92px",
  fontFamily: "Roboto, sans-serif, serif",
  textAlign: "center" as const,
  display: "flex",
  maxWidth: 800,
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
    <main className="container mx-auto" style={pageStyles}>
      {currentPhase === PHASE.Home ? (
        <div className="flex flex-col items-center" style={headingStyles}>
          <Image
            src="/logo.png"
            width={400}
            height={400}
            alt="Guilded Scrubber"
            priority={true}
            style={{ display: "inline-block" }}
          />
          <h1>Guilded Scrubber</h1>
          <h2 style={sloganStyles}>{slogan}</h2>
          <GSButton
            type="button"
            style={{ margin: "20px 0" }}
            size="xl"
            color="goldSolid"
            onClick={nextPhase}
          >
            Start
          </GSButton>
          <h3 style={{ marginBottom: "30px" }}>
            Delete, some or all, of your messages on Guilded!
          </h3>
          <div className="space-y-3">
            <p>Looking to delete your account but don&apos;t want all your messages left behind?</p>
            <p>
              <strong>Guilded Scrubber</strong> lets you select specific teams/server and date
              ranges to remove messages.
            </p>
            <p>
              Ensuring you remove all personal information that you might have left behind and{" "}
              <u>automatically editing them before deleting them to help maximize your privacy!</u>
            </p>
            <p>
              This can also be a preventative measure if ROBLOX/Guilded ever decides that they want
              to train AI models on chat messages.
            </p>
          </div>
        </div>
      ) : (
        <Breadcrumbs style={{ marginBottom: "45px" }}>{breadCrumbs}</Breadcrumbs>
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
      <Divider className="my-4" />
      <DeleteAccount userId={user.id} />
    </main>
  );
}
