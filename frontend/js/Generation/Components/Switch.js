import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export default class Switch extends Generic_Commander {
    constructor (parent, json, uuid) {
        super();

        console.log(`SWITCH PARENT :`)
        console.log(parent)

        this.NAME = this.get_component_name(json);

        var SWITCH_JSON = {
            "switch_container" : {
                "ATTR" : {
                    "class" : "display-flex"
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
                            "toggler" : {
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
        this.COM.toggler.addEventListener('click', this.send_command.bind(this));
    }

    update (state) {
        /*
        Update the state of the switch.
        */
        if (state) {
            this.COM.switch.style.background = "var(--green)";
            this.COM.toggler.style.marginLeft = "calc(var(--switch_length) / 2)";
        } else {
            this.COM.switch.style.background = "var(--red)";
            this.COM.toggler.style.marginLeft = "0px";
        }
    }

}

console.info("Loaded : Switch.js");