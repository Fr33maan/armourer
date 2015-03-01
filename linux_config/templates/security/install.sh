#!/bin/bash

##############################
###### DEFAULT INSTALL #######
##############################


export DEBIAN_FRONTEND=noninteractive


# Remove list changes because we do not want to be prompted to validate update changes
# Maybe that we won't be prompted because DEBIAN_FRONTEND is set to non interactive ?
#######################
apt-get remove apt-listchanges -y



# Classic system update
#######################
apt-get update && apt-get dist-upgrade -y

# This is for log readability purpose
echo "--------------- UPDATE ENDED ---------------"


# Uninstall exim4 (default debian webclient)
apt-get --purge remove exim4 exim4-base exim4-config exim4-daemon-light -y


# This is for log readability purpose
echo "--------------- EXIM PURGE ENDED ---------------"


# Install basic and security server softwares in silent mode
#######################

apt-get install wget nullmailer clamav logwatch fail2ban psad rkhunter -y

psad --sig-update

# This is for log readability purpose
echo "--------------- SOFTWARE INSTALLED ---------------"



# Install CSF
#######################
mkdir /tmp/csf
cd /tmp/csf
wget http://www.configserver.com/free/csf.tgz
tar -xzf csf.tgz
cd csf
sh install.sh
rm -rf /tmp/csf


# This is for log readability purpose
echo "--------------- CSF INSTALLED ---------------"


# Disable IPv6
#######################
echo net.ipv6.conf.all.disable_ipv6=1 > /etc/sysctl.d/disableipv6.conf


# This is for log readability purpose
echo "--------------- IPV6 DISABLED ---------------"


# Create a new user and add it to sudoers
#######################
sudoUsername="$1"

adduser "$sudoUsername" sudo


export DEBIAN_FRONTEND=dialog


# This is for log readability purpose
echo "--------------- END OF INSTALL SCRIPT ---------------"



