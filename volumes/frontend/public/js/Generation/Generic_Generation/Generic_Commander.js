import { Generic_Active_Component } from "./Generic_Active_Component.js";

export class Generic_Commander extends Generic_Active_Component {

    constructor (uuid, json) {
        super(uuid, json);
    }

    send_command (command) {
        /*
        Send a command to the server.
        */
        window.OSN_Client.OSN_Send(
            this.OSS_Message(command)
        );
    }

    OSS_Message (DATA) {
        const message = {
            "UUID" : this.UUID,
            "IP"   : this.IP,
            "DATA" : DATA
        }
        return message;
    }

    update () {
        // Overwritten by derived class.
    }
    
}