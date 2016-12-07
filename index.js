// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  appName: process.env.APP_NAME || 'Here One',
  publicServerURL: process.env.PUBLIC_SERVER_URL,
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL,  // Don't forget to change to https if needed
  clientKey: process.env.CLIENT_KEY,
  restAPIKey: process.env.REST_API_KEY,
  javascriptKey: process.env.JAVASCRIPT_API_KEY,
  oauth: {
    facebook: {
      appIds: ['1791007521171343', '1762645524007543']
    }
  },
  emailAdapter: {
    module: 'parse-server-amazon-ses-adapter',
    options: {
      from: 'Doppler Labs <no-reply@dopplerlabs.com>',
      accessKeyId: process.env.SES_ACCESS_KEY,
      secretAccessKey: process.env.SES_SECRET,
      region: 'us-west-2'
    }
  }
});

var dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: process.env.SERVER_URL,
      appId: process.env.APP_ID,
      masterKey: process.env.MASTER_KEY,
      appName: 'Here One Staging'
    },
  ],
  trustProxy: 1,
  users: [{
    user: 'jmeacham',
    pass: '$2a$08$ec3HBzcAWbUJDIYoJkjDIOtiYA8poN0i5dmxR1F2Rfh/VVXxHxx/2'
  }],
  useEncryptedPasswords: true
})

var app = express();

app.use('/dashboard', dashboard)

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
