import assert from "assert";
import { EErrorTypes } from "../../errors";
import { TVerb } from "../../typings";
import { VerbHandler } from "./VerbHandler";

describe("handleVerb", () => {
  const verbHandler = new VerbHandler();

  it("should throw ExtractorError if issuing client did not join table", () => {
    const verb = {} as TVerb;
    assert.throws(() => verbHandler.handleVerb(undefined, verb), {
      name: EErrorTypes.ExtractorError,
    });
  });
});
