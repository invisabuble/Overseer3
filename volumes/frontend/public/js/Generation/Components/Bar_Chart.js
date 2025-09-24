import { Generic_Graph } from "../Generic_Generation/Generic_Graph.js";

export default class Bar_Chart extends Generic_Graph {
    constructor (parent, json, uuid) {
        super(parent, json, uuid);
    }
}

console.info("Loaded : Bar_Chart.js");