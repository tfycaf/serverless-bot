function matchIntent(messagingItem) {
  console.log("Testing first message");
  if (messagingItem.message == "dogs") {
    return "DOGS";
  } else if (
    messagingItem.message == "Get Started" ||
    messagingItem.message == "Get started" ||
    messagingItem.message == "Hey"
  ) {
    console.log("The first message didnt match, second now");
    return "STARTED";
  }
}
module.exports = implementation;
