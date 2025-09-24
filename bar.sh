#!/bin/bash

# Initialise/update the submodules.
git submodule update --force --init --recursive

source Overseer.env

function port_check () {
	# Check a list of ports and print out any process using them.
    ALL_PORTS_FREE=1
    for port in "$@"; do
        local PID=$(sudo fuser "$port"/tcp 2>/dev/null | tr -s ' ' | tr ' ' ',' | sed 's/^,//')
        
        if [[ -n "$PID" ]]; then
            echo -e "\033[01;91m$port is being used by PID(s): $PID\033[0;0m"
	    ALL_PORTS_FREE=0
        else
            echo -e "\033[01;92m$port is free.\033[0;0m"
        fi
    done
    if [[ ALL_PORTS_FREE -eq 0 ]]; then
	    echo -e "\033[01;91m\nKill all processes using these ports and then retry launching Overseer.\033[0;0m\n"
		exit
    fi
}

# Build the docker containers.
if [[ $1 = "build" ]]; then

	# Check that the apache certificates have been built
	./docker/docker-apache/apache_init.sh

	# Build the containers.
	echo -e "\033[01;36mBuilding containers for Overseer...\033[0;0m\n"
	docker compose build --no-cache

	if [ $? -eq 0 ]; then
		echo -e "\n\033[01;102m BUILD COMPLETED \033[0;0m\n"
	else
		echo -e "\n\033[01;91m BUILD FAILED \033[0;0m\n"
		exit
	fi
	
fi

# Check that all required ports are free
echo -e "\033[01;93mChecking Overseer ports.\033[0;0m"
port_check 80 8080 443 3306 8765
echo -e "\033[0;0m\033[01;102mAll Overseer ports are free!\033[0;0m\n"

# Run the docker containers in detached mode.
docker compose up Overseer_FE -d
docker compose up Overseer_DB -d