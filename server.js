var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var mysql = require('mysql'); //SI ON UTILISE MYSQL
var session = require('express-session');
var XMLHttpRequest = require('xhr2');
var cookieParser = require('cookie-parser');
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var app = express();
var Wemo = require('wemo-client');
var wemo = new Wemo();

var token="iPt5AYfkmCNrvIN1wXzU0Bpw3uXrcfWttfQvALUwqSuser5NDnsPMdzaJr58Wrgn";

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// CONFIG USE ----------------------------------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined')); // Active le middleware de logging
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'cestunsecretoupas' })); // session secret
app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

// LOGGER START --------------------------------------------------------------------------------------------------------
logger.info('server start');


// MAIN ----------------------------------------------------------------------------------------------------------------
app.get('/', function (req, res){
	/*wemo.discover(function(deviceInfo) {
		var device = deviceInfo;
  		logger.info('Wemo Device Found: ', device);
  		client.on('binaryState', function(value) {
    		logger.info('Binary State changed to: ', value);
    	});
	});*/
	res.redirect('/main');
});

// PAGE INDEX ----------------------------------------------------------------------------------------------------------

app.get('/main', function(req, res){
	res.render('main');
});
// LOGIN USER ----------------------------------------------------------------------------------------------------------
app.get('/login', function (req, res) {
	if (req.session.user) {
		res.redirect('/utilisateur');
	}
	else {
		res.render('login');
	}
});

app.post('/login', function (req, res) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	connection.connect();
	var post = [req.body.login, req.body.password];
	connection.query("SELECT id_u, nom_u, prenom_u FROM user WHERE mail_u= ? AND mp_u= ?", post, function (err, rows) {
		if (!err) {
			req.session.id_user = rows[0]['id_u'];
			req.session.login = req.body.login; //EMAIL
			req.session.nom = rows[0]['nom_u'];
			req.session.prenom = rows[0]['prenom_u'];
			res.redirect('/utilisateur');
		}
		else {
			res.redirect('/login');
		}
	});
});


// LOGIN ADMIN ---------------------------------------------------------------------------------------------------------
app.get('/loginAdmin', function (req, res) {
	if (req.session.user) {
		res.redirect('/mainAdmin');
	}
	else {
		res.render('loginAdmin');
	}
});

app.post('/loginAdmin', function (req, res) {
	var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	connection.connect();
	var post = [req.body.login, req.body.password];
	connection.query("SELECT idAdmin, nomAdmin, prenomAdmin FROM administration WHERE mailAdmin= ? AND mp= ?", post, function (err, rows) {
		if (!err) {
			req.session.id_user = rows[0]['idAdmin'];
			req.session.login = req.body.login; //EMAIL
			req.session.nom = rows[0]['nomAdmin'];
			req.session.prenom = rows[0]['prenomAdmin'];
			res.redirect('/admin');
		}
		else {
			res.redirect('/loginAdmin');
		}
	});
});


// LOGOUT USER ---------------------------------------------------------------------------------------------------------
app.get('/logout', function (req, res) {
	delete req.session.id_user;
	delete req.session.login;
	delete req.session.nom;
	delete req.session.prenom;

	res.redirect('/main');


});


// LOGOUT ADMIN --------------------------------------------------------------------------------------------------------
app.get('/logoutAdmin', function (req, res) {
	delete req.session.id_user;
	delete req.session.login;
	delete req.session.nom;
	delete req.session.prenom;

});


// INSCRIPTION ---------------------------------------------------------------------------------------------------------
app.get('/inscription', function (req, res) {
	res.render('inscription', {query: req.query});
});

app.post('/inscription', function (req, res) {
	var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	var param = {email: req.body.email, password: req.body.password, nom: req.body.nom, prenom: req.body.prenom};
	connection.connect();
	connection.query("SELECT count(*) AS nb FROM user WHERE mail_u = ?", req.body.email, function (err, rows, fields) {
		if (!err) {
			if(rows[0]['nb'] == 0){
				connection.query('INSERT INTO user SET ?', param, function(err, result) {
					if(!err){
						req.session.id_user = param['id_u'];
						req.session.nom = param['nom_u'];
						req.session.prenom = param['prenom_u'];
						req.session.login = param['mail_u'];
						req.session.password = param['mp_u'];
						res.redirect('/equipement');
					} else {
						res.redirect('/inscription');
					}
				});
			}

		} else {
			var query =
				"nom=" + req.body.nom +
				"&prenom =" + req.body.prenom
			res.redirect('inscription/?' + query);
		}
		connection.end();
	});
});


// PANEL UTILISATEUR ----------------------------------------------------------------------------------------------------------
app.get('/utilisateur', function(req, res) {
	if(!req.session.login) {
		res.redirect('/main');
	} else {
	res.render('utilisateur');
	}
});


// Gestion EQUIPEMENT ----------------------------------------------------------------------------------------------------------
app.get('/gestionEU', function(req, res) {
	if(!req.session.login) {
		res.redirect('/');
	} else {
		res.render('equipement');
	}
});


// MAIN ADMIN ----------------------------------------------------------------------------------------------------------
app.get('/admin', function(req, res) {
	 if(!req.session.login) {
	 res.redirect('/');
	 } else {
	res.render('admin');
	}
});


// GESTION USER --------------------------------------------------------------------------------------------------------
app.get('/gestionUser', function(req, res) {
	/* RETIRER COMMENTAIRE LORSQUE LE LOGIN SERA FONCTIONNELLE
	 if(!req.session.login) {
	 res.redirect('/');
	 } else {
	 */
	res.render('gestionUser');
	//}
});


// GESTION PLUGS -------------------------------------------------------------------------------------------------------
app.get('/gestionPlugs', function(req, res) {
	/* RETIRER COMMENTAIRE LORSQUE LE LOGIN SERA FONCTIONNELLE
	 if(!req.session.login) {
	 res.redirect('/');
	 } else {
	 */
	res.render('gestionPlugs');
	//}
});

// GESTION consomation utilisateur -------------------------------------------------------------------------------------------------------
app.get('/gestionCU', function(req, res) {
	 if(!req.session.login) {
	 res.redirect('/');
	 } else {
	res.render('gestionCU');
	}
});

app.listen(1313); 