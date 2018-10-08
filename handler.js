"use strict";
const nodeFetch = require("node-fetch");
const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
});
/*
function getProfile(psid) {
 // const URL = `https://graph.facebook.com/v2.6/${psid}?fields=first_name,last_name,profile_pic&access_token=${EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee}`;
  return fetch(URL).then(res => res.json());
}
*/

/*function getPSID(event) {
  try {
    return psid;
  } catch (e) {
    return 'error! Not found'; // EVERYBODY IS NELSON!
  }
}
*/

/**
 * Function to verify facebook webhook
 */
module.exports.fbVerify = (event, context, callback) => {
  console.log(event);
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
module.exports.fbMessages = (event, context, callback) => {
  console.log(event.body);
  event.body.entry.map(entry => {
    entry.messaging.map(messagingItem => {

      // add the state handler here
      console.log("Getting the state now");
 getState(messagingItem.sender.id).then(s => {
    if (s == "STARTED"){
 
        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

        const responsePayload = {
          recipient: {
            id: messagingItem.sender.id
          },
          message: {
            text: "Hey would you like to see more sustainable food options on campus?",
            quick_replies:[
              {
                "content_type":"text",
                "title":"No",
                "payload":"<POSTBACK_PAYLOAD>",
              },
              {"content_type":"text",
              "title":"Yes",
              "payload":"<POSTBACK_PAYLOAD>",
              }
            ],
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
        else if(s == "FOOD RATING"){
          saveFeedback(psid, text).then (() => {
            if (messagingItem.message.title ==="No"){

              const responsePayload = {
                recipient: {
                  id: messagingItem.sender.id
                },
                message: {
                  text: "Well, that makes me sad. Try some food at least and give it a rating",
                  quick_replies:[
                    {
                      "content_type":"text",
                      "title":"Thumbs down",
                      "payload":"<POSTBACK_PAYLOAD>",
                    },
                    {"content_type":"text",
                    "title":"Thumbs Up",
                    "payload":"<POSTBACK_PAYLOAD>",
                    },
                    {"content_type":"text",
                    "title":"100!",
                    "payload":"<POSTBACK_PAYLOAD>",
                    }
                  ]
      
                },
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
            else if (messagingItem.message.text == "Yes"){
              const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;
  
              const responsePayload = {
                recipient: {
                  id: messagingItem.sender.id
                },
                message: {
                  text: "Thanks for that."
              ,
                quick_replies:[
                  {
                    "content_type":"text",
                    "title":"Thumbs Down",
                    "payload":"<POSTBACK_PAYLOAD>",
                  },
                  {"content_type":"text",
                  "title":"Thumbs Up",
                  "payload":"<POSTBACK_PAYLOAD>",
                  },
                  {"content_type":"text",
                  "title":"100!",
                  "payload":"<POSTBACK_PAYLOAD>",
                  }
                ]
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
          })
        }
      })
    })
  })
}


    // if (messagingItem.postback.title ==="Get Started"){
        //    saveFeedback(){}.then(() =>
         //   const userKey = getPSID(event);
         //   console.log("This is the user key:", userKey);
         //might need to move const 

  function getState(psid){
    console.log(psid);
    if (messagingItem.message.text == "Get Started"){
      console.log("putting STARTED into the db")
      await db
      .put({
        TableName: 'State',
        Item: {
          psid,
          state: 'STARTED',
          createdAt: timeStamp,
        },
      })
      .promise();
  }
  else{

    await db
    .getItem({
    TableName: "State",
    Key: {
        "psid": psid,
    },
    "ProjectionExpression": "state"
})
  }
  return state;
 }
    //Look at the database for the state
    //If find state then return it
    //If no state found, then create new state and put state into the database

    //this is from the old bot, probably not needed here at the moment
 // };    

  function saveFeedback(psid, text){
    
    //match with user via psid
    //take text from user input
  
 //   payload = messagingItem.message.text (?- this is probably incorrect)
    //Change it into corresponding payload for the database
    //Maybe put an if function action here for each item, or make this a generic actor
  

    //Submit to the database


    await db
    .put({
      TableName: 'Feedback',
      Item: {
        id: v4(),
        psid,
        type,
        payload,
        createdAt: new Date().toISOString(),
      },
    })
    .promise();
    //notify of database submission
    console.log ("Have submitted feedback into the database");
  }



      
   /*    if (messagingItem.message.text ==="Thumbs Down"){

        const responsePayload = {
          recipient: {
            id: messagingItem.sender.id
          },
          message: {
            text: "Well, that makes me sad. Try some food at least and give it a rating",
            quick_replies:[
              {
                "content_type":"text",
                "title":"Thumbs down",
                "payload":"<POSTBACK_PAYLOAD>",
              },
              {"content_type":"text",
              "title":"Thumbs Up",
              "payload":"<POSTBACK_PAYLOAD>",
              }
              {"content_type":"text",
              "title":"100!",
              "payload":"<POSTBACK_PAYLOAD>",
              }
            ]

          },
        };
        */