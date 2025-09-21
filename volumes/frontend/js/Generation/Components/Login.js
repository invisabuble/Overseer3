import { Generic_Generation } from "../Generic_Generation/Generic_Generation.js";

export default class Login extends Generic_Generation {
    constructor () {
        super("LOGIN");

        if (!window.LOGIN_PAGE) {
            return;
        }

        // Extract information needed to build the login container.
        var UUID             = "LOGIN";
        var IP               = window.os_host;
        var CONT_NAME        = "Login";
        var creation_time    = new Date().toLocaleString();

        // JSON for building the container element with recursive create.
        var LOGIN_JSON = {
            "container" : {
                "ATTR" : {
                    "id" : `container-${UUID}`,
                    "class" : "display-flex-col _font"
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

                    "content" : {
                        "ATTR" : {
                            "class" : "display-flex-col component_container login_content"
                        },

                        "CHILDREN" : {
                            "username" : {
                                "CHILDREN" : {
                                    "input" : {
                                        "ATTR" : {
                                            "type" : "text",
                                            "name" : "username",
                                            "placeholder" : "Username"
                                        }
                                    }
                                }
                            },
                             "password" : {
                                "CHILDREN" : {
                                    "input" : {
                                        "ATTR" : {
                                            "type" : "password",
                                            "name" : "password",
                                            "placeholder" : "Password"
                                        }
                                    }
                                }
                            },
                            "button" : {
                                "ATTR" : {
                                    "type" : "submit"
                                },
                                "TEXT" : "Login"
                            }
                        }
                    }

                }

            }
        };

        // Generate the container.
        this.recursive_generate(LOGIN_JSON, document.getElementById("body"));

        // Start the up timer.
        this.update_container_timer();

    }

    update_container_timer () {
        /*
        Update the timer within the device header.
        */

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

console.info("Loaded : Login.js");