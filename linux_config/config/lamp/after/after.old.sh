#!/bin/bash

#http://www.cyberciti.biz/tips/howto-write-shell-script-to-add-user.html
#add website user with group 33 and password given in script parameter
useradd -m -p $(perl -e 'print crypt($ARGV[0], "password")' $1) website -g 33

#change website umask:
echo "umask 007 >> /home/website/.bashrc"

#change www-data umask
echo "umask 007" >> /etc/apache2/envvars

#activate SSL module
a2enmod ssl

#activate rewrite module
a2enmod rewrite
