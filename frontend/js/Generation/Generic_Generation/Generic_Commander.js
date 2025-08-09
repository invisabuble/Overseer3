import { Generic_Active_Component } from "./Generic_Active_Component.js";

export class Generic_Commander extends Generic_Active_Component {

    constructor (uuid, json) {
        super(uuid, json);
    }

    send_command (command) {
        /*
        Send a command to the server.
        */
        console.log(`SENDING COMMAND TO ${this.UUID}, FROM ${this.NAME}`);
        console.log(command);
    }

    update () {
        // Overwritten by derived class.
    }
    
}