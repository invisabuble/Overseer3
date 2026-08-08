import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export default class Button extends Generic_Commander {
    constructor (parent, json, uuid) {
        /* Create a Button component.

        This component can be invoked using the following type:

        "Button Name" : {
            "TYPE" : "Button"
            "IO"   : 4        <-- IO on the device you wish to toggle.
        }

        This element can also take multiple IO inputs like : [4, 5, 6, ...]
        When toggled all of the entered IO will also toggle

        */
        super(uuid, json);

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
        this.COM.os_button.addEventListener('pointerdown', this.send_command.bind(this, {[this.NAME] : ""}));
        this.COM.os_button.addEventListener('pointerup', this.send_command.bind(this, {[this.NAME] : ""}));

    }

    update (state) {
        /*
        Update the state of the button.
        */

        const Json_State = JSON.parse(state);
        state = Boolean(Number(Json_State[0]));

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