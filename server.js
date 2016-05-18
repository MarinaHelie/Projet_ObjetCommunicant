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

var token = "iPt5AYfkmCNrvIN1wXzU0Bpw3uXrcfWttfQvALUwqSuser5NDnsPMdzaJr58Wrgn";

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// CONFIG USE ----------------------------------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('combined')); // Active le middleware de logging
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'cestunsecretoupas'})); // session secret
app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

// Utilitaire Température-----------------------------------------------------------------------------------------------
var idDevice;
var idSensorTemp = {};

function getDevice() {
    var adr = "https://api.sensit.io/v1/devices";
    var http = new XMLHttpRequest();
    http.open("GET", adr, true);
    http.setRequestHeader("Authorization", "Bearer " + token);
    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            var t = JSON.parse(http.responseText);
            idDevice = t.data[0].id;
            logger.info('Recuperation du device : ', idDevice);
        }
    }
    http.send(null);
};

function getTemperature(idDev, idSen) {
    var adr = "https://api.sensit.io/v1/devices/" + idDev + "/sensors/" + idSen;
    var http = new XMLHttpRequest();
    http.open("GET", adr, true);
    http.setRequestHeader("Authorization", "Bearer " + token);
    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            var t = JSON.parse(http.responseText);
        }
    }
    http.send(null);
};

function getSensors(id, callback) {
    var adr = "https://api.sensit.io/v1/devices/" + id;
    var http = new XMLHttpRequest();
    http.open("GET", adr, true);
    http.setRequestHeader("Authorization", "Bearer " + token);
    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            var t = http.responseText;
            logger.info('t : ', t);
            for (var i = 0; i < t.data.sensors.length; i++) {
                idSensorTemp[i].idHTTP = t.sensors[i].id;
                logger.info('Recuperation de id sensor : ', idSensorTemp[i]);
            }
        }
    }
    http.send(null);
};

// LOGGER START --------------------------------------------------------------------------------------------------------
logger.info('server start');

//getSensors(idDevice, getDevice());

// MAIN ----------------------------------------------------------------------------------------------------------------
app.get('/', function (req, res) {
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

app.get('/main', function (req, res) {
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
    var param = {nom_u: req.body.nom, prenom_u: req.body.prenom, mail_u: req.body.email, mp_u: req.body.password};
    connection.connect();
    connection.query("SELECT count(*) AS nb FROM user WHERE mail_u = ?", req.body.email, function (err, rows, fields) {
        if (!err) {
            if (rows[0]['nb'] == 0) {
                connection.query('INSERT INTO user SET ?', param, function (err, result) {
                    if (!err) {
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


// PANEL UTILISATEUR ---------------------------------------------------------------------------------------------------
app.get('/utilisateur', function (req, res) {
    if (!req.session.login) {
        res.redirect('/main');
    } else {
        res.render('utilisateur', {nom: req.session.nom, prenom: req.session.prenom});
    }
});


// Gestion EQUIPEMENT --------------------------------------------------------------------------------------------------
app.get('/gestionEU', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        res.render('gestionEU');
    }
});

// Liste Equipement ------------------------------------------------------------------------------------------------
app.get('/listeEU', function (req, res) {
    if (!req.session.login) {
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
                res.render('listeEU', {equipements: rows});
            }
            else {
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
app.get('/admin', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        res.render('admin');
    }
});


// GESTION USER --------------------------------------------------------------------------------------------------------
app.get('/gestionUser', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        res.render('gestionUser');
    }
});

// GESTION consomation utilisateur -------------------------------------------------------------------------------------
app.get('/gestionCU', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        res.render('gestionCU');
    }
});

	// Consommation total de l'utilisateur
app.get('/listeCU', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'ioc',
            password: 'ioc',
            database: 'ioc_domotique'
        });
        connection.connect();
        connection.query("SELECT Sum(consomation) as value FROM consomation where id_u = '" + req.session.id_user + "';", function (err, rows, fields) {
            if (!err) {
            	logger.info("conso total :", rows[0]);
                res.render('listeCU', {consoTotal: rows[0]['value']});
            }
            else {
                res.send(err);
            }
        });
    }
});

app.post('/listeCU', function(req, res){
	var connection = mysql.createConnection({
	    host: 'localhost',
	    user: 'ioc',
	    password: 'ioc',
	    database: 'ioc_domotique'
	});
	connection.connect();
	connection.query("SELECT Sum(consomation) as value FROM consomation where id_u = '" + req.session.id_user + "' AND date_debut >= '" + req.body.dateDebut + "' AND date_fin <= '" + req.body.dateFin + "';", function (err, rows, fields) {
	    if (!err) {
	    	logger.info("conso total :", rows[0]);
	        res.render('listeCU', {consoTotal: rows[0]['value']});
	    }
	    else {
	        res.send(err);
	    }
	});
});

	// Conso Equipement de l'utilisateur
app.get('/consoEU', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'ioc',
            password: 'ioc',
            database: 'ioc_domotique'
        });
        connection.connect();
        connection.query("select e.libelle, e.numero_serie, Sum(c.consomation) as value from equipement e, consomation c where e.id_e=c.id_e AND e.id_u='" + req.session.id_user +"' group by e.id_e, e.id_u;", function (err, rows, fields) {
            if (!err) {
                res.render('consoEU', {consoEquip : rows});
            }
            else {
                res.send(err);
            }
        });
    }
});

