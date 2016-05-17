CREATE DATABASE IF  NOT EXISTS `ioc_domotique` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

USE ioc_domotique;

--
-- Table structure for table `user`
--


CREATE TABLE IF NOT  EXISTS `user` (
  `id_u` int(11) NOT NULL AUTO_INCREMENT,
  `nom_u` varchar(50) not null,
  `prenom_u` varchar(50) not null,
  `mail_u` varchar(50) NOT NULL,
  `mp_u` text, 
  PRIMARY KEY (`id_u`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO user (nom_u, prenom_u, mail_u,mp_u) VALUES('Helie-Zadeh','Marina','marina.helie@unice.fr','admin'); 

--
-- Table structure for table `reference`
--

create table if not exists `reference` (
  `id_ref` int(11) not null AUTO_INCREMENT,
  `type_ref`varchar(50) not null,
  `conso_ref_min`int(12) not null,
  `conso_ref_max`int(12) not null,
  `prix_ref_min` float,
  `prix_ref_max` float,
  `prix_wat` float,
  primary key(`id_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Ampoules', 100, 300, 13, 41, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Cuisiniere electrique', 300,  800, 41, 110, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Refrigerateur - congélateur', 200,  500, 27, 69, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('TV plasma', 200, 500, 27, 69, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('TV LCD', 150, 300, 21, 41, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Lave-vaisselle', 150, 300, 21, 41, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Four electrique', 150, 300, 21, 41, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Seche-linge', 150, 250, 21, 34, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Fer à repasser', 150, 300, 21, 41, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Machine à laver', 100, 300, 14, 41, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Four à micro-ondes', 70, 150, 10, 21, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Aspirateur', 50, 100, 7, 14, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Seche-cheveux', 30, 100, 4, 14, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Ordinateur a ecran plan', 40, 100, 5, 14, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Cafetiere', 30, 70, 4, 10, 15.03);
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Grille-pain', 5, 10, 1, 2, 15.03); 

--
-- Table structure for table `equipement`
--

CREATE TABLE IF NOT  EXISTS `equipement` (
  `id_e` int(11) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) not null,
  `numero_serie` varchar(50) not null,
  `marque` varchar(50) NOT NULL,
  `id_ref` int(11),
  PRIMARY KEY (`id_e`),
  CONSTRAINT `ref` FOREIGN KEY (`id_ref`) REFERENCES `reference` (`id_ref`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `equipement` (`libelle`, `numero_serie`, `marque`) VALUES ('sensor temperature 1', 'xxxx1', 'sensor');
INSERT INTO `equipement` (`libelle`, `numero_serie`, `marque`) VALUES ('sensor temperature 2', 'xxxx2', 'sensor');
INSERT INTO `equipement` (`libelle`, `numero_serie`, `marque`) VALUES ('sensor temperature 2', 'xxxx3', 'sensor');

--
-- Table structure for table `consomation`
-- 

create table if not exists `consomation` (
	`id_u`int(11) not null,
    `id_e`int(11) not null,
    `date_debut` date,
    `date_fin`date,
    `heureDebut` time,
    `heureFin` time,
    `consomation`int(12),
    `prix_conso` float,
    primary key (`id_u`,`id_e`,`date_debut`),
    CONSTRAINT `conso_user` FOREIGN KEY (`id_u`) REFERENCES `user` (`id_u`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `conso_plug` FOREIGN KEY (`id_e`) REFERENCES `equipement` (`id_e`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `temperature`
-- 

create table if not exists `temperature` (
    `id_e`int(11) not null,
    `date_debut` date,
    `date_fin`date,
    `heureDebut` time,
    `heureFin` time,
    `temperature_actuel`int(12),
    `temperature_min`float,
    `temperature_max`float,
    primary key (`id_e`, `date_debut`),
	CONSTRAINT `temperature` FOREIGN KEY (`id_e`) REFERENCES `equipement` (`id_e`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 
-- Tabke structure for table `administrateur
--

CREATE TABLE IF NOT EXISTS `administration` (
`idAdmin` int (11) NOT NULL AUTO_INCREMENT,
`nomAdmin` VARCHAR (50),
`prenomAdmin` VARCHAR (50),
`mp` TEXT,
`mailAdmin` Varchar (50),
PRIMARY key (`idAdmin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 GRANT SELECT,UPDATE,INSERT, DELETE ON ioc_domotique.* TO 'ioc'@'localhost' IDENTIFIED BY 'ioc' WITH MAX_QUERIES_PER_HOUR 100000 MAX_UPDATES_PER_HOUR 10000 MAX_CONNECTIONS_PER_HOUR 10000 MAX_USER_CONNECTIONS 10000;
 SET PASSWORD FOR 'ioc'@'localhost' = PASSWORD('ioc');