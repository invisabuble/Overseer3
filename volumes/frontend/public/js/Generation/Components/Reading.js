import { Generic_Active_Component } from "../Generic_Generation/Generic_Active_Component.js";

export default class Reading extends Generic_Active_Component {
    constructor (parent, json, uuid) {
        /* Create a Reading component.

        This component can be invoked using the following type:

        "Reading Name" : {
            "TYPE" : "Reading"
        }

        This element doesnt take an IO as a parameter.
        It is a text element intended to receive text output from the device.

        */
        super(uuid, json);

        var initial_text = this.get_CI_value("TEXT", json[this.NAME]);

        // JSON for building the reading element with recursive create.
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
        // Slice the square brackets off the string and then write it.
        this.COM.content.innerText = state.slice(1, -1);
    }

}

console.info("Loaded : Reading.js");