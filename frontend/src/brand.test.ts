import { describe, expect, it } from "vitest";
import { brandMessage, brandMessages } from "@/brand";

describe("brandMessage", () => {
  it("names this fork where upstream's copy named RomM", () => {
    expect(brandMessage("RomM could not be reached.")).toBe(
      "ROMulus could not be reached.",
    );
    expect(brandMessage("Sent {name}'s save to RomM")).toBe(
      "Sent {name}'s save to ROMulus",
    );
  });

  it("keeps every plural form of a message", () => {
    expect(
      brandMessage("Removing {n} game from RomM | Removed from RomM"),
    ).toBe("Removing {n} game from ROMulus | Removed from ROMulus");
  });

  it("leaves a lowercase host name and a longer word alone", () => {
    expect(brandMessage("See docs.romm.app for details")).toBe(
      "See docs.romm.app for details",
    );
    expect(brandMessage("RomMetadata stays as it is")).toBe(
      "RomMetadata stays as it is",
    );
  });

  it("renames text a language glues its own script to", () => {
    expect(brandMessage("RomMについて")).toBe("ROMulusについて");
    expect(brandMessage("RomM에서 삭제")).toBe("ROMulus에서 삭제");
  });
});

describe("brandMessages", () => {
  it("renames values and keeps keys, nested plurals included", () => {
    expect(
      brandMessages({
        "about-romm": "About RomM",
        perm: { "add-user": "Add a RomM user" },
      }),
    ).toEqual({
      "about-romm": "About ROMulus",
      perm: { "add-user": "Add a ROMulus user" },
    });
  });
});
