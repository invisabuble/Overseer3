import { Generic_Generation } from "./Generic_Generation.js";

export class Generic_Commander extends Generic_Generation {

    constructor () {
        super();
    }

    send_command () {
        /*
        Send a command to the server.
        */
        console.log(`SENDING COMMAND FROM ${this.NAME}...`);
    }
    
}