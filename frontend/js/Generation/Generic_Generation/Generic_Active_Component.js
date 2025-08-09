import { Generic_Generation } from "./Generic_Generation.js";

export class Generic_Active_Component extends Generic_Generation {
    /*
    Active component class
    This class should extend all component classes that require a connection to an IO.
    */
    constructor (uuid, json) {
        super(uuid);

        this.NAME = this.get_component_name(json);
        this.IO   = this.get_CI_value("IO", json[this.NAME], "");

    }
}