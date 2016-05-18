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

// Utilitaire Température-----------------------------------------------------------------------------------------------
var idDevice;
var idSensorTemp= {};

function getDevice()
{
	var adr = "https://api.sensit.io/v1/devices";
	var http = new XMLHttpRequest();
	http.open("GET", adr, true);
	http.setRequestHeader("Authorization", "Bearer " + token);
	http.onreadystatechange = function()
	{
		if(http.readyState==4)
		{
			var t=JSON.parse(http.responseText);
			idDevice = t.data[0].id;
			logger.info('Recuperation du device : ' , idDevice);
		}
	}
	http.send(null);
};

function getTemperature(idDev, idSen)
{
	var adr = "https://api.sensit.io/v1/devices/" + idDev + "/sensors/" + idSen;
	var http = new XMLHttpRequest();
	http.open("GET", adr, true);
	http.setRequestHeader("Authorization", "Bearer " + token);
	http.onreadystatechange = function()
	{
		if(http.readyState == 4)
		{
			var t = JSON.parse(http.responseText);
		}
	}
	http.send(null);
};
		
function getSensors(id, callback)
{
	var adr = "https://api.sensit.io/v1/devices/" + id;
	var http = new XMLHttpRequest();
	http.open("GET", adr, true);
	http.setRequestHeader("Authorization", "Bearer " + token);
	http.onreadystatechange = function()
	{
		if(http.readyState==4)
		{
				var t = http.responseText;
				logger.info('t : ', t);
				for(var i = 0; i < t.data.sensors.length; i++)
				{
					idSensorTemp[i].idHTTP = t.sensors[i].id;
					logger.info('Recuperation de id sensor : ' , idSensorTemp[i]);
				}
		}
	}
	http.send(null);
};

// LOGGER START --------------------------------------------------------------------------------------------------------
logger.info('server start');

//getSensors(idDevice, getDevice());

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
	var param = {nom_u: req.body.nom, prenom_u: req.body.prenom, mail_u: req.body.email, mp_u: req.body.password };
	connection.connect();
	connection.query("SELECT count(*) AS nb FROM user WHERE mail_u = ?", req.body.email, function (err, rows, fields) {
		if (!err) {
			if(rows[0]['nb'] == 0){
				connection.query('INSERT INTO user SET ?', param, function(err, result) {
					if(!err){
						logger.info("donnée utilisateur :", param);
						req.session.id_user = param['id_u'];
						req.session.nom = param['nom_u'];
						req.session.prenom = param['prenom_u'];
						req.session.login = param['mail_u'];
						req.session.password = param['mp_u'];
						res.redirect('/utilisateur');
					} else {
						logger.info("erreur boulet :", err);
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
	res.render('utilisateur',{nom:req.session.nom, prenom:req.session.prenom});
	}
});


// Gestion EQUIPEMENT ----------------------------------------------------------------------------------------------------------
app.get('/gestionEU', function(req, res) {
	if(!req.session.login) {
		res.redirect('/');
	} else {
		res.render('gestionEU');
	}
});

    // Liste Equipement ------------------------------------------------------------------------------------------------
app.get('/listeEU', function(req, res) {
	if(!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("SELECT * FROM equipement WHERE id_u = ?", req.session.id_user, function (err, rows, fields) {
			if (!err) {
				res.render('listeEU',{equipements : rows});
			}
			else
			{
				res.send(err);
			}
		});
	}
});


	// Suppression Equipement ------------------------------------------------------------------------------------------
app.get('/supprEU', function(req, res) {
	if(!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("SELECT * FROM equipement WHERE id_u = ?", req.session.id_user, function (err, rows, fields) {
			if (!err) {
				res.render('supprEU',{equipements : rows});
			}
			else
			{
				res.send(err);
			}
		});
	}
});

app.post('/supprEU', function(req, res) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	connection.connect();
	connection.query("delete from equipement where id_e = '" + req.body.equipement + "';", function (err, fields) {
		if (!err) {
			res.redirect('/listeEU');
		}
		else
		{
			res.send(err);
		}
	});
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


// GESTION equipement administrateur -------------------------------------------------------------------------------------------------------
app.get('/gestionEA', function(req, res) {
	if(!req.session.login) {
		res.redirect('/');
	} else {
		res.render('gestionEA');
	}
});

// GESTION liste equipement administrateur -------------------------------------------------------------------------------------------------------
app.get('/listeEA', function(req, res) {
	if(!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("SELECT u.nom_u, u.prenom_u, e.libelle, e.numero_serie, e.marque FROM equipement e, user u where u.id_u=e.id_u ;", function (err, rows, fields) {
			if (!err) {
				res.render('listeEA',{jointure : rows});
			}
			else
			{
				res.send(err);
			}
		});
	}
});

// GESTION ajout equipement administrateur -------------------------------------------------------------------------------------------------------
app.get('/ajoutEA', function (req, res) {
    var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'});
    connection.connect();
    connection.query("select * from user;" ,  function (err, rows, fields){
        if (!err){
            res.render('ajoutEA', {query: req.query, jointure :rows});
        }
    });
});

app.post('/ajoutEA', function (req, res) {
    var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'
    });
    var param = {libelle: req.body.libelle, numero_serie: req.body.numero_serie, marque: req.body.marque , id_u: req.body.id_u};
    connection.connect();
    connection.query("SELECT count(*) AS nb FROM equipement WHERE numero_serie = ?", req.body.numero_serie, function (err, rows, fields) {
        if (!err) {

            if(rows[0]['nb'] == 0){
                connection.query('INSERT INTO equipement SET ?', param, function(err, result) {
                    if(!err){
                        logger.info("donnée equipement :", param);
                        res.redirect('/listeEA');
                    } else {
                        logger.info("erreur boulet :", err);
                        res.redirect('/ajoutEA');
                    }
                });
            }

        } else {
            logger.info("erreur encore boulet : ",err);
            res.redirect('/ajoutEA');
        }
        connection.end();
    });
});

// GESTION modification d' equipement administrateur -------------------------------------------------------------------------------------------------------

app.get('/modifEA', function (req, res) {
    if(!req.session.login) {
        res.redirect('/');
    } else {
        var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
            host: 'localhost',
            user: 'ioc',
            password: 'ioc',
            database: 'ioc_domotique'
        });
        connection.connect();
        connection.query("select * from equipement  ;", function (err, rows, fields) {
            if (!err) {
                
                res.render('modifEA', {query: req.query, equipement: rows});
            }
            logger.info("erreur : ", err);
        });
    }
});
app.post('/modifEA', function (req, res) {
    var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'
    });
    var param = {libelle: req.body.libelle, numero_serie: req.body.numero_serie, marque: req.body.marque , id_u: req.body.id_u, id_e: req.body.id_e};
    connection.connect();
    connection.query("SELECT * FROM equipement WHERE id_e = ?", req.body.id_e , function (err, rows, fields) {
        if (!err) {

            if(rows[0]['nb'] == 1){
                connection.query('UPDATE equipement SET ?', param, function(err, result) {
                    if(!err){
                        logger.info("donnée equipement :", param);
                        res.redirect('/listeEA');
                    } else {
                        logger.info("erreur boulet :", err);
                        res.redirect('/modifEA');
                    }
                });
            }

        } else {
            logger.info("erreur encore boulet : ",err);
            res.redirect('/modifEA');
        }
        connection.end();
    });
});


app.listen(1313); 