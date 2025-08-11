import { Generic_Generation } from "./Generic_Generation.js";

export class Generic_Graph extends Generic_Generation{
    constructor (parent, json, uuid, OPTIONS = {}) {
        /*
        Valid chart types are as follows:

            - line: Displays data points connected by straight lines, great for showing trends over time.
            - bar: Uses vertical bars to compare different categories or values.
            - bar (horizontal): Similar to bar charts but with horizontal bars, useful for long category names.
            - pie: Shows proportions of a whole as slices of a circle, ideal for percentage data.
            - doughnut: Like a pie chart but with a hole in the center, emphasizing part-to-whole relationships.
            - polarArea: Displays data in a circular layout with sectors sized by value, useful for comparing categories radially.
            - radar: Plots data points on axes starting from the same point, forming a web shape, perfect for multivariate data.
            - bubble: A scatter plot where each point’s size reflects a third variable, adding depth to data analysis.
            - scatter: Plots individual data points on X and Y axes, great for showing relationships or distributions.
            - area: Essentially a line chart with the area below the line filled, emphasizing volume or magnitude over time.

        Any updates sent to charts that have more than one measurement 

        */
        super(uuid);

        // Setup required values.
        this.NAME           = this.get_component_name(json);
        this.CHART_TYPE     = this.get_CI_value("TYPE", json[this.NAME]);
        this.CHART_NUM      = 0;

        // If OPTIONS was defined in the JSON then overwrite with the options from the JSON.
        OPTIONS = this.get_CI_value("OPTIONS", json[this.NAME]) || OPTIONS;

        // Split the type of chart out into lowercase so that chart.js can understand it.
        this.CHART_JS_TYPE = this.CHART_TYPE.split("_")[0].toLowerCase();
        this.DEFAULT_LENGTH = Number(this.get_CI_value("LENGTH", json[this.NAME], "10"));

        // Datastructure used for the chart.
        this.DATA       = {
            labels   : [],
            datasets : []
        };

        // Get the list of IO's to be measured, and their associated labels if they exist.
        this.IO_LIST    = this.get_CI_value("IO", json[this.NAME], []);
        this.LABELS     = this.get_CI_value("LABELS", json[this.NAME]);

        switch (this.CHART_TYPE) {

            case "Pie_Chart":
                // Setup the datastructure for a pie chart.
                var io_dataset = {
                    data: [],
                };
                // Create an array of the length of the number of IO's
                io_dataset.data = Array(this.IO_LIST.length).fill(1);
                this.DATA.labels = this.LABELS;
                this.DATA.datasets.push(io_dataset);
                break;

            default:
                // Iterate through the combined list and add the datasets to the DATA object.
                // This is the default behaviour but special cases require other methods to setup their datastructures.
                // Combine the IO and LABEL lists into an object.
                // We combine the lists so we can match up labels to IO
                const combined = this.IO_LIST
                        .map((io, index) => [io, this.LABELS[index]])
                        .filter(([key, value]) => value !== undefined);
                        
                for (const IO_LAB of combined) {

                    var io_dataset = {
                        data:[],
                        label:String(IO_LAB[1])
                    };

                    this.DATA.datasets.push(io_dataset);  // Add the dataset to the DATA object.
                    this.CHART_NUM ++;                    // Increment this number to keep track of the number of measurements on this chart.
                }
                break;

        }

        // Default options for building the chart.
        const DEFAULT_OPTIONS = {
            animation: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "X",
                    },
                    min: 0,
                    max: this.DEFAULT_LENGTH
                },
                y: {
                    title: {
                        display: true,
                        text: "Y"
                    }
                }
            },
            plugins: {
                tooltip: {
                    intersect: false
                }
            },
            elements: {
                line: {
                    tension: 0.2
                }
            }
        };

        // JSON for building all graph containers.
        var CHART_JSON = {
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
                            "class" : "display-flex component_container"
                        },
                        "CHILDREN" : {
                            "canvas" : {
                                "ATTR" : {
                                    "class" : `generic_chart ${this.CHART_TYPE}`
                                }
                            }
                        }
                    }
                }
            }
        };

        // Create the chart container.
        this.recursive_generate(CHART_JSON, parent);

        // Once the container has been created then create the chart.
        this.CHART = new Chart(
            this.COM.canvas,
            {
                type: this.CHART_JS_TYPE,
                data: this.DATA,
                options: { ...DEFAULT_OPTIONS, ...(OPTIONS ?? {}) } // If OPTIONS is defined, spreads it's keys on top (overriding defaults).
            }
        );

    }

    update (data) {
        /*
        Generic update function for updating charts with one or more measurements.
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