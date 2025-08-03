import { Generic_Generation } from "../Generic_Generation/Generic_Generation.js";

export class Container extends Generic_Generation {

    constructor (parent, config, uuid, ip="") {
        super();
        
        // Extract information needed to build the container.
        var UUID             = uuid;
        var IP               = ip;
        var CONT_NAME        = this.get_component_name(config);
        var STYLE            = this.get_CI_value("STYLE", "", config[CONT_NAME]);

        this.parent_cont     = config[CONT_NAME]
        this._CONFIG_PRESENT = true;
        
        // JSON for building the container element with recursive create.
        var CONTAINER_JSON = {
            "container" : {
                "ATTR" : {
                    "id" : `container-${UUID}`,
                    "class" : "display-flex-col _font",
                    "style" : STYLE
                },
                "CHILDREN" : {

                    "header" : {
                        "ATTR" : {
                            "id" : `container-${UUID}H`,
                            "class" : "display-flex",
                            "onclick" :  `window.minimax("container-${UUID}")`
                        },
                        "CHILDREN" : {

                            "container-label" : {
                                "ATTR" : {
                                    "title" : IP
                                },
                                "TEXT" : CONT_NAME
                            },

                            "container-extras" : {
                                "ATTR" : {
                                    "class" : "display-flex"
                                },
                                "CHILDREN" : {
                                    "timer" : {
                                        "ATTR" : {
                                            "title" : "Up time"
                                        },
                                        "CHILDREN" : {
                                            "clock" : {
                                                "TEXT" : "🕐"
                                            },
                                            "time" : {
                                                "TEXT" : " 0s"
                                            }
                                        }
                                    },
                                    "status" : {
                                        "ATTR" : {
                                            "title" : "Connected",
                                            "class" : "connected"
                                        }
                                    }
                                }
                            }

                        }
                    },

                    "config" : {
                        "ATTR" : {
                            "id" : `container-${UUID}C`,
                            "class" : "display-flex-col collapsed"
                        },
                        "CHILDREN" : {

                            "pre" : {
                                "ATTR" : {
                                    "contenteditable" : "true"
                                },
                                "TEXT" : JSON.stringify(config, null, 2)
                            },

                            "button" : {
                                "TEXT" : "Send"
                            }

                        }
                    },

                    "content" : {
                        "ATTR" : {
                            "class" : "display-flex"
                        }
                    }

                }

            }
        };

        // If the config json doesnt contain the __CONFIG__ key then delete the config element within the container.
        if (!this.parent_cont.__CONFIG__) {
            delete CONTAINER_JSON.container.CHILDREN.header.CHILDREN["container-extras"];
            delete CONTAINER_JSON.container.CHILDREN.header.ATTR.onclick;
            delete CONTAINER_JSON.container.CHILDREN.config;
            this._CONFIG_PRESENT = false;
        }

        // Generate the container.
        this.recursive_generate(CONTAINER_JSON, parent);

        // Process the containers elements.
        
        Object.keys(this.parent_cont).forEach( (child) => {

            // If the child is STYLE or __CONFIG__ then skip to the next itteration.
            if (["STYLE", "__CONFIG__"].includes(child.toUpperCase())) {return;}

            // Get the childs type.
            const TYPE = this.get_CI_value("TYPE", "", this.parent_cont[child])

            // Assemble the CHILD's JSON.
            const CHILD_JSON = { [child]: this.parent_cont[child] };

            console.log(CHILD_JSON)

            try {
                this.COM[child] = new window[TYPE.toLowerCase()](this.COM.content, CHILD_JSON, UUID);
            } catch (error) {
                console.log(`Error creating ${TYPE.toLowerCase()} : ${error}`)
            }

        });
        
         // Start the up timer.
        this.update_container_timer();

    }

    is_connected (connected = null) {
        /*
        Update the status within the device header.
        */
        const status = this.COM.status;
        if (connected == false) {
            status.classList.add("disconnected");
            return
        } 
        status.classList.remove("disconnected");
    }

    update_container_timer () {
        /*
        Update the timer within the device header.
        */
        if (this._CONFIG_PRESENT) {
            const current_time = Math.floor(Date.now() / 1000);
            
            const seconds = current_time - this.CREATION_TIME;
            const mins = Math.floor(seconds / 60);
            const hours = Math.floor(mins / 60);
            const days = Math.floor(hours / 24);
            const weeks = Math.floor(days / 7);

            const time_arr   = [weeks, days, hours, mins, seconds];
            const delay_arr  = [604800, 86400, 3600, 60, 1];
            const unit_arr   = ["w", "d", "h", "m", "s"];
            
            let time_index = time_arr.findIndex(num => num !== 0);
            if (time_index === -1) time_index = time_arr.length - 1;

            const time_value = " " + time_arr[time_index] + unit_arr[time_index];
            this.COM.time.innerText = time_value;

            setTimeout(() => this.update_container_timer(), delay_arr[time_index] * 1000);
        }
    }

}

console.info("Loaded : Container.js");