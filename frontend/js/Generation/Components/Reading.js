import { Generic_Generation } from "../Generic_Generation/Generic_Generation.js";

export default class Reading extends Generic_Generation {
    constructor (parent, json, uuid) {
        /* Create a Reading component.

        This component can be invoked using the following type:

        "TYPE" : "Reading"

        */
        super(uuid);

        this.NAME = this.get_component_name(json);
        var initial_text = this.get_CI_value("TEXT", json[this.NAME]);

        // JSON for building the container element with recursive create.
        var READING_JSON = {
            "container" : {
                "ATTR" : {
                    "class" : "display-flex-col _font"
                },
                "CHILDREN" : {
                    "header" : {
                        "ATTR" : {
                            "class" : "display-flex"
                        },
                        "CHILDREN" : {

                            "container-label" : {
                                "TEXT" : this.NAME
                            }

                        }
                    },
                    "content" : {
                        "ATTR" : {
                            "class" : "display-flex component_container reading_text"
                        },
                        "TEXT" : initial_text
                    }
                }
            }
        };

        // Generate the object.
        this.recursive_generate(READING_JSON, parent);

    }

    update (state) {
        this.COM.content.innerText = state;
    }

}