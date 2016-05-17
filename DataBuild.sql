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
-- Table structure for table `equipement`
-- 


CREATE TABLE IF NOT  EXISTS `equipement` (
  `id_e` int(11) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) not null,
  `numero_serie` int(50) not null,
  `marque` varchar(50) NOT NULL,
  `id_ref` int(11) NOT NULL,
  PRIMARY KEY (`id_e`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
    `prix_conso` int(11),
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
	CONSTRAINT `temperature` FOREIGN KEY (`id_e`) REFERENCES `plug` (`id_e`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `reference`
--

create table if not exists `reference` (
  `id_ref` int(11) not null AUTO_INCREMENT,
  `type_ref`(varchar 50) not null,
  `conso_ref_min`(int 12) not null,
  `conso_ref_max`(int 12) not null,
  `prix_ref_min` (int 12) not null,
  `prix_ref_max` (int 12) not null,
  `prix_wat` (int 12) not null,
  primary key(`id_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('Ampoules', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , );
INSERT INTO `reference` (`type_ref`, `conso_ref_min`, `conso_ref_max`, `prix_ref_min`, `prix_ref_max`, `prix_wat`)
VALUES ('', , , , , ); 

-- 
-- Tabke structure for table `administrateur
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