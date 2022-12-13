import React from 'react';
import Cookies from 'js-cookie';
import GuildedScrubber from '../GuildedScrubber';
import { InputWithSubmit } from '../components';

const LoadUser = ({
  hmac,
  setHmac,
  user,
  setUser,
  isLoading,
  setIsLoading,
}) => {
  const loadUser = async () => {
    setIsLoading(true);
    Cookies.set('guilded-hmac', hmac);
    const user = await GuildedScrubber.FetchApi('user');
    setUser(user);
    setIsLoading(false);
  };

  return (
    <InputWithSubmit
      inputLabel={'Guilded cookie hmac_signed_session'}
      inputValue={hmac}
      inputOnChange={setHmac}
      inputMaxLength={190}
      inputPlaceholder={
        'b35f6d54a296b2b37e6b9ecf8e63a5bf08b287278579865eae467632927162dcd746912e7ae108bb7736e594d38e.09d6921215c6fec2c44d0c6d5b1b48ac.f890adc436fb9474fd423e0f3ca34412219f96c55a79539e86297052da9ecd0c'
      }
      inputDisabled={!!user?.id || isLoading}
      submitDisabled={hmac?.length !== 190 || !!user?.id || isLoading}
      submitText={!!user?.id ? `Loaded: ${user.name}` : 'Load...'}
      submitOnClick={loadUser}
    />
  );
};

export default LoadUser;
