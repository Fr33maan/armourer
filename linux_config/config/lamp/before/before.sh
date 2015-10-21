#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

debconf-set-selections <<< 'mysql-server mysql-server/root_password password' $1
debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password' $1
apt-get install apache2 php5 mysql-server libapache2-mod-php5 php5-mysql -y
