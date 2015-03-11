#!/bin/bash

psad --sig-update && psad -H | mail -s "psad signatures updated on machine.name.company.name" "root"
