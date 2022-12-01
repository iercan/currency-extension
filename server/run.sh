#!/bin/bash

proc_count=$((`cat /proc/cpuinfo | grep processor | wc -l` + 1 ))

gunicorn -w ${proc_count} --bind 0.0.0.0:5000 app:app
