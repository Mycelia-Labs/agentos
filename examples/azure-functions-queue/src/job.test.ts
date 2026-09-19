import { describe, expect, it } from "vitest";
import { parseJobMessage } from "./job.js";

describe("parseJobMessage", () => {
  it("accepts a valid job message", () => {
    expect(parseJobMessage('{"id":"job-123","task":"index-document"}')).toEqual({
      id: "job-123",
      task: "index-document",
    });
  });

  it("rejects malformed JSON and invalid shapes", () => {
    expect(() => parseJobMessage("not-json")).toThrow();
    expect(() => parseJobMessage('{"id":"job-123","task":42}')).toThrow();
  });

  it("rejects unknown fields instead of silently stripping them", () => {
    expect(() =>
      parseJobMessage(
        '{"id":"job-123","task":"index-document","priority":"high"}',
      ),
    ).toThrow();
  });
});
