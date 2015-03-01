
# Armourer

![armourer_logo](https://github.com/prisonier/armourer/assets/images/armourer_logo.png)

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


## Installation

Simply clone the directory

```linux
git clone https://github.com/prisonier/armourer.js.git

```

Go to your directory and lunch following commands

```linux
npm install

```



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






1. Server creation
2. Install lunch
3. Server will now reboot






Once installation procedure is over, you should change the root password and the sudo password.
I promise that there is no secret function that send me a mail with your password but it is more secure to change them.

After reboot, you will not be able to connect to the root account via ssh, do it with your sudo account.



## Configuration of the server and its software

- IPV6 is disabled
- Root login on ssh is disabled
- We allow only the sudo account you specified in config to login on ssh
- Exim4 is removed because in most cases we do not need a mail server -> replaced by nullmailer



## Softwares

This is the list of softwares that will be installed on your server.

- wget - we need it to install CSF (firewall)
- nullmailer - light MTA
- clamav
- rkhunter
- logwatch
- fail2ban
- CSF
- psad


## List of config files we changed and what we changed in

##### RKHunter
- /etc/rkhunter/rkhunter.conf
>- MAIL-ON-WARNING="root"

##### sshd service
- /etc/ssh/sshd_config
>- PermitRootLogin no
>- port
>- AllowUsers sudo_username

##### Fail2Ban
- /etc/fail2ban/jail.local
>- [DEFAULT] - ignoreip (if defined)
>- [ssh] - port

##### CSF
- /etc/csf/csf.conf
>- TESTING = "0"
>- CONNLIMIT (1 connection allowed on ssh_port)
>- LF_ALERT_TO = "root"
>- TCP_IN, TCP_OUT, UDP_IN, UDP_OUT
>- PORTKNOCKING (if defined)
>- RESTRICT_SYSLOG = "3" - as recommended in csf.conf

- /etc/csf/csf.allow
- /etc/csf/csf.ignore
- /etc/csf/csf.pignore
>- remove exe:/usr/sbin/exim4
>- add exe:/usr/sbin/nullmailer-send
>- add exe:/usr/bin/dbus-daemon
>- add exe:/usr/sbin/atd - i'm not sure if it is secure to remove ressource check for this executable

##### Nullmailer

- /etc/nullamiler/remotes
- /etc/nullmailer/adminaddr
>- Used to redirect local mails to an external email address


##### Psad
- /etc/psad/psad.conf
>- IGNORE_PORTS = port knocking sequence
>- HOSTNAME = machine_name.company_name
>- IPT_SYSLOG_FILE /var/log/syslog (not sure if it is correct)

##### Other
- /etc/mailname
>- Domain name from each mail are sent - machine_name.company_name


## Tricks & Personnal notes

- I personnaly use mandrill with nullmailer, you can send 12 000 mails per month for free. Use the API key as password. -> https://mandrill.com/
- The error log correspond to the error output of simple-ssh, please see the documentation if you have any questions -> https://github.com/MCluck90/simple-ssh


## For white-hats

You are pleased to try to hack this set up and share your results so i can update the configuration.
I am not an expert in security, i have just compiled what i have found on tutorials like those :

##### English
- https://www.digitalocean.com/community/tutorials/an-introduction-to-securing-your-linux-vps
- https://www.digitalocean.com/community/tutorials/how-to-use-psad-to-detect-network-intrusion-attempts-on-an-ubuntu-vps
- https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-12-04
- https://www.digitalocean.com/community/tutorials/how-to-use-psad-to-detect-network-intrusion-attempts-on-an-ubuntu-vps

##### French
- http://openclassrooms.com/courses/securiser-son-serveur-linux
- http://www.alsacreations.com/tuto/lire/622-Securite-firewall-iptables.html
- https://mespotesgeek.fr/configuration-et-securisation-dun-serveur-linux-debian-partie-1/



# TODO
>- chkrootkit
>- clamd.conf
>- update linux - cron
>- update clamav base - cron + freshclam
>- snort / tripwire

>- http://shakup.net/quelques-astuces-pour-securiser-votre-serveur-web-sous-linux/
>- http://www.trustonme.net/didactels/187.html
>- http://cyberzoide.developpez.com/securite/privileges-base-de-donnees/
>- http://securite.developpez.com/cours/

>- https://benchmarks.cisecurity.org/tools2/ubuntu/CIS_Ubuntu_12.04_LTS_Server_Benchmark_v1.0.0.pdf
>- http://askubuntu.com/questions/447144/basic-security-tools-and-packages-that-should-be-installed-on-a-public-facing-we
>- https://www.nsa.gov/ia/_files/os/redhat/rhel5-guide-i731.pdf
>- http://plusbryan.com/my-first-5-minutes-on-a-server-or-essential-security-for-linux-servers
>- https://news.ycombinator.com/item?id=5316093

THE END






