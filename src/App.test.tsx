// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

// These tests click through the real app the way a player would. The domain
// tests already check the maths, so these only check that the screen reacts:
// picks show up, the plan changes, and nothing impossible can be selected.

afterEach(cleanup);

function setup() {
  const user = userEvent.setup();
  render(<App />);
  return user;
}

const checkbox = (name: RegExp) => screen.getByRole("checkbox", { name });

describe("Riven Baker", () => {
  it("asks for buffs until there are at least two", async () => {
    const user = setup();
    expect(screen.getByText(/Pick 2 or 3 buffs\. Rivens always have 2 or 3\./)).toBeInTheDocument();

    await user.click(checkbox(/^Critical Chance$/));
    await user.click(checkbox(/^Critical Damage$/));

    expect(screen.getByText("Your rolling plan")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 selected")).toBeInTheDocument();
  });

  it("plans the splice in the right order when a spliced stat is picked", async () => {
    const user = setup();
    await user.click(checkbox(/^Critical Chance$/));
    await user.click(screen.getByRole("tab", { name: "Spliced" }));
    await user.click(checkbox(/^Viral/));

    const titles = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(titles.indexOf("Find Toxin + Cold")).toBe(0);
    expect(titles.indexOf("Splice into Viral")).toBe(1);
    expect(screen.getByText("Viral combines Toxin + Cold.")).toBeInTheDocument();
  });

  it("searches every tab, including spliced stats by their ingredients", async () => {
    const user = setup();
    await user.type(screen.getByPlaceholderText("Find a stat..."), "toxin");

    expect(checkbox(/^Toxin$/)).toBeInTheDocument();
    expect(checkbox(/^Viral/)).toBeInTheDocument();
    expect(checkbox(/^Corrosive/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /^Zoom$/ })).not.toBeInTheDocument();
  });

  it("removes a buff from its chip", async () => {
    const user = setup();
    await user.click(checkbox(/^Critical Chance$/));
    await user.click(screen.getByRole("button", { name: "Remove Critical Chance" }));

    expect(checkbox(/^Critical Chance$/)).not.toBeChecked();
  });

  it("only offers stats that exist on the chosen weapon class", async () => {
    const user = setup();
    await user.click(screen.getByRole("radio", { name: "Melee" }));
    await user.type(screen.getByPlaceholderText("Find a stat..."), "zoom");

    expect(screen.queryByRole("checkbox", { name: /^Zoom$/ })).not.toBeInTheDocument();
    expect(screen.getByText(/No buff called "zoom" on a melee riven/)).toBeInTheDocument();
  });

  it("adds the common harmless curses in one click", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Acceptable curses/ }));
    await user.click(screen.getByRole("button", { name: /Add common harmless curses/ }));

    expect(screen.getByText("7 selected · any one is fine")).toBeInTheDocument();
    expect(checkbox(/^Zoom$/)).toBeChecked();
  });

  it("moves between stat tabs with the arrow keys", async () => {
    const user = setup();
    await user.click(screen.getByRole("tab", { name: "Core" }));
    await user.keyboard("{ArrowRight}");

    const damageTypes = screen.getByRole("tab", { name: "Damage types" });
    expect(damageTypes).toHaveAttribute("aria-selected", "true");
    expect(damageTypes).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Spliced" })).toHaveFocus();
  });

  it("switches weapon class with the arrow keys", async () => {
    const user = setup();
    await user.click(screen.getByRole("radio", { name: "Rifle" }));
    await user.keyboard("{ArrowRight}");

    const shotgun = screen.getByRole("radio", { name: "Shotgun" });
    expect(shotgun).toBeChecked();
    expect(shotgun).toHaveFocus();
  });
});
