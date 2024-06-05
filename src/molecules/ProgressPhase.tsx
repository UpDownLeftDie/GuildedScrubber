import { Progress } from "@nextui-org/progress";
import { useEffect, useState } from "react";
import { GuildedScrubber, User } from "../classes";
import { ContentContainer } from "../templates";

interface props {
  user: User;
}
const ProgressPhase = ({ user }: props) => {
  const [channelsCount, setChannelsCount] = useState(1);
  const [action, setAction] = useState("");
  const [history, setHistory] = useState({});
  let totalChannels = user.settings.selectedChannels.size;

  useEffect(() => {
    GuildedScrubber.ScrubChannels(user, setChannelsCount, setAction, setHistory);
  }, [user]);

  return (
    <ContentContainer headerText={"Scrubbing..."}>
      {channelsCount} of {totalChannels} Channels
      <br />
      <Progress value={(channelsCount / totalChannels) * 100} />
      <br />
      <div>Currently: {action}</div>
      <br />
      <br />
      <div>
        <a
          href={`mailto:support@guilded.gg?subject=GDPR Account Deletion Request&body=I would like to withdrawal consent, restriction processing, and request full erasure of all my personal data. My UserId is ${user.id}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Request account deletion
        </a>
        <br />
        OR
        <br />
        Email: support@guilded.gg
        <br />
        Message: I would like to withdrawal consent, restriction processing, and request full
        erasure of all my personal data under GDPR. My UserId is {user.id}
      </div>
    </ContentContainer>
  );
};

export default ProgressPhase;
