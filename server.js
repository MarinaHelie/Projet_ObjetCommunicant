var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var mysql = require('mysql'); //SI ON UTILISE MYSQL
var session = require('express-session');
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
});

// LOGIN USER ---------------------------------------------------------------------------------------------------------------
app.get('/login', function (req, res) {
	if (req.session.user) {
		res.redirect('/equipement');
	}
	else {
		res.render('login');
	}
});

// LOGIN ADMIN ---------------------------------------------------------------------------------------------------------------
app.get('/loginAdmin', function (req, res) {
	if (req.session.user) {
		res.redirect('/mainAdmin');
	}
	else {
		res.render('loginAdmin');
	}
});


app.post('/login', function (req, res) {
	var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION
		host: 'localhost',
		user: 'IOC',
		password: 'test',
		database: 'HomeMonitoring'
	});
	connection.connect();
	var post = [req.body.login, req.body.password];
	connection.query("SELECT id, nom, prenom FROM users WHERE email= ? AND password= ?", post, function (err, rows) {
		if (!err) {
			req.session.id_user = rows[0]['id'];
			req.session.login = req.body.login; //EMAIL
			req.session.nom = rows[0]['nom'];
			req.session.prenom = rows[0]['prenom'];
			res.redirect('/equipement');
		}
		else {
			res.redirect('/login');
		}
	});
});

app.post('/loginAdmin', function (req, res) {
	var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION
		host: 'localhost',
		user: 'admin',
		password: 'admin',
		database: 'HomeMonitoring'
	});
	connection.connect();
	var post = [req.body.login, req.body.password];
	connection.query("SELECT id, nom, prenom FROM users WHERE email= ? AND password= ?", post, function (err, rows) {
		if (!err) {
			req.session.id_user = rows[0]['id'];
			req.session.login = req.body.login; //EMAIL
			req.session.nom = rows[0]['nom'];
			req.session.prenom = rows[0]['prenom'];
			res.redirect('/mainAdmin');
		}
		else {
			res.redirect('/loginAdmin');
		}
	});
});

// LOGOUT --------------------------------------------------------------------------------------------------------------
app.get('/logout', function (req, res) {
	delete req.session.id_user;
	delete req.session.login;
	delete req.session.nom;
	delete req.session.prenom;

	res.redirect('/login');

});

app.listen(1313); 