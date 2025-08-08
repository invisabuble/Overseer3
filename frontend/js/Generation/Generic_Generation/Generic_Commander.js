import { Generic_Generation } from "./Generic_Generation.js";

export class Generic_Commander extends Generic_Generation {

    constructor (uuid) {
        super(uuid);
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