"use strict";
const nodeFetch = require("node-fetch");

/**
 * Function to verify facebook webhook
 */
module.exports.fbVerify = (event, context, callback) => {
  if (
    event.query["hub.mode"] === "subscribe" &&
    event.query["hub.verify_token"] === "sometoken"
  ) {
    console.log("Validating webhook");
    return callback(null, parseInt(event.query["hub.challenge"]));
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    return callback("Invalid token");
  }
};

/**
 * Function to reply to other messages
 */
module.exports.fbMessages = (event, context, callback) => {
  event.body.entry.map(entry => {
    entry.messaging.map(messagingItem => {
      if (messagingItem.message && messagingItem.message.text) {
        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

        const responsePayload = {
          recipient: {
            id: messagingItem.sender.id
          },
          message: {
            text: messagingItem.message.text
          }
        };

        nodeFetch(url, {
          method: "POST",
          body: JSON.stringify(responsePayload),
          headers: { "Content-Type": "application/json" }
        })
          .then(res => res.json())
          .then(json => {
            console.log("Json result ", json);
            callback(null, json);
          })
          .catch(error => {
            console.error("Call failed ", error);
            callback(null, error);
          });
      }
    });
  });
};
