import { Generic_Graph } from "../Generic_Generation/Generic_Graph.js";

export default class Pie_Chart extends Generic_Graph {
    constructor (parent, json, uuid) {
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
        this.DATA.datasets[0].data = pie_data;
        this.CHART.update();
    }
}

console.info("Loaded : Pie_Chart.js");