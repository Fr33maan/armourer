#!/bin/bash
# written by Tomas Nevar (tomas@lisenet.com)
# github -> https://github.com/crylium/clamav-daily/issues
# 17/01/2014 (dd/mm/yy)
# copyleft free software
#
LOGFILE="/var/log/clamav/clamav-$(date +'%Y-%m-%d').log";
EMAIL_MSG="The system is infected, see the log file attached";
EMAIL_FROM="clamav@machine.name.company.name";
EMAIL_TO="root";
DIRTOSCAN="/";


# Update ClamAV database
echo "Looking for ClamAV database updates...";
freshclam --quiet;

TODAY=$(date +%u);

DIRSIZE=$(du -sh "$DIRTOSCAN"  2>/dev/null|cut -f1);
echo -e "Starting a daily scan of "$DIRTOSCAN" directory.\nAmount of data to be scanned is "$DIRSIZE".";
clamscan -ri "$DIRTOSCAN" &>"$LOGFILE";


# get the value of "Infected lines"
MALWARE=$(tail "$LOGFILE"|grep Infected|cut -d" " -f3);

# if the value is not equal to zero, send an email with the log file attached, else send a mail to say that everything is ok
if [ "$MALWARE" -ne "0" ]; then
	echo "$EMAIL_MSG"|mail -a "$LOGFILE" -s "ClamAV: Malware Found on machine.name.company.name" -r "$EMAIL_FROM" "$EMAIL_TO";
else
  echo "No infected file found on machine.name.company.name, everything is OK"|mail -s "ClamAV : No infected file found" -r "$EMAIL_FROM" "$EMAIL_TO";
fi

echo "The script has finished.";
exit 0;
