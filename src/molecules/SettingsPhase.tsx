"use client";
import { Settings, User } from "@/classes";
import { MODES } from "@/classes/Settings";
import { ErrorListError } from "@/components/ErrorList";
import { ZonedDateTime, parseAbsoluteToLocal } from "@internationalized/date";
import { Chip, DateRangePicker, Input, Select, SelectItem } from "@nextui-org/react";
import { RangeValue } from "@react-types/shared";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "../atoms";
import { ErrorList } from "../components";
import { ContentContainer } from "../templates";
const { SecretKeyLength } = Settings;

const styles = {
  display: "flex",
  flexDirection: "column" as const,
};

const description = [
  <ul key="ul">
    <li>
      Delete:
      <ul>
        <li>Deletes all your messages after replacing them with generic message</li>
        <li>This increases privacy over simply deleting them</li>
      </ul>
    </li>
    <li>
      Encrypt:
      <ul>
        <li>SAVE YOUR SECRET_KEY: it is the only thing that can recover encrypted messages</li>
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
  <br key="br1" />,

  "Warning: GuildedScrubber is provided as-is and doesn't guarantee messages will be recoverable or decipherable. Encrypt and decrypt are provided simply as option but my cause data loss and should not be relied upon for anything but another method of deletion.",
];

interface props {
  user: User;
  nextPhase: () => void;
}
const SettingsPhase = ({ user, nextPhase }: props) => {
  const [errors, setErrors] = useState<ErrorListError[]>([]);
  const [settings, setSettings] = useState(user.settings);
  const [secretKey, setSecretKey] = useState(settings.secretKey);

  const disableSubmit = !!errors.length; //|| (showSecretKey && secretKey.length !== secretKeyLength);
  const showSecretKey = settings.mode !== MODES.DELETE;

  function validateSettings() {
    const { isValid, errors } = Settings.Validate(settings);
    if (isValid) setSettings(settings);
    setErrors(errors);
    return isValid;
  }

  function handleModeChange(event: ChangeEvent<HTMLSelectElement>) {
    const mode = event.target.value as MODES;
    settings.mode = mode;
    validateSettings();
  }

  function handleOnBlur() {
    settings.secretKey = secretKey;
    validateSettings();
  }

  function handleDateChange(dateRange: RangeValue<ZonedDateTime>) {
    if (dateRange?.start) {
      settings.afterDate = new Date(dateRange.start.toAbsoluteString());
    }
    if (dateRange?.end) {
      settings.beforeDate = new Date(dateRange.end.toAbsoluteString());
    }
  }

  function handleOnSubmit(event: FormEvent) {
    event.preventDefault();
    const isValid = validateSettings();
    if (isValid) {
      user.settings = settings;
      nextPhase();
    }
  }

  return (
    <ContentContainer headerText={"Settings"} description={description}>
      <>
        <ErrorList errors={errors} />
        <form style={styles} onSubmit={handleOnSubmit}>
          <label htmlFor="mode">Mode: </label>
          <Select
            label="Mode"
            placeholder="Select a mode"
            isRequired
            defaultSelectedKeys={[settings.mode]}
            onChange={handleModeChange}
          >
            <SelectItem key={MODES.DELETE}>Delete Messages (unrecoverable!)</SelectItem>
            <SelectItem key={MODES.ENCRYPT}>Encrypt Messages</SelectItem>
            <SelectItem key={MODES.DECRYPT}>Decrypt Messages</SelectItem>
          </Select>
          {showSecretKey ? (
            <Input
              label="Encryption SecretKey (SAVE THIS!)"
              onValueChange={setSecretKey}
              value={secretKey}
              placeholder="Example: xWOgB3XWfhZl1a8E2El7ICFAc0q3jySf"
              minLength={SecretKeyLength}
              maxLength={SecretKeyLength}
              required={showSecretKey}
              onBlur={handleOnBlur}
            />
          ) : null}
          <br />
          <Chip
            color="warning"
            variant="dot"
            classNames={{
              dot: "bg-default",
              base: "text-warning-foreground bg-warning",
            }}
          >
            Note: Min start date is based on when you joined Guilded!
          </Chip>
          <DateRangePicker
            label="Message Range"
            hideTimeZone
            isRequired
            visibleMonths={2}
            // errorMessage={`Dates need to be between when you joined Guilded: (${parseAbsoluteToLocal(user.joinDate.toISOString())}) and your last online time.`}
            onChange={handleDateChange}
            minValue={parseAbsoluteToLocal(user.joinDate.toISOString())}
            maxValue={parseAbsoluteToLocal(user.lastOnline.toISOString())}
            defaultValue={{
              start: parseAbsoluteToLocal(user.monthBeforeLastOnline.toISOString()),
              end: parseAbsoluteToLocal(user.lastOnline.toISOString()),
            }}
          />
          <Button disabled={disableSubmit} type="submit" text="Next: Select Teams" />
        </form>
      </>
    </ContentContainer>
  );
};

export default SettingsPhase;
