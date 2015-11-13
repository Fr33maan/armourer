![armourer_logo](https://raw.githubusercontent.com/prisonier/armourer/master/assets/images/armourer_logo.png)
* * *

# Armourer

Armourer is a Node app built with Sails framework. It allow you to automatically install basic security software and configure them on a debian server.
It allow you to have an uniform security bootstrap on all your servers. I made it because i wanted something more evolued than a script.
I wanted something with the less input possible but that cover all aspects of what a basic security setup should be.

Consider it between a DIY script and a configuration management tool. I did not want to use something like puppet/chef because i only manage 3 servers and there is only 1 user on each.
Install basic security software on a server take only few minutes with this app and you have nothing to learn or configure. Just provide some information and click on "install" button.

You can modify what you want very easilly. Feel free to open issues to improve this app, especially the security config.

This solution will not fits your needs if you have tens of servers with many users on them. You best use a configuration management tool like chef or puppet if so.


The requirement to use it are :

- node.js
- mongodb
- node packet manager

* * *

## Installation

Simply clone the directory

```linux
git clone https://github.com/prisonier/armourer.js.git

```

Go to your directory and lunch following commands

```linux
npm install

```


* * *
## Utilisation

I'm working with Debian(linux), so i only know the commands for this OS, please feel free to adapt it and tell us how you do it.

Before beeing able to configure your first server, you will need to add it to your know hosts. Simply connect to your server with ssh.

```linux
ssh root@hostip -p port

```

Sometimes you are not able to connect to the server. It happens if you re-install the server, you will need to run the following command.
It is not Armourer.js related but i needed to googlize it and it took me some time to understand.

```linux
ssh-keygen -R hostip

```


Now you must add a user that will be registered as a sudoer.

```linux
adduser yourUsername

```

Then type a password (you can leave next fields blank), now you are able to lunch the installation.
Now you can go to your app directory and lunch the following cammand :

```linux
sails lift

```

Sails.js runs its server on port 1337, so you will find the app at http://localhost:1337.

Once you are on the home page, click on "install a server" in the navbar.
Simply fill the form with necessary information, it should be crystal clear.

Once the server is created, just click on the install button, you will receive all the information about the installation in this page.


* * *
#### Important :

Be sure to open the ssh port in TCP_IN & TCP_OUT OR to create a port knocking sequence. Otherwise you will never be able to connect to your server.

Once installation procedure is over, you should change the root password and the sudo password.
I promise that there is no secret function that send me a mail with your password but it is more secure to change them.

After reboot, you will not be able to connect to the root account via ssh, do it with your sudo account.


* * *
## Configuration of the server and its software

- IPV6 is disabled
- Root login on ssh is disabled
- We allow only the sudo account you specified in config to login on ssh
- Exim4 is removed because in most cases we do not need a mail server -> replaced by nullmailer
- port TCP_OUT open by default : 22 or custom ssh port, 80 (to update system), 465 (used by nullmailer) (you do not need to add them in the config)

* * *
## Softwares

This is the list of softwares that will be installed on your server.

### Security module
- wget -> http://www.gnu.org/software/wget/
- unattended-upgrades -> https://wiki.debian.org/UnattendedUpgrades
- nullmailer -> http://untroubled.org/nullmailer/
- clamav -> http://www.clamav.net/index.html
- rkhunter -> http://rkhunter.sourceforge.net/
- logwatch -> http://sourceforge.net/projects/logwatch/
- fail2ban -> http://www.fail2ban.org/wiki/index.php/Main_Page
- CSF+LFD -> http://configserver.com/cp/csf.html
- psad -> http://cipherdyne.org/psad/

### LAMP module
- apache
- mysql
- php
- phpMyAdmin
- VSFTP

* * *
## List of config files we changed and what we changed

### Security module

* * *
#### RKHunter
/etc/rkhunter/rkhunter.conf
- MAIL-ON-WARNING="root"

* * *
#### sshd service
/etc/ssh/sshd_config
- PermitRootLogin no
- port
- AllowUsers sudo_username

* * *
#### Fail2Ban
/etc/fail2ban/jail.local
- [DEFAULT] - ignoreip (if defined)
- [ssh] - port

* * *
#### CSF
/etc/csf/csf.conf
- TESTING = "0"
- CONNLIMIT (1 connection allowed on ssh_port)
- LF_ALERT_TO = "root"
- TCP_IN, TCP_OUT, UDP_IN, UDP_OUT
- PORTKNOCKING (if defined)
- RESTRICT_SYSLOG = "3" - as recommended in csf.conf
- URLGET = "1" - Perl module for LWP must be manually installed

/etc/csf/csf.allow
/etc/csf/csf.ignore
/etc/csf/csf.pignore
- remove exe:/usr/sbin/exim4
- add exe:/usr/sbin/nullmailer-send
- add exe:/usr/bin/dbus-daemon
- add exe:/usr/sbin/atd - i'm not sure if it is secure to remove ressource check for this executable

* * *
#### Nullmailer

/etc/nullamiler/remotes
/etc/nullmailer/adminaddr
- Used to redirect local mails to an external email address

* * *
#### Psad
/etc/psad/psad.conf
- IGNORE_PORTS = port knocking sequence
- HOSTNAME = machine_name.company_name
- IPT_SYSLOG_FILE /var/log/syslog (not sure if it is correct)
- EMAIL_ALERT_DANGER_LEVEL    3 -> or we will be mailed very often
- ENABLE_AUTO_IDS             Y -> enable IP auto blocking
- AUTO_IDS_DANGER_LEVEL       3 -> blocking IP if danger level is 3 or above
- AUTO_BLOCK_TIMEOUT          36000 -> blocking time 10 hours

* * *
#### Other
/etc/mailname
- Domain name from each mail are sent - machine_name.company_name

* * *
#### Cron
/etc/crontab
- change when cron.daily is executed from 6:25 to 2:00

* * *
### LAMP module



* * *
## Creating your own modules

What I call a module is a bunch of software the needed commands to install them. A module is independant.
The only available module for the moment is "lamp". It will install php, mysql, apache and phpmyadmin.
You can very easily creates new module just with configuration and without any code.

Before creating your modules you need to understand how modules are installed.

1. We generate files from templates and replace some variables inside
2. We lunch "before" bash script with arguments
3. We transfer all the files
4. We lunch the "after" script with arguments

How to create your own module :

/linux_config
  /your_module_name
    /after
      after.sh
      config.js
    /before
      before.sh
      config.js
    files_to_transfer.js
    post_variables.js

1. create a folder in linux_config/config with the name of your module
2. Add your module to the module_order.js file AFTER THE SECURITY MODULE as this module will update the system
3. create folders "before" and "after"
4. create a post_variables.js file. This file will contain the variables which will appear in the forms.
In the "install" array there is the variables which appear in the install form (when you create the server)
In the "secret" array, there is the different passwords needed to install your server (root password, mysql password or any other password needed for your scripts)

5. Create a folder with your module name in linux_config/templates
6. Organize your module files as you want
7. Create a files_to_transfer.js file and list the files of your module and their destination on the server
8. Create a replace file with the rules you need - TODO

* * *
## Tricks & Personnal notes

- I personnaly use mandrill with nullmailer, you can send 12 000 mails per month for free. Use the API key as password. -> https://mandrill.com/
- The error log correspond to the error output of simple-ssh, please see the documentation if you have any questions -> https://github.com/MCluck90/simple-ssh
- I did not installed snort because it needs Apache and mysql server. Because i wanted the install as minimal as possible. But there is this automatic installation script -> https://github.com/da667/Autosnort
- at this moment (march 2015), clamav version in debian repo is 0.98.5 while last stable version of clamav is 0.98.6
- There are many outputs loged as 'error': it is simple-ssh related, i just take its error output
- If you get the following exception it is because the dir where you try to scp the file not exists (you did not created yet or you mispelled the dirname) :
```javascript
armourer/node_modules/scp2/node_modules/ssh2/lib/SFTP/SFTPv3.js:227
    throw new Error('handle is not a Buffer');
          ^
Error: handle is not a Buffer
    at SFTP.write (/armourer/node_modules/scp2/node_modules/ssh2/lib/SFTP/SFTPv3.js:227:11)
    at armourer/node_modules/scp2/lib/client.js:208:18
    at Object.wrapper [as oncomplete] (fs.js:463:17)
```


* * *
## Updates
It is important to keep the system up to date. The package "unattended-upgrades" will automatically download debian security updates.
ClamAV database is updated once an hour, clamscan is performed once a day during the night and an email will be sent if an infected file is found.
Psad signature update is also performed once a day. You can find update script in /etc/cron.daily/





* * *
## Planned features
- server templates
- plugins (apache + php + mysql + plesk / minecraft)
- open ssh port by default -> detect what is the port to use
- edit a server and reinstall it
- explain that is going in "error log" is not really error but what is flagged as error in stdout in ssh npm
- error : Once the server is installed, the node server will crash after a while
  the "reboot" is maybe causing this problem as the stream is never closed and the "reboot" thenable is not fulfilled

  - http://stackoverflow.com/questions/31501038/node-js-error-read-econnreset
  - http://stackoverflow.com/questions/17245881/node-js-econnreset
      events.js:85
            throw er; // Unhandled 'error' event
                  ^
      Error: read ECONNRESET
          at exports._errnoException (util.js:746:11)
          at TCP.onread (net.js:559:26)



* * *
## Resources

You are pleased to try to hack this set up and share your results so I can update the configuration.
I am not an expert in security, I have just compiled what I have found on tutorials and scripts from other people.

##### Script
- https://github.com/crylium/clamav-daily -> I used this script and modified it a little bit to perform a full scan every day

##### English
- https://www.digitalocean.com/community/tutorials/an-introduction-to-securing-your-linux-vps
- https://www.digitalocean.com/community/tutorials/how-to-use-psad-to-detect-network-intrusion-attempts-on-an-ubuntu-vps
- https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-12-04
- https://news.ycombinator.com/item?id=5316093
- https://www.nsa.gov/ia/_files/os/redhat/rhel5-guide-i731.pdf
- http://askubuntu.com/questions/447144/basic-security-tools-and-packages-that-should-be-installed-on-a-public-facing-we
- https://benchmarks.cisecurity.org/tools2/ubuntu/CIS_Ubuntu_12.04_LTS_Server_Benchmark_v1.0.0.pdf

###### Lamp
- http://www.cyberciti.biz/tips/howto-write-shell-script-to-add-user.html

##### French
- http://openclassrooms.com/courses/securiser-son-serveur-linux
- http://www.alsacreations.com/tuto/lire/622-Securite-firewall-iptables.html
- https://mespotesgeek.fr/configuration-et-securisation-dun-serveur-linux-debian-partie-1/
- http://shakup.net/quelques-astuces-pour-securiser-votre-serveur-web-sous-linux/
- http://www.canalgeek.fr/tuto-geek-installation-et-configuration-de-lantivirus-clamav-sur-debian/

