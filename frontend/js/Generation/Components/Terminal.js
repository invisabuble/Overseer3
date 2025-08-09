import { Generic_Commander } from "../Generic_Generation/Generic_Commander.js";

export default class Terminal extends Generic_Commander {
    /* Create a Terminal component.

    This component can be invoked using the following type:

    "TYPE" : "Terminal"

    */

    constructor (parent, json, uuid) {
        super(uuid, json);

        this.command_count = 0;
        this.command_selector = 0;

        var TERMINAL_JSON = {
            "container" : {
                "ATTR" : {
                    "class" : "display-flex-col _font terminal_window",
                    "style" : "resize: both;"
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
                            "class" : "display-flex-col component_container terminal_content "
                        },
                        "CHILDREN" : {
                            "stdout" : {
                                "ATTR" : {
                                    "class" : "display-flex-col"
                                }
                            },
                            "cmdline" : {
                                "ATTR" : {
                                    "class" : "display-flex"
                                },
                                "CHILDREN" : {
                                    "PS1" : {
                                        "ATTR" : {
                                            "class" : "terminal_text"
                                        },
                                        "TEXT" : ` >` 
                                    },
                                    "stdin" : {
                                        "ATTR" : {
                                            "class" : "terminal_text",
                                            "contenteditable" : "true"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        this.recursive_generate(TERMINAL_JSON, parent);

        // Click anywhere on the terminal to enter a command.
        this.COM.container.addEventListener('click', () => {
            this.COM.stdin.focus();
        });

        // Key event listener to listen for when the user has pressed enter.
        this.COM.container.addEventListener("keydown", (event) => {
            // Prevent the default behaviour of the enter key and use it to add a command to the output.
            // Pressing the enter key also send the command to the server.
            if (event.key === "Enter") {
                event.preventDefault();
                const command = this.get_stdin_command();
                this.add_text_to_stdout(command);

                // Scroll to the bottom of the stdout when pressing enter.
                if (this.COM.stdout.scrollHeight - this.COM.stdout.scrollTop - 50 <= this.COM.stdout.clientHeight) {
                    this.COM.stdout.scrollTop = this.COM.stdout.scrollHeight;
                }

                this.send_command(command);
            }
            // Go back through previously issued commands.
            if (event.key === "ArrowUp") {
                this.get_previous_command("back");
            }
            // Go forward through previously issued commands.
            if (event.key === "ArrowDown") {
                this.get_previous_command("forward");
            }
        });

    }

    get_previous_command (direction) {
        /*
        Go back through the command history and put the text in the stdin.
        */

        // If the direction is 'back' then iterate back through the commands.
        if (direction == "back") {
            this.command_selector --;
            if (this.command_selector < 0) {
                this.command_selector = 0;
            }
        }

        // If the direction is 'forward' then iterate forwards through the commands.
        if (direction == "forward") {
            this.command_selector ++;
            if (this.command_selector >= this.command_count) {
                this.command_selector = this.command_count - 1;
            }
        }

        // Take the result of iterating through the command list and use that to select the previous command.
        // The command is put into the terminal using a number that is kept record of within the class.
        var command = document.getElementById(`${this.NAME}_command_${this.command_selector}`);

        // Logic to ignore console output in the terminal window.
        // If an output line object has the class return_line then skip over it.
        if(command.classList.contains('return_line')) {
            if (this.command_selector === 0 || this.command_selector === this.command_count - 1) {
                return;
            }
            this.get_previous_command(direction);
            return;
        }

        // Remove the prefix from the command and then set the stdin's text to that string.
        command = command.innerText.slice(2);
        this.COM.stdin.innerText = command;
    }

    get_stdin_command () {
        /*
        Get the text entered into the stdin
        */
        const command = this.COM.stdin.innerText;
        // Clear text from the stdin
        this.COM.stdin.innerText = "";
        
        return command;
    }

    add_text_to_stdout (text, prefix = "◅", return_line = "", colour = "") {
        /*
        Add the text in the stdin to the stdout.
        */
        
        var TEXT_JSON = {
            "output_line" : {
                "ATTR" : {
                    "class" : `display-flex terminal_text ${return_line}`,
                    "id" : `${this.NAME}_command_${this.command_count}`,
                },
                "CHILDREN" : {
                    "_prefix" : {
                        "TEXT" : prefix
                    },
                    "_text" : {
                        "ATTR" : {
                            "style" : `color: ${colour};`
                        },
                        "TEXT" : text
                    }
                }
            }
        }

        this.recursive_generate(TEXT_JSON, this.COM["stdout"]);
        this.command_count ++;
        this.command_selector = this.command_count;
    }

    update (state, colour = "") {
        this.add_text_to_stdout(state, "└▻", "return_line", colour);
    }
}

console.info("Loaded : Terminal.js");