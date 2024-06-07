import { Progress } from "@nextui-org/react";
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
    </ContentContainer>
  );
};

export default ProgressPhase;
