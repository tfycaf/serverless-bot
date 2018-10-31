const intent = require("./implementation");

test("matches intent with correct response", () => {
  "Get intent of a message and match with correct response",
    () => {
      const messagingItem = {
        message: {
          text: "Hey"
        }
      };
      expect(matchIntent).toEqual("STARTED");
    };
});
