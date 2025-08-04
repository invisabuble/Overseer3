import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export default class Switch extends Generic_Commander {
    constructor (parent, json, uuid) {
        super();

        this.NAME = this.get_component_name(json);

        var SWITCH_JSON = {
            "switch_container" : {
                "ATTR" : {
                    "class" : "display-flex component_container"
                },
                "CHILDREN" : {
                    "label" : {
                        "TEXT" : this.NAME
                    },
                    "switch" : {
                        "ATTR" : {
                            "class" : "display-flex"
                        },
                        "CHILDREN" : {
                            "switch_toggler" : {
                                "ATTR" : {
                                    "class" : "display-flex"
                                }
                            }
                        }
                    }
                }
            }
        }

        // Generate the object.
        this.recursive_generate(SWITCH_JSON, parent);

        // Bind the send command method to the toggler.
        this.COM.switch.addEventListener('click', this.send_command.bind(this));
    }

    update (state) {
        /*
        Update the state of the switch.
        */
        if (state) {
            this.COM.switch.style.background = "var(--green)";
            this.COM.switch_toggler.style.marginLeft = "calc(var(--switch_length) / 2)";
        } else {
            this.COM.switch.style.background = "var(--red)";
            this.COM.switch_toggler.style.marginLeft = "0px";
        }
    }

}

console.info("Loaded : Switch.js");