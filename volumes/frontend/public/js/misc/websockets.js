class OSN_client {
    
    static device_list = [];
    static connection_config = {
        "FE" : {
            "__CONFIG__" : {
                "USER" : window.OSN_user
            }
        }
    }

    constructor () {}

    connect () {
        this.connection_url = `wss://${window.OSN_host}:${window.OSN_port}/front?CONF=${JSON.stringify(OSN_client.connection_config)}`;
        this.socket = new WebSocket(this.connection_url);

        this.socket.onopen = () => {
            console.log("Connected to OSN.");
        }

        this.socket.onmessage = (event) => {
            console.log(event.data);
            const MSG = JSON.parse(event.data);
            window.Controllables[MSG["UUID"]].update(MSG["UPDATE"]);
        }

        this.socket.onclose = (event) => {
            // If disconnected, attempt to reconnect every 5 seconds.
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