// GESTION equipement administrateur -----------------------------------------------------------------------------------
app.get('/gestionEA', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        res.render('gestionEA');
    }
});

// GESTION liste equipement administrateur -----------------------------------------------------------------------------
app.get('/listeEA', function (req, res) {
    if (!req.session.login) {
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
                res.render('listeEA', {jointure: rows});
            }
            else {
                res.send(err);
            }
        });
    }
});

// GESTION ajout equipement administrateur -----------------------------------------------------------------------------
app.get('/ajoutEA', function (req, res) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'
    });
    connection.connect();
    connection.query("select * from user;", function (err, rows, fields) {
        if (!err) {
            res.render('ajoutEA', {query: req.query, jointure: rows});
        }
    });
});

app.post('/ajoutEA', function (req, res) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'
    });
    var param = {
        libelle: req.body.libelle,
        numero_serie: req.body.numero_serie,
        marque: req.body.marque,
        id_u: req.body.id_u
    };
    connection.connect();
    connection.query("SELECT count(*) AS nb FROM equipement WHERE numero_serie = ?", req.body.numero_serie, function (err, rows, fields) {
        if (!err) {

            if (rows[0]['nb'] == 0) {
                connection.query('INSERT INTO equipement SET ?', param, function (err, result) {
                    if (!err) {
                        logger.info("donnée equipement :", param);
                        res.redirect('/listeEA');
                    } else {
                        logger.info("erreur boulet :", err);
                        res.redirect('/ajoutEA');
                    }
                });
            }

        } else {
            logger.info("erreur encore boulet : ", err);
            res.redirect('/ajoutEA');
        }
        connection.end();
    });
});

// GESTION modification d' equipement administrateur -------------------------------------------------------------------

