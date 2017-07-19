"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));
bot.recognizer({
  recognize: function (context, done) {
    var intent = { score: 0.0 };
    if (context.message.text) {
      switch (context.message.text.toLowerCase()) {
        case 'старт':
          intent = { score: 1.0, intent: 'Start' };
          break;
        case 'стоп':
          intent = { score: 1.0, intent: 'Stop' };
          break;
        default: break;
      }
    }
    done(null, intent);
  }
});

bot.dialog('startDialog', function (session) {
  session.send('Super kek, y\'ve been started a conversation!');
}).triggerAction({ matches:'Start' });

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
