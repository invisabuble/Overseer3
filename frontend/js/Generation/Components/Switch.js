import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export class Switch extends Generic_Commander {
    constructor (parent, json, uuid) {
        super();

        this.NAME = this.get_component_name(json);

        var SWITCH_JSON = {
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

        this.recursive_generate(SWITCH_JSON, parent);

        this.COM.toggler.addEventListener('click', this.send_command.bind(this));
    }

    update (state) {
        if (state) {
            this.COM.switch.style.background = "var(--green)";
            this.COM.toggler.style.marginLeft = "calc(var(--switch_length) / 2)";
        } else {
            this.COM.switch.style.background = "var(--red)";
            this.COM.toggler.style.marginLeft = "0px";
        }
    }

}