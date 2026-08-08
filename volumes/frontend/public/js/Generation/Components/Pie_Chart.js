import { Generic_Graph } from "../Generic_Generation/Generic_Graph.js";

export default class Pie_Chart extends Generic_Graph {
    constructor (parent, json, uuid) {
        /* Create a Pie Chart component.

        This component can be invoked using the following type:

        "Pie Chart Name" : {
            "TYPE" : "Pie_Chart"
            "IO"   : 4        <-- IO on the device you wish to toggle.
        }

        This element can also take multiple IO inputs like : [4, 5, 6, ...]

        */
        super(parent, json, uuid, {scales: {x: {
                                                display: false,
                                                grid: { drawTicks: false, drawBorder: false }},
                                            y: {
                                                display: false,
                                                grid: { drawTicks: false, drawBorder: false }}
                                        }});
    }

    update (pie_data) {
        /*
        Change the data within a pie chart.
        */
        // parse the array into an actual array.
        pie_data = JSON.parse(pie_data);
        this.DATA.datasets[0].data = pie_data;
        this.CHART.update();
    }
}

console.info("Loaded : Pie_Chart.js");