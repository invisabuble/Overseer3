import { Generic_Graph } from "../Generic_Generation/Generic_Graph.js";

export default class Line_Chart extends Generic_Graph {
    constructor (parent, json, uuid) {
        super(parent, json, uuid);
    }

    update(data) {
        /*
        Function for updating line charts with one or multiple measurements.
        */

        // Initialise counter if it doesn't exist.
        if (!this.pointCounter) this.pointCounter = 0;

        // Increment point counter for the new label.
        this.pointCounter++;
        this.DATA.labels.push(this.pointCounter);

        // Push new data points for each dataset.
        data.forEach((value, index) => {
            this.DATA.datasets[index].data.push(value);
        });

        // Adjust visible range to only show last DEFAULT_LENGTH points.
        const min = Math.max(0, this.pointCounter - this.DEFAULT_LENGTH);
        const max = this.pointCounter;

        this.CHART.options.scales.x.min = min;
        this.CHART.options.scales.x.max = max;

        // Update the chart to show the changes.
        this.CHART.update();
    }


    add_random () {
        /*
        TEST FUNCTION
        */
        const nums = Array.from({ length: this.CHART_NUM }, () => Math.floor(Math.random() * 101));
        this.update(nums);
    }

}

console.info("Loaded : Line_Chart.js");