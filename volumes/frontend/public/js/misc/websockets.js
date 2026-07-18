class OSN_client {
    
    static device_list = [];
    static connection_config = {
        "FE" : {
            "__CONFIG__" : {
                "USER" : window.OSN_user
            }
        }
    }
    static connection_status = document.getElementById('server_status');

    constructor () {}

    connect () {
        this.connection_url = `wss://${window.OSN_host}:${window.OSN_port}/front?CONF=${JSON.stringify(OSN_client.connection_config)}`;
        this.socket = new WebSocket(this.connection_url);

        this.socket.onopen = () => {
            console.log("Connected to OSN.");
            OSN_client.connection_status.className = 'connected';
        }

        this.socket.onmessage = (event) => {
            const MSG = JSON.parse(event.data);            
            const DATA = MSG?.DATA ?? "";
            // If the DATA key is not present/empty then this is the first connection.
            if (DATA == "") {
                // Extract the connection info from the mesage.
                
                const USER = MSG?.USER ?? "";
                const UUID = MSG?.UUID ?? "";
                const IP   = MSG?.IP ?? "";
                const CONF = MSG?.CONF ?? "";

                // If the UUID isnt in the global controllables object then create that 
                if (!(UUID in window.Controllables)) {
                    window.Controllables[UUID]= new window.OS_Components["container"](
                        document.getElementById("devices"),
                        JSON.parse(CONF),
                        UUID,
                        IP
                    );
                }
            }

            if (DATA != "") {
                // If there is data in the DATA key then process it.
                const UUID   = DATA?.UUID   ?? "";
                const UPDATE = DATA?.UPDATE ?? "";

                if (UUID == "" || UPDATE == "") {return;}

                if (UPDATE == "CLOSE") {
                    window.Controllables[UUID].is_connected(false);
                    return;
                }



                window.Controllables[UUID].update(UPDATE);
            }
            
        }

        this.socket.onclose = (event) => {
            // If disconnected, attempt to reconnect every 5 seconds.
            OSN_client.connection_status.className = 'disconnected';
            console.log("Disconnected from OSN.");
            setTimeout(() => this.connect(), 5000);
        }
    }

    OSN_Send (message) {
        // If the passed message is a string send it to the server.
        if (!this.socket) {return;}
        if (typeof message === 'string') {
            this.socket.send(message);
        }
    }

}

export const OSN_Client = new OSN_client