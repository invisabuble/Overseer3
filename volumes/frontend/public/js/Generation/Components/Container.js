import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export default class Container extends Generic_Commander {

    constructor (parent, config, uuid, ip="") {
        super(uuid, config);
        
        // Extract information needed to build the container.
        var UUID             = uuid;
        var IP               = ip;
        var STYLE            = this.get_CI_value("STYLE", config[this.NAME]);
        var creation_time    = new Date().toLocaleString();

        this.parent_cont     = config[this.NAME]
        this._CONFIG_PRESENT = true;
        this._CONFIG_VALID   = true;

        this.PANELS = {};
        this.all = {};
        
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
                                "TEXT" : this.NAME
                            },

                            "container-extras" : {
                                "ATTR" : {
                                    "class" : "display-flex"
                                },
                                "CHILDREN" : {
                                    "timer" : {
                                        "ATTR" : {
                                            "title" : creation_time
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
                                    "contenteditable" : "true",
                                    "data-gramm" : "false",
                                    "data-gramm_editor" : "false",
                                    "data-enable-grammarly" : "false"
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
                            "class" : "display-flex component_container"
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

        // Generate all the child components within the container.
        Object.entries(this.parent_cont).forEach(([child, config]) => {

            // If the child doesnt have a type then skip over creating it.
            const TYPE = this.get_CI_value("TYPE", config)?.toLowerCase();
            if (!TYPE) return;

            let parent_object = this.COM.content;

            if (TYPE !== "container") {
                // If the type isnt a container then generate a component panel to store the components in an organised manner.
                const panelKey = `${TYPE}_panel`;
                if (!this.COM[panelKey]) {
                    this.COM[panelKey] = this.create_element(`${TYPE}_panel`, { class: "display-flex panel" });
                    this.append_element(this.COM.content, this.COM[panelKey]);
                }
                // If the type isnt a container then switch the parent above to the panel,
                // so the component ends up in the panel once created.
                parent_object = this.COM[panelKey];
            }

            try {
                // Try generating the component.
                const component = new window.OS_Components[TYPE](parent_object, { [child]: config }, UUID);
                this.COM[child] = component;
            } catch (error) {
                console.error(`Error creating component: ${child} of type '${TYPE}':`, error);
            }
        });

        // If the config is present then add an event listeners.
        if (this._CONFIG_PRESENT) {
            // Add an event listener to the send button.
            this.COM.button.addEventListener('click', this.send_new_config.bind(this));

            // Add an event listener to the pre tag.
            this.COM.pre.addEventListener('input', this.validate_config.bind(this))
        }
        
        // Start the up timer.
        this.update_container_timer();

        // Register all components into the top level 'all' property.
        this.register_all(this);

    }

    register_all(component = this, path = []) {
        /*
        Iterate through all child elements adding only those with an `update` method
        to the "all" property of the top-level container.
        Elements in different containers with the same names are allowed.
        Two elements on the same level cannot have the same name.
        This means that all lower level components are acessible from the top layer.
        */
        const prefix = path.join("/");

        for (const key in component.COM) {
            const child = component.COM[key];
            const fullKey = prefix ? `${prefix}/${key}` : key;

            // Only add elements that have an 'update' method
            if (typeof child.update === "function") {
                this.all[fullKey] = child;
            }

            // Recursively register children if they also have a COM and all
            if (child.COM && child.all) {
                this.register_all(child, [...path, key]);
            }
        }
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

    // JSON config related functions.

    getErrPos(e, text) {
        /*
        Return the position of the first error in the JSON.
        */
        let m = e.message.match(/at position (\d+)/);
        if (m) return parseInt(m[1]);
        m = e.message.match(/line (\d+) column (\d+)/);
        if (m) {
        const lines = text.split('\n');
        return lines.slice(0, parseInt(m[1]) - 1).reduce((a, l) => a + l.length + 1, 0) + parseInt(m[2]) - 1;
        }
        return null;
    }

    escHtml(s) {
        /*
        Replace regular HTML with entity equivalents so we can see the error marker.
        */
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    validate_config() {
        /*
        Parse the JSON text and add a red mark if an error is found.
        */
        const editor = this.COM.pre;
        const text = editor.innerText;

        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const pre = range.cloneRange();
        pre.selectNodeContents(editor);
        pre.setEnd(range.endContainer, range.endOffset);
        const offset = pre.toString().length;

        try {
            // Attempt to parse the JSON.
            JSON.parse(text);
            editor.innerHTML = this.escHtml(text);
            // Change the validation flag.
            this._CONFIG_VALID = true;
        } catch (e) {
            // If an error is found then add the error mark.
            const p = this.getErrPos(e, text) ?? text.length - 1;
            editor.innerHTML = this.escHtml(text.slice(0, p))
                + '<mark style="background:#e05;color:#fff">' + (this.escHtml(text[p]) || ' ') + '</mark>'
                + this.escHtml(text.slice(p + 1));

            // Change the validation flag.
            this._CONFIG_VALID = false;
        }

        // Reset the cursor to the position where the user is typing.
        // Without this the cursor will snap to the top of the div whenever a character is entered.
        let remaining = offset;
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const len = walker.currentNode.length;
            if (remaining <= len) {
                const r = document.createRange();
                r.setStart(walker.currentNode, remaining);
                r.collapse(true);
                sel.removeAllRanges();
                sel.addRange(r);
                break;
            }
            remaining -= len;
        }
    }

    send_new_config () {
        /*
        Send the new config to the device.
        */
        if (this._CONFIG_VALID) {
            console.log(`Sending new config to : ${this.UUID}`);

            // Get the valid config.
            const CONFIG = JSON.stringify(
                JSON.parse(this.COM.pre.innerText)
            );

            const DATA = {
                "CONFIG" : CONFIG
            }

            this.send_command(DATA);

        } else {
            console.log(`There is an error in the ${this.NAME} JSON`);
        }
        
    }

    update (message) {
        // Extract the element that needs updating and the state.
        console.log(message);
        const json_message = JSON.parse(message);
        const gpio_states = Object.entries(json_message);

        if (gpio_states[0][0] == "CLOSED") {
            // Delete the device from the frontend.
            this.COM.container.style.animation = "fade_out 0.5s ease"
            setTimeout(() => {
                delete window.Controllables[this.UUID];
                this.COM.container.remove()
            }, 501);
            return;
        }

        for (const [gpio, state] of gpio_states) {
            this.all[gpio].update(state);
        }

    }

}

console.info("Loaded : Container.js");