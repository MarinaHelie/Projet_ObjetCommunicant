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


--
-- Table structure for table `plug`
-- 


CREATE TABLE IF NOT  EXISTS `plug` (
  `id_p` int(11) NOT NULL AUTO_INCREMENT,
  `numero_p` int(50) not null,
  `marque_p` varchar(50) not null,
  `type_p` varchar(50) NOT NULL,
  PRIMARY KEY (`id_p`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `consomation`
-- 

create table if not exists `consomation` (
	`id_u`int(11) not null,
    `id_p`int(11) not null,
    `date_debut` date,
    `date_fin`date,
    `heureDebut` time,
    `heureFin` time,
    `consomation`int(12),
    primary key (`id_u`,`id_p`,`date_debut`),
    CONSTRAINT `conso_user` FOREIGN KEY (`id_u`) REFERENCES `user` (`id_u`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `conso_plug` FOREIGN KEY (`id_p`) REFERENCES `plug` (`id_p`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `temperature`
-- 

create table if not exists `consomation` (
	`id_u`int(11) not null,
    `id_p`int(11) not null,
    `date_debut` date,
    `date_fin`date,
    `heureDebut` time,
    `heureFin` time,
    `temperature_actuel`int(12),
    `temperature_min`float,
    `temperature_max`float,
    primary key (`id_u`,`id_p`, `date_debut`),
    CONSTRAINT `temperature_user` FOREIGN KEY (`id_u`) REFERENCES `user` (`id_u`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `temperature` FOREIGN KEY (`id_p`) REFERENCES `plug` (`id_p`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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