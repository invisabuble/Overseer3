import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export default class Button extends Generic_Commander {
    constructor (parent, json, uuid) {
        super();

        this.NAME = this.get_component_name(json);

        var BUTTON_JSON = {
            "button_container" : {
                "ATTR" : {
                    "class" : "display-flex component_container"
                },
                "CHILDREN" : {
                    "label" : {
                        "TEXT" : this.NAME
                    },
                    "os_button" : {
                        "ATTR" : {"class" : "display-flex"},
                        "CHILDREN" : {
                            "button_toggler" : {}
                        }
                    }
                }
            }
        }

        // Generate the object.
        this.recursive_generate(BUTTON_JSON, parent);

        // Bind the send command method to the toggler.
        this.COM.os_button.addEventListener('click', this.send_command.bind(this));

    }

    update (state) {
        /*
        Update the state of the button.
        */
        if (state) {
            this.COM.os_button.style.background = "var(--green)";
            this.COM.button_toggler.style.marginTop = "calc(var(--switch_length) / 4)";
        } else {
            this.COM.os_button.style.background = "var(--red)";
            this.COM.button_toggler.style.marginTop = "0px";
        }
    }

}

console.info("Loaded : Button.js");