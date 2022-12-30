import React, { useState } from 'react';
import { InputWithSubmit } from '../components';
import { ContentContainer } from '../templates';

const styles = {};

const codeStyles = {
  background: '#303030',
  padding: '2px',
  fontFamily: 'monospace',
};

const description = [
  'Get this from your ',
  <a
    href="https://developer.chrome.com/docs/devtools/storage/cookies/#open"
    target="_blank"
    rel="noopener noreferrer nofollow">
    cookies
  </a>,
  " after you've logged in on Guilded.gg and look for ",
  <span style={codeStyles}>hmac_signed_session</span>,
  ' and paste the value here.',
  <br />,
  <br />,
  'This is needed to act on your behalf and make requests relevant to your account. This value is only saved in your local browser for convenience.',
  <br />,
  <br />,
  "This site doesn't save any data. Clear your cookies on this site when done using it.",
];

const LoadUserPhase = ({
  hmac,
  user,
  setUser,
  isLoading,
  setIsLoading,
  nextPhase,
}) => {
  const [hmacInput, setHmacInput] = useState(hmac);

  const loadUser = async () => {
    setIsLoading(true);

    await user.LoadUser(hmacInput);
    // setUser(user);

    setIsLoading(false);
    nextPhase();
  };

  return (
    <ContentContainer headerText={'Load user'} description={description}>
      <InputWithSubmit
        inputLabel={'Guilded hmac_signed_session'}
        style={styles}
        inputValue={hmacInput}
        inputOnChange={setHmacInput}
        inputMaxLength={190}
        inputPlaceholder={
          'b35f6d54a296b2b37e6b9ecf8e63a5bf08b287278579865eae467632927162dcd746912e7ae108bb7736e594d38e.09d6921215c6fec2c44d0c6d5b1b48ac.f890adc436fb9474fd423e0f3ca34412219f96c55a79539e86297052da9ecd0c'
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
