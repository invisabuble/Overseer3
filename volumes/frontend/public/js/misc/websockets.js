
class OSN_client {
    constructor () {}

    connect () {
        this.connection_url = `wss://${window.OSN_host}:${window.OSN_port}/front?UUID=1&USER=${encodeURIComponent(this.user)}`;
        this.socket = new WebSocket(this.connection_url);

        this.socket.onopen = () => {
            console.log("Connected to OSN.");
        }

        this.socket.onmessage = (event) => {
            console.log(event.data);
        }

        this.socket.onclose = (event) => {
            console.log("Disconnected from OSN.");
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