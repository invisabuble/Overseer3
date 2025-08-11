import { Generic_Active_Component } from "../Generic_Generation/Generic_Active_Component.js";

export default class Bar extends Generic_Active_Component {
    constructor (parent, json, uuid) {
        /* Create a Bar component.

        This component can be invoked using the following type:

        "TYPE" : "Bar"

        */
        super(uuid, json);

        // JSON for building the reading element with recursive create.
        var BAR_JSON = {
            "bar_container" : {
                "ATTR" : {
                    "class" : "display-flex"
                },
                "CHILDREN" : {
                    "label" : {
                        "TEXT" : this.NAME
                    },
                    "bar" : {
                        "ATTR" : {
                            "class" : "display-flex"
                        },
                        "CHILDREN" : {
                            "bar_filler" : {
                                "ATTR" : {
                                    "class" : "display-flex bar_filler"
                                },
                                "CHILDREN" : {
                                    "bar_number" : {
                                        "ATTR" : {
                                            "class" : "display-flex"
                                        },
                                        "TEXT" : "50%"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        // Generate the object.
        this.recursive_generate(BAR_JSON, parent);

    }

    update (state) {
        /*
        Update the bars width.
        */

        if (state < 0) {state = 0}
        if (state > 100) {state = 100}
        
        var text = `${state}%`;
        this.COM.bar_number.innerText   = text;
        this.COM.bar_filler.style.width = text;

        var margin_value = `calc( (var(--d_bar_number) + 5 * var(--bar_padding)) * ${state}/100 - ( var(--d_bar_number) + 4 * var(--bar_padding) ) )`;
        this.COM.bar_number.style.marginRight = margin_value;
    }

}

console.info("Loaded : Bar.js");