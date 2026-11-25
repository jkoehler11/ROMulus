// This fork's identity. RomM's locale files ship as upstream writes them, so a
// release merge never conflicts on a translation: the name is applied to each
// bundle as it loads, and every locale (including one added later) is covered.
export const PRODUCT_NAME = "ROMulus";

/** The project this fork is built on, where its bugs belong. */
export const UPSTREAM_REPO = "rommapp/romm";

/** Where this fork's source, releases and changelog live. */
export const SOURCE_REPO = "jkoehler11/ROMulus";
export const SOURCE_REPO_URL = `https://github.com/${SOURCE_REPO}`;

const UPSTREAM_NAME = /\bRomM\b/g;

/** A message bundle's shape: values are strings, or the plurals' nested keys. */
export type MessageTree = { [key: string]: string | MessageTree };

/** Names this fork in a message upstream wrote for RomM. */
export function brandMessage(message: string): string {
  return message.replace(UPSTREAM_NAME, PRODUCT_NAME);
}

/** Names this fork in every value of a bundle, leaving its keys alone. */
export function brandMessages(messages: MessageTree): MessageTree {
  const branded: MessageTree = {};
  for (const [key, value] of Object.entries(messages)) {
    branded[key] =
      typeof value === "string" ? brandMessage(value) : brandMessages(value);
  }
  return branded;
}
