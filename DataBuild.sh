#!/usr/bin/env bash
    # Définition des couleurs du script

    ROUGE="\\033[31m"
    VERT="\\033[1;32m"
    JAUNE="\\033[1;33m"
    NORMAL="\\033[0m"

     # récupération des données de connexion

    read  -p "Entrer MYSQL host: " host
    read  -p "Entrer MYSQL user: " user
    read -s -p "Entrer MYSQL password: " password

     # Vérification de la connexion à la base de donnée

    echo -e " \n --- Vérification que la connexion à la base ... \c\n";

    bases=`mysql -h$host -u$user -p$password -e "show databases;" -B -s 2> /dev/null`

    if [ -z "$bases" ];then
            echo -e "[$ROUGE ERR $NORMAL]"
            echo -e "${ROUGE} [ERR] Identifiant incorrect ou pas de base de données $NORMAL"
            exit 1;
    fi
    echo -e "[${VERT} connexion a la base de donne : OK ${NORMAL}]"

    # Vérification de l'existance de la base de donnée, supression de la base si existante

    echo -e " --- Vérification de l'existance de la database 'ioc_domotique' ... \c \n"

    bases=`mysql -h$host -u$user -p$password -e "SHOW DATABASES LIKE 'ioc_domotique';" -B -s 2> /dev/null`
    if [ -z "$bases" ];then
        echo -e "[${VERT} La base de donne n existe pas : OK ${NORMAL}]"
    else
        echo -e "[${JAUNE} La base de donne existe ${NORMAL}]"
        echo -e " --- Suppression de la database 'Ioc_domotique' existante ... \c"
        mysql mysql -h$host -u$user -p$password -e "DROP DATABASE ioc_domotique;" -B -s 2> /dev/null
        bases=`mysql -h$host -u$user -p$password -e "SHOW DATABASES LIKE 'ioc_domotique';" -B -s 2> /dev/null`
        if [ -z "$bases" ];then
            echo -e  "[${VERT} La base de donnee n existe plus : OK ${NORMAL}]"
        else
            echo -e "[${ROUGE} ERR ${NORMAL}]"
            echo -e "${ROUGE}     [ERR] La database uno existe encore $NORMAL"
            exit 1;
        fi
    fi

    # Exécution du script de creation

    echo " --- Création de la nouvelle database 'ioc_domotique' ... \c"
    bases=`mysql -h$host -u$user -p$password  < DataBuild.sql -B -s`
    if [ -z "$bases" ];then
        echo -e "[${VERT} Base de donnée bien creer : ok  ${NORMAL}]"
    else
        echo -e "[${ROUGE} ERR ${NORMAL}]"
        echo -e "${ROUGE}     [ERR] Probleme script ${NORMAL}"
        exit 1;
    fi

    # Vérification de la bonne création de la base

    bases=`mysql -h$host -u$user -p$password -e "SHOW DATABASES LIKE 'ioc_domotique';" -B -s 2> /dev/null`
    if [ -z "$bases" ];then
            echo -e  "[${ROUGE} ERR $NORMAL]"
            echo -e "${ROUGE}     [ERR] La database ioc_domotique n'existe pas $NORMAL"
            exit 1;
    fi
    echo -e "[${VERT} Base de donne : OK ${NORMAL}]"

    # Vérification de la bonne création de la base

    bases=`mysql -h$host -u$user -p$password -e "select user,host from mysql.user where user='ioc';" -B -s 2> /dev/null`
    if [ -z "$bases" ];then
            echo -e  "[${ROUGE} ERR $NORMAL]"
            echo -e "${ROUGE}     [ERR] L utilisateur n existe pas  $NORMAL"
            exit 1;
    fi
    echo -e "[${VERT} Utilisateur : OK ${NORMAL}]"