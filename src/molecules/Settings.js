import React, { useState, useEffect } from 'react';
import { ContentContainer } from '../templates';
import GuildedScrubber from '../GuildedScrubber';
import { Input, Button } from '../atoms';
import { formatDate } from '../utils';
import { ErrorList } from '../components';
const MODES = GuildedScrubber.MODES;

const styles = {
  display: 'flex',
  flexDirection: 'column',
};

const passphraseLength = 32;

const ERRORS = {
  DATES: "Invalid Dates: beforeDate can't be earlier than afterDate",
  PASSPHRASE: `Passphrase must be at least ${passphraseLength} characters long`,
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
        <li>This enhances in privacy over simply deleting them</li>
      </ul>
    </li>
    <li>
      Encrypt:
      <ul>
        <li>
          SAVE YOUR PASSPHRASE: it is the only thing that can recover encrypted
          messages
        </li>
        <li>Enter a passphrase that is exactly 32-characters long</li>
      </ul>
    </li>
    <li>
      Decrypt:
      <ul>
        <li>Enter the passphrase you used to encrypt messages</li>
        <li>Incorrect passphrase will result in messages being destroyed</li>
      </ul>
    </li>
  </ul>,
];

const Settings = ({
  mode,
  setMode,
  setIsRunning,
  passphrase,
  setPassphrase,
  beforeDate,
  setBeforeDate,
  afterDate,
  setAfterDate,
}) => {
  const [errors, _setErrors] = useState({});
  const setErrors = (errors) => {
    _setErrors(Object.fromEntries(Object.entries(errors).filter(Boolean)));
  };
  let showPassphrase = mode === MODES.ENCRYPT || mode === MODES.DECRYPT;

  useEffect(() => {
    _checkPassphraseLength();
  }, [mode]);

  function _checkPassphraseLength() {
    showPassphrase = mode === MODES.ENCRYPT || mode === MODES.DECRYPT;

    delete errors.passphrase;
    if (
      showPassphrase &&
      passphrase.length &&
      passphrase.length !== passphraseLength
    ) {
      errors.passphrase = ERRORS.PASSPHRASE;
    }
    setErrors(errors);
  }

  function handleModeChange(e) {
    setMode(e.target.value);
  }

  function handleOnBlur() {
    _checkPassphraseLength();
  }

  function handleDateChange(dateString, isBefore) {
    let date = new Date(dateString);
    if (isNaN(date)) date = null;
    if (isBefore) {
      setBeforeDate(date);
    } else {
      setAfterDate(date);
    }

    delete errors.dates;
    if (afterDate && beforeDate && beforeDate < afterDate) {
      errors.dates = ERRORS.DATES;
    }
    setErrors(errors);
  }

  function handleOnSubmit(e) {
    e.preventDefault();
    setIsRunning(true);
  }

  const disableSubmit =
    !!Object.values(errors).length ||
    (showPassphrase && passphrase.length !== passphraseLength);
  return (
    <ContentContainer headerText={'Settings'} description={description}>
      <>
        <ErrorList errors={errors} />
        <form style={styles} onSubmit={handleOnSubmit}>
          <label htmlFor="mode">Mode: </label>
          <select id="mode" name="mode" onChange={handleModeChange}>
            <option value={MODES.ENCRYPT} default>
              Encrypt Messages
            </option>
            <option value={MODES.DECRYPT}>Decrypt Messages</option>
            <option value={MODES.DELETE}>
              Delete Messages (unrecoverable!)
            </option>
          </select>
          {showPassphrase ? (
            <Input
              label="Encryption Passphrase (SAVE THIS!)"
              onChange={setPassphrase}
              value={passphrase}
              placeholder="Example: xWOgB3XWfhZlua8E2El7ICFAc0q3jySf"
              minLength={passphraseLength}
              maxLength={passphraseLength}
              required={showPassphrase}
              onBlur={handleOnBlur}
            />
          ) : null}
          <Input
            type="datetime-local"
            id="afterDate"
            label="After Date (optional)"
            value={formatDate(afterDate)}
            onChange={(e) => handleDateChange(e, false)}
          />
          <Input
            type="datetime-local"
            id="beforeDate"
            label="Before Date (optional)"
            value={formatDate(beforeDate)}
            onChange={(e) => handleDateChange(e, true)}
          />
          <Button
            disabled={disableSubmit}
            type="submit"
            flavor="goldSolid"
            text="Scrub Guilded"
          />
        </form>
      </>
    </ContentContainer>
  );
};

export default Settings;
