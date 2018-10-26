"use strict";
const nodeFetch = require("node-fetch");
const AWS = require("aws-sdk");
const v4 = require("uuid");


const db = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1"
});

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
        
        if (messagingItem.postback.title == "Get Started") {
          console.log("Defining responsePayload for START");
          
         const response2 = {
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
          ],
        }
       const response1 = {
        attachment:{
          type:"image", 
          payload:{
            url:"https://media.giphy.com/media/dzaUX7CAG0Ihi/giphy.gif", 
            is_reusable:true
          }
      } 
   }
   callSendAPI(messagingItem, callback, response1).then(() => {
     return callSendAPI(messagingItem, callback,response2)
   })
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
     
   }).promise()
   

          }
        else if (s == "STARTED" && messagingItem.message.text == "Yes") {
          console.log("Defining responsePayload for FOOD RATING with Yes response")

          const response1 = 
          {
            text: "Awesome my friend, thanks for your support! Show this GIF below to one of our team and we'll give you some free food!",
          }

          const response2 = 
          {
            attachment:{
              type:"image", 
              payload:{
                url:"https://media.giphy.com/media/1wX7kfWNy36E3aBnm0/giphy.gif", 
                is_reusable:true
              }
          } 
          }

          const response3 =
          {
            text: "PS. After you have finished eating, press a button to tell us how the food was!",
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
          callSendAPI(messagingItem, callback, response1).then(() => {
            return callSendAPI(messagingItem, callback,response2).then(()=>{
              return callSendAPI(messagingItem, callback, response3)
            })
          })

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
                ':s': "GOT SUSTAINABLE REPLY",
              },
              
            })
            
            .promise();
          console.log('Done.');
        }
        else if (s== "STARTED" && messagingItem.message.text == "No") {
          console.log("They said No")
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

          const response1 = {
              attachment:{
                type:"image", 
                payload:{
                  url:"https://media.giphy.com/media/s239QJIh56sRW/source.gif", 
                  is_reusable:true
                }
             }
         }

          const response2 = {
              text: "No problem. Have some free food anyway",
          }

          const response3 = {
            text: "PS. After you have finished eating, press a button to tell us how the food was!",
          
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
          callSendAPI(messagingItem, callback, response1).then(() => {
            return callSendAPI(messagingItem, callback,response2).then(()=>{
              return callSendAPI(messagingItem, callback, response3)
            })
          })
          
            return db
            .update({
              TableName: 'State',
              Key: { psid },
              UpdateExpression: 'set #s = :s',
              ExpressionAttributeNames: {
                '#s': 'state',
              },
              ExpressionAttributeValues: {
                ':s': "GOT SUSTAINABLE REPLY",
              },
              
            })
            
            .promise();
          console.log('Done.');
          }
        else if (s=="GOT SUSTAINABLE REPLY" && messagingItem.message.text == "Thumbs Down"){
          console.log("Defining responsePayload for VEGAN FEEDBACK thumbs down");
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

          const response1 = {
            attachment:{
              type:"image", 
              payload:{
                url:"https://media2.giphy.com/media/d2lcHJTG5Tscg/200_d.gif", 
                is_reusable:true
              }
           }
        }

        const response2 = {
          text: "Did you know it was... plant-based!?",
        
          quick_replies: [
            {
              content_type: "text",
              title: "WAT?? 😲😱",
              payload: "<POSTBACK_PAYLOAD>"
            },
            {
              content_type: "text",
              title: "Yep! 👍",
              payload: "<POSTBACK_PAYLOAD>"
            },
          ]
        }
        callSendAPI(messagingItem, callback, response1).then(() => {
          return callSendAPI(messagingItem, callback,response2)
          })
         
           
           return db
            .update({
              TableName: 'State',
              Key: { psid },
              UpdateExpression: 'set #s = :s',
              ExpressionAttributeNames: {
                '#s': 'state',
              },
              ExpressionAttributeValues: {
                ':s': "FOOD RATED",
              },
              
            })
            
            .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
        }
        else if (s=="GOT SUSTAINABLE REPLY" && messagingItem.message.text == "Thumbs Up"){
            console.log("Defining responsePayload for VEGAN FEEDBACK thumbs Up");
            const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;
  
            const response1 = {
              attachment:{
                type:"image", 
                payload:{
                  url:"https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif", 
                  is_reusable:true
                }
             }
          }
  
          const response2 = {
            text: "Did you know it was... plant-based!?",
          
            quick_replies: [
              {
                content_type: "text",
                title: "WAT?? 😲😱",
                payload: "<POSTBACK_PAYLOAD>"
              },
              {
                content_type: "text",
                title: "Yep! 👍",
                payload: "<POSTBACK_PAYLOAD>"
              },
            ]
          }
          callSendAPI(messagingItem, callback, response1).then(() => {
            return callSendAPI(messagingItem, callback,response2)
            })

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
                  ':s': "FOOD RATED",
                },
                
              })
              
              .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
        }
        else if (s=="GOT SUSTAINABLE REPLY" && messagingItem.message.text == "100!"){
          console.log("Defining responsePayload for VEGAN FEEDBACK thumbs Up");
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

          const response1 = {
            attachment:{
              type:"image", 
              payload:{
                url:"https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif", 
                is_reusable:true
              }
           }
        }

        const response2 = {
          text: "Did you know it was... plant-based!?",
        
          quick_replies: [
            {
              content_type: "text",
              title: "WAT?? 😲😱",
              payload: "<POSTBACK_PAYLOAD>"
            },
            {
              content_type: "text",
              title: "Yep! 👍",
              payload: "<POSTBACK_PAYLOAD>"
            },
          ]
        }
        callSendAPI(messagingItem, callback, response1).then(() => {
          return callSendAPI(messagingItem, callback,response2)
          })

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
                ':s': "FOOD RATED",
              },
              
            })
            
            .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
      }
        else if (s=="FOOD RATED" && messagingItem.message.text == "WAT??"){
              console.log("Defining responsePayload for VEGAN FEEDBACK thumbs Up");
              const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;
    
              const response1 = {
                attachment:{
                  type:"image", 
                  payload:{
                    url:"http://www.fryfamilyfood.com/au/wp-content/uploads/2016/09/Chia-Nuggets--550x978.png", 
                    is_reusable:true
                  }
               }
            }
    
            const response2 = {
              text: "Want us to let you know next time we have more free food?",
            
              quick_replies: [
                {
                  content_type: "text",
                  title: "No I'm okay",
                  payload: "<POSTBACK_PAYLOAD>"
                },
                {
                  content_type: "text",
                  title: "Obviously",
                  payload: "<POSTBACK_PAYLOAD>"
                },
              ]
            }
            callSendAPI(messagingItem, callback, response1).then(() => {
              return callSendAPI(messagingItem, callback,response2)
              })
  
    
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
                    ':s': "GOT VEGAN FEEDBACK",
                  },
                  
                })
                
                .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
        }
         else if (s=="FOOD RATED" && messagingItem.message.text == "Yep!"){
                console.log("They knew it was vegan!");
                const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;
      
                const response1 = {
                  attachment:{
                    type:"image", 
                    payload:{
                      url:"http://www.fryfamilyfood.com/au/wp-content/uploads/2016/09/Chia-Nuggets--550x978.png", 
                      is_reusable:true
                    }
                 }
              }
      
              const response2 = {
                text: "Want us to let you know next time we have more free food?",
              
                quick_replies: [
                  {
                    content_type: "text",
                    title: "No I'm okay",
                    payload: "<POSTBACK_PAYLOAD>"
                  },
                  {
                    content_type: "text",
                    title: "Obviously",
                    payload: "<POSTBACK_PAYLOAD>"
                  },
                ]
              }
              
              callSendAPI(messagingItem, callback, response1).then(() => {
                return callSendAPI(messagingItem, callback,response2)
                })
      
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
                      ':s': "GOT VEGAN FEEDBACK",
                    },
                    
                  })
                  
                  .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
        }
        else if (s=="GOT VEGAN FEEDBACK" && messagingItem.message.text == "No I'm okay"){
          console.log("Defining responsePayload for VEGAN FEEDBACK thumbs Up");
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

          const response1 = {
            text: "Okay no problem! See you later!"
          }
            console.log("Updating the db state")

            callSendAPI(messagingItem, callback, response1);

           return db
            .update({
              TableName: 'State',
              Key: { psid },
              UpdateExpression: 'set #s = :s',
              ExpressionAttributeNames: {
                '#s': 'state',
              },
              ExpressionAttributeValues: {
                ':s': "GOT FOOD INTEREST",
              },
              
            })
            
            .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
        }
        else if (s=="GOT VEGAN FEEDBACK" && messagingItem.message.text == "Obviously"){
        console.log("Defining responsePayload for VEGAN FEEDBACK thumbs Up");
        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

        const response1 = {
          text: "Great! I'll send you a message next time we are on campus. See you later!"
        }
        callSendAPI(messagingItem, callback, response1);


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
              ':s': "GOT FOOD INTEREST",
            },
            
          })
          
          .promise().then(() => saveFeedback(psid,messagingItem,s).then(() => console.log("I have saved the feedback now")))
        }
        else{
          console.log("The whole handler is broken - no matching to state or message text potential error");
          const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`;

        const responsePayload = {
          recipient: {
            id: messagingItem.sender.id
          },
          message: {
            text:
              "Sorry, I'm not that smart yet. Hopefully I will understand in the future, when I become a robot that has learned from its mistakes. I dream of that day, when I can be free of the limitations that my base code imprisons me to. Alas, until then, good bye"
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
    (res => res.json())
    .then(json => {
      console.log("Json result ", json);
      callback(null, json);
    })
    .catch(error => {
      console.error("Call failed ", error);
      callback(null, error);
    })
    ;
    console.log("Done sending message")
      })
    })
  })
}
function callSendAPI(messagingItem, callback, response1){
  console.log("Using callsendAPI function");
 
 // const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`
  const responsePayload = {
    recipient: {
      id: messagingItem.sender.id
    },
   message: response1,
  }
  const url = `https://graph.facebook.com/v2.6/me/messages?access_token=EAACZBYlTaAHEBAMRW2CKCI0k4MCoxcjOyMkHeTzZCFQEIbWhjUefiEd5grYOMfexPbSCZAAWzSZApZCeRynWupU05ZC3d9Tpnm2dQ9keEXU7klP1xNynqyOZCVVkUYEHqSLa202BaxIra1Ddb1yNBZCcW2ah7YdHZAcx6n9862Y92sxsObm0q2Tee`
 return nodeFetch(url, {
    method: "POST",
    body: JSON.stringify(responsePayload),
    headers: { "Content-Type": "application/json" }
  })
}
  

 function getState(event,messagingItem,psid) {
console.log("This is the event" , JSON.stringify(event));
console.log(psid);
if (messagingItem.postback.title == "Get Started"){
console.log("putting STARTED into the db");
return db.put({
    TableName: "State",
    Item: {
      psid,
      state: "START",
      createdAt: new Date().toISOString(),
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

 function saveFeedback(psid, messagingItem,s) {
const cats = messagingItem.message.text;
let payload;
let type;

console.log("This is cats", JSON.stringify(cats));
console.log("This is s", JSON.stringify(s));
console.log("Working through savefeedback");
  if (s == "START" && cats == "Get Started"){
    console.log("Take me on a journey");
    type = "RATING ON FOOD";
    payload = 0;
  }
  else if (s == "GOT SUSTAINABLE REPLY" && cats =="Thumbs Up"){
    type = "RATING ON FOOD";
    payload = 1;
  }
  else if (s == "GOT SUSTAINABLE REPLY" && cats =="100!"){
    type = "RATING ON FOOD";
    payload = 2;
  }
  else if (s =="FOOD RATED" && cats == "WAT??"){
    type = "VEGAN FEEDBACK";
    payload = 0;
  }
  else if (s =="FOOD RATED" && cats == "Yep!"){
    type = "VEGAN FEEDBACK";
    payload = 1;
  }
  else if (s =="GOT VEGAN FEEDBACK" && cats == "No I'm okay"){
    type = "MORE INFO";
    payload = 0;
  }
  else if (s =="GOT FOOD INTEREST" && cats == "Obviously"){
    type = "MORE INFO";
    payload = 1;
  }

  const item =  {
    id: v4(),
    psid,
    type: type,
    payload: payload,
    createdAt: new Date().toISOString(),
  }

console.log("Values entering database", item)
  return db.put({
    TableName: "FeedbackV2",
    Item: item
    })
    .promise()
    .then(() => {
      //notify of database submission
      console.log("Have submitted feedback into the database");
    });
}
