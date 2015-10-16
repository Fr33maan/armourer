#!/bin/bash

chmod +x /etc/cron.daily/psad_update
chmod +x /etc/cron.daily/clamscan

echo "Now reseting rkhunter baseline"
rkhunter --propupd

