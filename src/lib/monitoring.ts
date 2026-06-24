import * as Sentry from "@sentry/react";
import { getClient, PollingMode } from "configcat-js";

function makeConfigCatClient(sdkKey: string, label: string) {
  if (!sdkKey) return null;
  return getClient(sdkKey, PollingMode.AutoPoll, {
    setupHooks: (hooks) =>
      hooks.on("clientError", (msg: string, err: Error) => {
        Sentry.captureException(err, { extra: { configcat: msg, env: label } });
      }),
  });
}

export const configCatPrimary = makeConfigCatClient(
  import.meta.env.VITE_CONFIGCAT_SDK_KEY ?? "",
  "primary"
);

export const configCatSecondary = makeConfigCatClient(
  import.meta.env.VITE_CONFIGCAT_SDK_KEY_2 ?? "",
  "secondary"
);

// Returns the value of a feature flag from the primary ConfigCat config.
export async function getFlag(key: string, defaultValue = false): Promise<boolean> {
  return configCatPrimary?.getValueAsync(key, defaultValue) ?? defaultValue;
}

// Returns the value of a feature flag from the secondary ConfigCat config.
export async function getFlagSecondary(key: string, defaultValue = false): Promise<boolean> {
  return configCatSecondary?.getValueAsync(key, defaultValue) ?? defaultValue;
}