app.get('/modifEA', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
            host: 'localhost',
            user: 'ioc',
            password: 'ioc',
            database: 'ioc_domotique'
        });
        connection.connect();
        connection.query("select * from equipement   ;", function (err, rows, fields) {
            if (!err) {
				connection.query("select * from user   ;", function (err, rows2, fields) {
					if (!err) {
						res.render('modifEA', {query: req.query, equipement: rows, utilisateur: rows2});
					}
					else
					{
						res.send (err);
					}
				});
            }
			else
			{
				res.send (err);
			}

        });
    }
});
app.post('/modifEA', function (req, res) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'
    });
	logger.info("donnee equipement :", req.body.numero_serie);
    var param = {
        libelle: req.body.libelle,
        numero_serie: req.body.numero_serie,
        marque: req.body.marque
    };
	var condition = {

		id_u: req.body.id_u
	};
	var condition2 = {
		id_e: req.body.id_e
	};
    connection.connect();
	connection.query("UPDATE equipement SET libelle = '"+req.body.libelle+"', numero_serie='"+req.body.numero_serie+"', marque ='"+req.body.marque+"' WHERE id_u='"+req.body.id_u + "' AND id_e =' "+req.body.id_e+"' ;", function(err, result) {

        if (!err) {

         logger.info("donnée equipement :", param);
         res.redirect('/listeEA');


        } else {
            logger.info("erreur encore boulet : ", err);
            res.redirect('/modifEA');
        }
        connection.end();
    });
});

// GESTION modification de profil user -------------------------------------------------------------------
app.get('/modifU', function (req, res) {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        res.render('modifU', {nom: req.session.nom, prenom: req.session.prenom, mdp: req.session.mdp});
    }
});

app.post('/modifU', function (req, res) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ioc',
        password: 'ioc',
        database: 'ioc_domotique'
    });
    var param = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        mail: req.session.login,
        mdp: req.body.mdp
    };
    connection.connect();
    logger.info("SELECT");
    connection.query("SELECT * FROM user WHERE mail_u = '" + param.mail + "'", function (err, rows, fields) {
        if (!err) {
            logger.info("UPDATE");
            connection.query("UPDATE user SET nom_u = '" + param.nom + "', prenom_u='" + param.prenom + "' WHERE mail_u='" + param.mail + "' AND mp_u =' " + param.mdp + "' ;", function (err, result) {
                if (!err) {
                    logger.info("user update :", param);
                    req.session.nom = param.nom;
                    req.session.prenom = param.prenom;
                    res.redirect('/utilisateur');
                } else {
                    logger.info("erreur lors de la mise a jour de l'utilisateur :", err);
                    res.redirect('/modifU');
                }
            });
        } else {
            console.log("erreur l'utilisateur n'existe pas : ", err);
            res.redirect('/modifU');
        }
        connection.end();
    });
});

// GESTION suppression d' equipement administrateur -------------------------------------------------------------------

app.get('/suppEA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("select * from equipement   ;", function (err, rows, fields) {
			if (!err) {
				connection.query("select * from user   ;", function (err, rows2, fields) {
					if (!err) {
						res.render('suppEA', {query: req.query, equipement: rows, utilisateur: rows2});
					}
					else
					{
						res.send (err);
					}
				});
			}
			else
			{
				res.send (err);
			}

		});
	}
});


app.post('/suppEA', function (req, res) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	logger.info("donnee equipement :", req.body.numero_serie);
	var param = {
		libelle: req.body.libelle,
		numero_serie: req.body.numero_serie,
		marque: req.body.marque
	};
	var condition = {

		id_u: req.body.id_u
	};
	var condition2 = {
		id_e: req.body.id_e
	};
	connection.connect();
	connection.query("DELETE FROM equipement  WHERE id_u='"+req.body.id_u + "' AND id_e =' "+req.body.id_e+"' ;", function(err, result) {

		if (!err) {

			logger.info("donnée equipement :", param);
			res.redirect('/listeEA');


		} else {
			logger.info("erreur encore boulet : ", err);
			res.redirect('/suppEA');
		}
		connection.end();
	});
});

// GESTION utilisateur administrateur -----------------------------------------------------------------------------------
app.get('/gestionUA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		res.render('gestionUA');
	}
});

// GESTION liste equipement administrateur -----------------------------------------------------------------------------
app.get('/listeUA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("SELECT * FROM  user u ;", function (err, rows, fields) {
			if (!err) {
				res.render('listeUA', {listeutilisateur: rows});
			}
			else {
				res.send(err);
			}
		});
	}
});


