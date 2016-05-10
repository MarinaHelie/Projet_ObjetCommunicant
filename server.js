var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var XMLHttpRequest = require('xhr2');
var app = express();
var Wemo = require('wemo-client');
var wemo = new Wemo();

var token="iPt5AYfkmCNrvIN1wXzU0Bpw3uXrcfWttfQvALUwqSuser5NDnsPMdzaJr58Wrgn";

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined')); // Active le middleware de logging

app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

logger.info('server start');

app.get('/', function(req, res)
{
	wemo.discover(function(deviceInfo) 
	{
	  console.log('Wemo Device Found: %j', deviceInfo);

	  // Get the client for the found device
	  var client = wemo.client(deviceInfo);

	  // Handle BinaryState events
	  client.on('binaryState', function(value) {
	    console.log('Binary State changed to: %s', value);
	  });

	  // Turn the switch on
	  client.setBinaryState(1);
	});
}

app.listen(1313); 