import { Generic_Graph } from "../Generic_Generation/Generic_Graph.js";

export default class Line_Chart extends Generic_Graph {
    constructor (parent, json, uuid) {
        /* Create a Line Chart component.

        This component can be invoked using the following type:

        "Line Chart Name" : {
            "TYPE" : "Line_Chart"
            "IO"   : 4        <-- IO on the device you wish to toggle.
        }

        This element can also take multiple IO inputs like : [4, 5, 6, ...]

        */
        super(parent, json, uuid);
    }
}

console.info("Loaded : Line_Chart.js");