// Gestiton UTILISATEUR ajout administrateur ---------------------------------------------------------------------------------------------------------
app.get('/ajoutUA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		res.render('ajoutUA');
	}
});

app.post('/ajoutUA', function (req, res) {
	var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	var param = {nom_u: req.body.nom, prenom_u: req.body.prenom, mail_u: req.body.email, mp_u: req.body.password};
	connection.connect();
	connection.query("SELECT count(*) AS nb FROM user WHERE mail_u = ?", req.body.email, function (err, rows, fields) {
		if (!err) {
			if (rows[0]['nb'] == 0) {
				connection.query('INSERT INTO user SET ?', param, function (err, result) {
					if (!err) {
						res.redirect('/listeUA');
					} else {
						logger.info("erreur boulet :", err);
						res.redirect('/ajoutUA');
					}
				});
			}

		} else {
			res.redirect('/ajoutUA');
		}
		connection.end();
	});
});

// GESTION modification d' equipement administrateur -------------------------------------------------------------------

app.get('/modifUA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("select * from user  ;", function (err, rows, fields) {
			if (!err) {
				res.render('modifUA', {query: req.query, utilisateur: rows});
			}
			else
			{
				res.send (err);
			}

		});
	}
});
app.post('/modifUA', function (req, res) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	logger.info("donnee equipement :", req.body.numero_serie);
	var param = {
		nom_u: req.body.nom_u,
		prenom_u: req.body.prenom_u,
		mail_u: req.body.mail_u,
		mp_u: req.body.mp_u,
	};
	var condition = {

		id_u: req.body.id_u
	};

	connection.connect();
	connection.query("UPDATE user SET nom_u = '"+req.body.nom_u+"', prenom_u='"+req.body.prenom_u+"', mail_u ='"+req.body.mail_u+"', mp_u ='"+req.body.mp_u +"' WHERE id_u='"+req.body.id_u + "' ;", function(err, result) {

		if (!err) {

			logger.info("donnée equipement :", param);
			res.redirect('/listeUA');


		} else {
			logger.info("erreur encore boulet : ", err);
			res.redirect('/modifUA');
		}
		connection.end();
	});
});

// GESTION suppression utilisateur administrateur -------------------------------------------------------------------

app.get('/suppUA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({	//TODO MODIFIER LES INFORMATIONS DE CONNEXION !
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("select * from user   ;", function (err, rows, fields) {
			res.render('suppUA', {query: req.query, utilisateur: rows});

		});
	}
});


app.post('/suppUA', function (req, res) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'ioc',
		password: 'ioc',
		database: 'ioc_domotique'
	});
	logger.info("donnee equipement :", req.body.numero_serie);
	var param = {
		libelle: req.body.libelle,
		numero_serie: req.body.numero_serie,
		marque: req.body.marque
	};
	var condition = {

		id_u: req.body.id_u
	};
	var condition2 = {
		id_e: req.body.id_e
	};
	connection.connect();
	connection.query("DELETE FROM user WHERE id_u='"+req.body.id_u + "';", function(err, result) {

		if (!err) {

			logger.info("donnée equipement :", param);
			res.redirect('/listeUA');


		} else {
			logger.info("erreur encore boulet : ", err);
			res.redirect('/suppUA');
		}
		connection.end();
	});
});

// GESTION profile de consomation -----------------------------------------------------------------------------------
app.get('/gestionRA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		res.render('gestionRA');
	}
});

// GESTION liste reference administrateur -----------------------------------------------------------------------------
app.get('/listeRA', function (req, res) {
	if (!req.session.login) {
		res.redirect('/');
	} else {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'ioc',
			password: 'ioc',
			database: 'ioc_domotique'
		});
		connection.connect();
		connection.query("SELECT * FROM reference;", function (err, rows, fields) {
			if (!err) {
				res.render('listeRA', {listereference: rows});
			}
			else {
				res.send(err);
			}
		});
	}
});

app.listen(1313); 