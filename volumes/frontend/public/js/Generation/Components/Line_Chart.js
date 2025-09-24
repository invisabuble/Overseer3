import { Generic_Graph } from "../Generic_Generation/Generic_Graph.js";

export default class Line_Chart extends Generic_Graph {
    constructor (parent, json, uuid) {
        super(parent, json, uuid);
    }
}

console.info("Loaded : Line_Chart.js");