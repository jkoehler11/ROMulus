import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { SOURCE_REPO_URL } from "@/brand";
import AuthCard from "./AuthCard.vue";

describe("AuthCard", () => {
  // A network service has to offer its source to whoever reaches it, and the
  // login screen is the only page a visitor sees before signing in.
  it("offers the licence and the source on the signed-out screen", () => {
    const wrapper = mount(AuthCard);

    const terms = wrapper.find(".auth-card__terms");
    expect(terms.exists()).toBe(true);
    expect(terms.attributes("href")).toBe(SOURCE_REPO_URL);
    expect(terms.text()).toContain("AGPL-3.0");
  });
});
