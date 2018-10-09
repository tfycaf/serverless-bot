"use strict";
const nodeFetch = require("node-fetch");
const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1"
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
  console.log(JSON.stringify(event.body));
  event.body.entry.map(entry => {
    entry.messaging.map(messagingItem => {
      
      console.log("Getting the state now");
      const psid = messagingItem.sender.id;
      console.log("This is the psid", psid);
     
      getState(event,messagingItem,psid).then(s => {
        console.log("Got the state");
        if (s == "START") {
          console.log("Defining responsePayload for START");
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

          const responsePayload = {
            recipient: {
              id: messagingItem.sender.id
            },
            message: {
              text:
                "Hey would you like to see more sustainable food options on campus?",
              quick_replies: [
                {
                  content_type: "text",
                  title: "No",
                  payload: "<POSTBACK_PAYLOAD>"
                },
                {
                  content_type: "text",
                  title: "Yes",
                  payload: "<POSTBACK_PAYLOAD>"
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

            console.log("Updating the db state")
           
           return db
            .update({
              TableName: 'State',
              Key: { psid },
              UpdateExpression: 'set #s = :s',
              ExpressionAttributeNames: {
                '#s': 'state',
              },
              ExpressionAttributeValues: {
                ':s': "STARTED",
              },
              
            })
            
            .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
          }
        else if (s == "FOOD RATING") {
          console.log("Defining responsePayload for FOOD RATING")
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;
          let dogs;
          if (messagingItem.message.text =="No"){
            dogs = "This shit sucks";
         
        }
        else if (messagingItem.message.text =="Yes"){
          dogs == "Cheers, thanks for that";
        }
          const responsePayload = {
            recipient: {
              id: messagingItem.sender.id
            },
            message: {
              text:
                dogs,
              quick_replies: [
                {
                  content_type: "text",
                  title: "Thumbs down",
                  payload: "<POSTBACK_PAYLOAD>"
                },
                {
                  content_type: "text",
                  title: "Thumbs Up",
                  payload: "<POSTBACK_PAYLOAD>"
                },
                {
                  content_type: "text",
                  title: "100!",
                  payload: "<POSTBACK_PAYLOAD>"
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

            return db
            .update({
              TableName: 'State',
              Key: { psid },
              UpdateExpression: 'set #s = :s',
              ExpressionAttributeNames: {
                '#s': 'state',
              },
              ExpressionAttributeValues: {
                ':s': "FOOD RATING",
              },
              
            })
            
            .promise();
          console.log('Done.');
        }
      })
    })
  })
}

   
            
            
     /*       else if (messagingItem.message.text == "Yes") {
              const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

              const responsePayload = {
                recipient: {
                  id: messagingItem.sender.id
                },
                message: {
                  text: "Thanks for that.",
                  quick_replies: [
                    {
                      content_type: "text",
                      title: "Thumbs Down",
                      payload: "<POSTBACK_PAYLOAD>"
                    },
                    {
                      content_type: "text",
                      title: "Thumbs Up",
                      payload: "<POSTBACK_PAYLOAD>"
                    },
                    {
                      content_type: "text",
                      title: "100!",
                      payload: "<POSTBACK_PAYLOAD>"
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
/*
// if (messagingItem.postback.title ==="Get Started"){
//    saveFeedback(){}.then(() =>
//   const userKey = getPSID(event);
//   console.log("This is the user key:", userKey);
//might need to move const
*/
async function getState(event,messagingItem,psid) {
  console.log("This is the event" , JSON.stringify(event));
  console.log(psid);
  if (messagingItem.message.text == "Get Started"){
    console.log("putting STARTED into the db");
    return db.put({
        TableName: "State",
        Item: {
          psid,
          state: "START",
          createdAt: "cats"
        }
      })
      .promise().then(()=> "START")
  }
  else {
    console.log("I need to get an item from the db")
    return db.get({
      TableName: "State",
      Key: {
        psid: psid
      },
    }).promise().then(i =>  i.Item.state);
  }
}
//Look at the database for the state
//If find state then return it
//If no state found, then create new state and put state into the database

//this is from the old bot, probably not needed here at the moment
// };

async function saveFeedback(psid, messagingItem,s) {
const cats = messagingItem.message.text;
var payload;
let type;
console.log("Working through savefeedback");
  if (s == "START" && cats == "Get Started"){
    console.log("Take me on a journey");
    type = "RATING ON FOOD";
    payload = 0;
  }
  else if (s == "FOOD RATING" && cats =="Thumbs Up"){
    type = "RATING ON FOOD";
    payload = 1;
  }
  else if (s == "FOOD RATING" && cats =="100!"){
    type = "RATING ON FOOD";
    payload = 2;
  }
  else if (s =="VEGAN RATING" && cats == "Nope"){
    type = "VEGAN FEEDBACK";
    payload = 0;
  }
  else if (s =="VEGAN RATING" && cats == "Yep!"){
    type = "VEGAN FEEDBACK";
    payload = 1;
  }
  else if (s =="MORE NOTIFICATIONS" && cats == "No I'm okay"){
    type = "MORE INFO";
    payload = 0;
  }
  else if (s =="MORE NOTIFICATIONS" && cats == "Obviously"){
    type = "MORE INFO";
    payload = 1;
  }
  //   payload = messagingItem.message.text (?- this is probably incorrect)
  //Change it into corresponding payload for the database
  //Maybe put an if function action here for each item, or make this a generic actor

  //Submit to the database
console.log("Values entering database")
  return db.put({
    TableName: "NewFeedback",
    Item: {
      psid,
      type: type,
      payload: payload,
      createdAt: new Date().toISOString(),
    }
    })
    .promise()
    .then(() => {
      //notify of database submission
      console.log("Have submitted feedback into the database");
    });
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