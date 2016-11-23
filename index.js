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
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL,  // Don't forget to change to https if needed
  clientKey: process.env.CLIENT_KEY,
  restAPIKey: process.env.REST_API_KEY,
  javascriptKey: process.env.JAVASCRIPT_API_KEY,
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
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
  users: {
    user: 'jmeacham',
    pass: '$2a$08$ec3HBzcAWbUJDIYoJkjDIOtiYA8poN0i5dmxR1F2Rfh/VVXxHxx/2'
  },
  useEncryptedPasswords: true
})

var app = express();

app.use('/dashboard', dashboard)

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
