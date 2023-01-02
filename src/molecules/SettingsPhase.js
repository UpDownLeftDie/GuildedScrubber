import React, { useState } from 'react';
import { ContentContainer } from '../templates';
import { Input, Button } from '../atoms';
import { Settings, DateFormatter } from '../classes';
import { ErrorList } from '../components';
const { MODES, SecretKeyLength } = Settings;

const styles = {
  display: 'flex',
  flexDirection: 'column',
};

const description = [
  "Warning: GuildedScrubber is provided as-is and doesn't guarantee messages will be recoverable or decryptable. Encrypt and decrypt are provided simply as option but my cause data loss and should not be relied upon for anything but another method of deletion.",
  <br />,
  <br />,
  <br />,
  <ul>
    <li>
      Delete:
      <ul>
        <li>
          Deletes all your messages after replacing them with generic message
        </li>
        <li>This increases privacy over simply deleting them</li>
      </ul>
    </li>
    <li>
      Encrypt:
      <ul>
        <li>
          SAVE YOUR SECRET_KEY: it is the only thing that can recover encrypted
          messages
        </li>
        <li>Enter a secretKey that is exactly 32-characters long</li>
      </ul>
    </li>
    <li>
      Decrypt:
      <ul>
        <li>Enter the secretKey you used to encrypt messages</li>
        <li>Incorrect secretKey will result in messages being destroyed</li>
      </ul>
    </li>
  </ul>,
];

const SettingsPhase = ({ user, setUser, nextPhase }) => {
  const [errors, setErrors] = useState({});
  const [settings, setSettings] = useState(new Settings());
  // const [mode, setMode] = useState(settings.mode);
  const [secretKey, setSecretKey] = useState(settings.secretKey);
  const [beforeDate, setBeforeDate] = useState(settings.beforeDate);
  const [afterDate, setAfterDate] = useState(settings.afterDate);

  const disableSubmit = !!Object.values(errors).length; //|| (showSecretKey && secretKey.length !== secretKeyLength);
  const showSecretKey = settings.mode !== MODES.DELETE;

  function validateSettings() {
    const { isValid, errors } = Settings.Validate(settings);
    if (isValid) setSettings(settings);
    setErrors(errors);
    return isValid;
  }

  function handleModeChange(e) {
    const mode = e.target.value;
    settings.mode = mode;
    // setMode(mode);
    validateSettings();
  }

  function handleOnBlur() {
    settings.secretKey = secretKey;
    validateSettings();
  }

  function handleBeforeDateChange(dateString) {
    return handleDateChange(dateString, true);
  }
  function handleAfterDateChange(dateString) {
    return handleDateChange(dateString, false);
  }
  function handleDateChange(dateString, isBefore) {
    let date = new Date(dateString);
    if (isNaN(date)) date = null;
    if (isBefore) {
      settings.beforeDate = date;
      setBeforeDate(date);
    } else {
      settings.afterDate = date;
      setAfterDate(date);
    }
    validateSettings();
  }

  function handleOnSubmit(e) {
    e.preventDefault();
    const isValid = validateSettings();
    if (isValid) {
      settings.beforeDate = settings.beforeDate && beforeDate.toISOString();
      settings.afterDate = settings.afterDate && afterDate.toISOString();
      user.settings = settings;
      nextPhase();
    }
  }

  return (
    <ContentContainer headerText={'Settings'} description={description}>
      <>
        <ErrorList errors={errors} />
        <form style={styles} onSubmit={handleOnSubmit}>
          <label htmlFor="mode">Mode: </label>
          <select id="mode" name="mode" onChange={handleModeChange}>
            <option value={MODES.ENCRYPT}>Encrypt Messages</option>
            <option value={MODES.DECRYPT}>Decrypt Messages</option>
            <option value={MODES.DELETE}>
              Delete Messages (unrecoverable!)
            </option>
          </select>
          {showSecretKey ? (
            <Input
              label="Encryption SecretKey (SAVE THIS!)"
              onChange={setSecretKey}
              value={secretKey}
              placeholder="Example: xWOgB3XWfhZlua8E2El7ICFAc0q3jySf"
              minLength={SecretKeyLength}
              maxLength={SecretKeyLength}
              required={showSecretKey}
              onBlur={handleOnBlur}
            />
          ) : null}
          <Input
            type="datetime-local"
            id="afterDate"
            label="After Date (optional)"
            value={DateFormatter.FormatDate(afterDate)}
            onChange={handleAfterDateChange}
          />
          <Input
            type="datetime-local"
            id="beforeDate"
            label="Before Date (optional)"
            value={DateFormatter.FormatDate(beforeDate)}
            onChange={handleBeforeDateChange}
          />
          <Button
            disabled={disableSubmit}
            type="submit"
            text="Next: Select Teams"
          />
        </form>
      </>
    </ContentContainer>
  );
};

export default SettingsPhase;
