![armourer_logo](https://raw.githubusercontent.com/prisonier/armourer/master/assets/images/armourer_logo.png)
* * *

# Armourer

Armourer exists because I need an uniform security configuration for any server I could administrate.
It is designed to prepare a Debian server for a production secured environment.
Armourer will automatically install some security softwares and configure them with very simple user input.
Armourer aims to become a standard in security stack, and it needs you.

---

## Summary
  - ####[1. How it works ?](#how_it_works)
  - ####[2. Installation](#installation)
  - ####[3. Use it !](#use_it)
  - ####[4. Configuration](#configuration)
  - ####[5. Custom software stacks](#custom_software_stacks)
  - ####[6. Notes](#notes)
  - ####[7. Sources](#sources)

---

## <a name="how_it_works"></a> 1. How it works ?
- create an user on your debian server
- create your configuration files with only 10 variables such as your email address, the ports to open or the secret port knocking combination you want to use
- *add an optional software stack or create your very own software stack
- lunch the install by clicking on a button
- connect to your server and install what you want, it has been armoured

---

## <a name="installation"></a> 2. Installation

#### Armourer is a Node app built with Sails.js framework

---

  - ### a. Dependencies
    - node.js
    - mongodb
    - node packet manager

---

  - ### b. Local install process

    Simply clone the directory

    ```linux
    git clone https://github.com/prisonier/armourer.js.git

    ```

    Go to your directory and lunch npm install

    ```linux
    sudo npm install

    ```

    Then lunch the server with this command

    ```linux
    sails lift

    ```

---

  - ### c. Remote install - prerequisites

    Before beeing able to configure your server, you will need to add it to the known hosts of the sails machine.

    Simply connect to your server with ssh to do it. I'm working with debian so this is the commands I used.

    ---

      - #### I. Connect to your remote server

      ```linux
      ssh root@host_ip -p port

      ```

      Sometimes you are not able to connect to the server and you will have to reset the known host file of your local server.

      ```linux
      ssh-keygen -R host_ip

      ```

      ---

      - #### II. Create user on your remote server

      ```linux
      adduser yourUsername

      ```

---

## <a name="use_it"></a> 3. Use it !

#### Quite straight forward
---

Sails.js runs its server on port 1337, so you will find the app at http://localhost:1337 and click on "install a server" in the navbar.

  - ### a. Configure the server

    you need :
      - the server IP
      - the admin email address
      - the username of the user you just created on your remote server
      - the smtp server
      - the smtp server login
      - the smtp server password
      - the name of the server
      - the name of your company which is used for the machine group

    ---
    ** Ports policy and Other are optional -> see the configuration section **

    Click on "Save server and generate files"

---

  - ### b. Install the server

    - enter root password (and other additional stack specific passwords)
    - click on "install the server"

    ---
    You can see the installation progress. Armourer register the install logs in logs/host_ip:host_ssh_port

    Your server is now configured, you can use it !

    ** You should change the root password and the sudo password of your server **, I promise that there is no secret function that send
    me an email with your password but it is more secure to change them.

---

## <a name="configuration"></a> 4. Configuration

---

  - ### a. Additional server configuration

    ** Ports policy : **
      - The future ssh port
      - ports TCP IN to open
      - ports TCP OUT to open (default to : ssh port, 80 for debian updates, 465 for SSMTP)
      - ports UDP IN to open
      - ports UDP OUT to open (default to 123 for NTP)
      - port knocking sequence -> a port sequence you will "ping" to open the ssh port

        ** Important : **
        If you change the default ssh port(22), be sure to open the ssh port in TCP_IN & TCP_OUT OR to to create a port knocking sequence.
        Otherwise you will never be able to connect to your server once installation is over.

    ---
    ** Other : **
      - The current ssh port of your server
      - IP or group of IPs you want to exclude from firewall check (eg. your IP) - separated by commas

    ---
    ** Software stacks : **

    Armourer give you the ability to add security or any kind of software by create your custom stack very easily.
    Currently only LAMP exists and it is more a proof of concept than a seriously configured stack.
    See [Custom software stacks](#custom_software_stacks)

    LAMP :
      - webworker_user : the name of the user who will host websites in his home directory.
      - ** If you use the LAMP stack and you want to use the webwroker_user to connect via SFTP, you will need to add the webworker_user in the allowed user in /etc/sshd_config **

  ---

  - ### b. Security stack software and their configuration

      - #### I. Software used

        ** Security stack : **
          - wget -> http://www.gnu.org/software/wget/
          - unattended-upgrades -> https://wiki.debian.org/UnattendedUpgrades
          - nullmailer -> http://untroubled.org/nullmailer/
          - clamav -> http://www.clamav.net/index.html
          - rkhunter -> http://rkhunter.sourceforge.net/
          - logwatch -> http://sourceforge.net/projects/logwatch/
          - fail2ban -> http://www.fail2ban.org/wiki/index.php/Main_Page
          - CSF+LFD -> http://configserver.com/cp/csf.html
          - psad -> http://cipherdyne.org/psad/

        ---
        ** LAMP stack **
          - apache -> https://httpd.apache.org/
          - mysql -> https://www.mysql.com/
          - php -> https://secure.php.net/
          - phpMyAdmin -> https://www.phpmyadmin.net/
          - VSFTP -> https://wiki.debian.org/vsftpd

      ---

      - #### II. Software configuration

        ** Debian : **
          - IPV6 is disabled
          - Root login on ssh is disabled
          - We allow only the sudo account you specified in config to login on ssh
          - Exim4 is removed because in most cases we do not need a mail server -> replaced by nullmailer

        ---
        ** RKHunter **
        - /etc/rkhunter/rkhunter.conf
          - MAIL-ON-WARNING="root"

        ---
        ** SSH **
        - /etc/ssh/sshd_config
          - PermitRootLogin no
          - port
          - AllowUsers sudo_username

        ---
        ** Fail2Ban **
        - /etc/fail2ban/jail.local
          - [DEFAULT] - ignoreip (if defined)
          - [ssh] - port

        ---
        ** CSF **
        - /etc/csf/csf.conf
          - TESTING = "0"
          - CONNLIMIT (1 connection allowed on ssh_port)
          - LF_ALERT_TO = "root"
          - TCP_IN, TCP_OUT, UDP_IN, UDP_OUT
          - PORTKNOCKING (if defined)
          - RESTRICT_SYSLOG = "3" - as recommended in csf.conf
          - URLGET = "1" - Perl module for LWP must be manually installed

        - /etc/csf/csf.allow
        - /etc/csf/csf.ignore
        - /etc/csf/csf.pignore
          - remove exe:/usr/sbin/exim4
          - add exe:/usr/sbin/nullmailer-send
          - add exe:/usr/bin/dbus-daemon
          - add exe:/usr/sbin/atd - i'm not sure if it is secure to remove ressource check for this executable

        ---
        ** Nullmailer **
        - /etc/nullamiler/remotes
        - /etc/nullmailer/adminaddr
          - Used to redirect local mails to an external email address

        ---
        ** Psad **
        - /etc/psad/psad.conf
          - IGNORE_PORTS = port knocking sequence
          - HOSTNAME = machine_name.company_name
          - IPT_SYSLOG_FILE /var/log/syslog (not sure if it is correct)
          - EMAIL_ALERT_DANGER_LEVEL    3 -> or we will be mailed very often
          - ENABLE_AUTO_IDS             Y -> enable IP auto blocking
          - AUTO_IDS_DANGER_LEVEL       3 -> blocking IP if danger level is 3 or above
          - AUTO_BLOCK_TIMEOUT          36000 -> blocking time 10 hours

        ---
        ** Other **
        - /etc/mailname
          - Domain name from each mail are sent - machine_name.company_name

        ---
        ** Cron **
        - /etc/crontab
          - change when cron.daily is executed from 6:25 to 2:00

---

## <a name="custom_software_stacks"></a> 5. Custom software stacks

---

  You can create as many different stack as you want and install them separately independently.

  You can very easily creates new module with just some configuration and without writing any code.

  Before creating your modules you need to understand how stacks are installed.

  - ### a. How stacks works

    1. config templates are generated and some variables inside are replaced with regex -> template_builder.js
    2. "before.sh" bash is run on remote host. You can specify arguments to run the script -> before/before.sh
    3. All files are transferred from local to remote -> files_to_transfer.js
    4. "after.sh" bash is run on remote host. You can specify arguments to run the script -> after/after.sh

  - ### b. Create a custom stack

    Architecture of stacks

    ```
    /linux_config
      /config
        /your_module_name
          /before
            before.sh
            config.js
          /after
            after.sh
            config.js
          files_to_transfer.js
          post_variables.js
          template_builder.js
      /templates
        /your_module_name
          /what
            /ever
              /you
                /want
    ```

    1. create a folder in linux_config/config with the name of your module
    2. Add your module to the module_order.js file AFTER THE SECURITY MODULE as this module will update the system
    3. create folders "before" and "after"
    4. create a post_variables.js file. This file will contain the variables which will appear in the forms.
    In the "install" array there is the variables which appear in the install form (when you create the server)
    In the "secret" array, there is the different passwords needed to install your server (root password, mysql password or any other password needed for your scripts)

    5. Create a folder with your module name in linux_config/templates
    6. Organize your module files as you want
    7. Create a files_to_transfer.js file and list the files of your module and their destination on the server
    8. Create a replace file with the rules you need - take lamp/template_builder.js as an example


---

## <a name="sources"></a> 6. Notes

---

#### Tricks & Personnal notes

- I personnaly use mandrill with nullmailer, you can send 12 000 mails per month for free. Use the API key as password. -> https://mandrill.com/
- The error log correspond to the error output of simple-ssh, please see the documentation if you have any questions -> https://github.com/MCluck90/simple-ssh
- I did not installed snort because it needs Apache and mysql server. Because i wanted the install as minimal as possible. But there is this automatic installation script -> https://github.com/da667/Autosnort
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


---

#### System update
The package "unattended-upgrades" will automatically download debian security updates.

ClamAV database is updated once an hour, clamscan is performed once a day during the night and an email will be sent if an infected file is found.

Psad signature update is also performed once a day. You can find update script in /etc/cron.daily/


---

#### Planned features & TODO

- fix the "[psad-status]firewall setup warning on ..." in daily emails
- at this moment (march 2015), clamav version in debian repo is 0.98.5 while last stable version of clamav is 0.98.6 -> install manually last version
- merge all information emails into one email
- edit a server and reinstall it
- explain that is going in "error log" is not really error but what is flagged as error in stdout in ssh npm
- error : Once the server is installed, the node server will crash after a while. I didn't investigated more.

  - http://stackoverflow.com/questions/31501038/node-js-error-read-econnreset
  - http://stackoverflow.com/questions/17245881/node-js-econnreset
  ```javascript
      events.js:85
            throw er; // Unhandled 'error' event
                  ^
      Error: read ECONNRESET
          at exports._errnoException (util.js:746:11)
          at TCP.onread (net.js:559:26)
  ```

---

## <a name="sources"></a> 7. Sources

---

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

