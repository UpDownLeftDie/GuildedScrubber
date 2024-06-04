import User from "@/classes/User";
import { Dispatch, SetStateAction, useState } from "react";
import { InputWithSubmit } from "../components";
import { ContentContainer } from "../templates";

const styles = {};

const codeStyles = {
  background: "#303030",
  padding: "2px",
  fontFamily: "monospace",
};

const description = [
  "Get this from your ",
  <a
    href="https://developer.chrome.com/docs/devtools/storage/cookies/#open"
    target="_blank"
    rel="noopener noreferrer nofollow"
    key="chrome-cookies"
  >
    cookies
  </a>,
  " after you've logged in on Guilded.gg and look for ",
  <span style={codeStyles} key="hmac">
    hmac_signed_session
  </span>,
  " and paste the value here.",
  <br key="br1" />,
  <br key="br2" />,
  "This is needed to act on your behalf and make requests relevant to your account. This value is only saved in your local browser for convenience.",
  <br key="br3" />,
  <br key="br4" />,
  "This site doesn't save any data. Clear your cookies on this site when done using it to clear your session token.",
];

interface props {
  hmac: string;
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  nextPhase: () => void;
}

const LoadUserPhase = ({ hmac, user, setUser, isLoading, setIsLoading, nextPhase }: props) => {
  const [hmacInput, setHmacInput] = useState(hmac);

  const loadUser = async () => {
    setIsLoading(true);
    setUser(await user.LoadUser(hmacInput));
    setIsLoading(false);
    console.log(user.settings);

    nextPhase();
  };

  return (
    <ContentContainer headerText={"Load user"} description={description}>
      <InputWithSubmit
        inputLabel={"Guilded hmac_signed_session"}
        style={styles}
        inputValue={hmacInput}
        inputOnChange={setHmacInput}
        inputMaxLength={190}
        inputPlaceholder={
          "b35f6d54a296b2b37e6b9ecf8e63a5bf08b287278579865eae467632927162dcd746912e7ae108bb7736e594d38e.09d6921215c6fec2c44d0c6d5b1b48ac.f890adc436fb9474fd423e0f3ca34412219f96c55a79539e86297052da9ecd0c"
        }
        inputDisabled={!!user.id || isLoading}
        submitDisabled={hmacInput?.length !== 190 || !!user.id || isLoading}
        submitText="Load User"
        submitOnClick={loadUser}
        submitFlavor="gold"
      />
    </ContentContainer>
  );
};

export default LoadUserPhase;
