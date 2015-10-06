#!/bin/bash

##############################
###### SECURITY INSTALL ######
##############################


export DEBIAN_FRONTEND=noninteractive



# Classic system update
#######################
apt-get update && apt-get dist-upgrade -y

# This is for log readability purpose
echo "--------------- UPDATE ENDED ---------------"


# Package for security updates
# Force yes because the package is not authenticated
# https://wiki.debian.org/UnattendedUpgrades
#######################
apt-get install unattended-upgrades apt-listchanges -y --force-yes


# Uninstall exim4 (default debian webclient)
apt-get --purge remove exim4 exim4-base exim4-config exim4-daemon-light -y


# This is for log readability purpose
echo "--------------- EXIM PURGE ENDED ---------------"


# Install basic and security server softwares in silent mode
#######################

apt-get install wget nullmailer clamav logwatch fail2ban psad rkhunter sudo -y

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


# Add the given user to sudoers group
#######################
sudoUsername="$1"

adduser "$sudoUsername" sudo


export DEBIAN_FRONTEND=dialog


# This is for log readability purpose
echo "--------------- END OF INSTALL SCRIPT ---------------"



