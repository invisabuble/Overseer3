export function minimax (element,  defaultHeight="0px") {
    /*
    Grow or shrink an element when clicking on it.
    */

    var config = document.getElementById(element + "C");

    if (config.classList.contains('collapsed')) {
        // Expand
        config.classList.remove('collapsed');

        // Set height from 0 to scrollHeight to animate
        config.style.height = defaultHeight;
        requestAnimationFrame(() => {
        config.style.height = config.scrollHeight + 'px';
        });

        // After transition ends, set height to auto for flexibility
        config.addEventListener('transitionend', function handler() {
        config.style.height = 'auto';
        config.removeEventListener('transitionend', handler);
        });

    } else {
        // Collapse

        // Set fixed height to allow transition
        config.style.height = config.scrollHeight + 'px';
        config.offsetHeight;

        // Animate to default height
        config.style.height = defaultHeight;

        // Add collapsed class
        config.classList.add('collapsed');
    }
}


export function CreateInfoWindow () {
    // Create the OS control panel.
    window.control_panel = new window.OS_Components["container"](
        document.getElementById("control_panel_container"),
        {
            "Control Panel" : {

                "__CONFIG__":{"SSID":"ssid","PSWD":"pswd","PORT":"port","HOST":"host","USER":"Admin","KEY":"sdjfsnjdfljsndf"},
                "STYLE" : {},

                "Option 1" : {
                    "TYPE" : "Switch"
                },

                "Reboot" : {
                    "TYPE" : "Button"
                },

                "Shutdown" : {
                    "TYPE" : "Button"
                },

                "Server Status": {
                    "TYPE":"Reading",
                    "TEXT": "READY!"
                },

                "Server Terminal" : {
                    "TYPE" : "Terminal"
                },

                "Connections" : {
                    "TYPE" : "Line_chart",
                    "IO":["Number_of_devices"],
                    "LABELS":["Number of Devices"]
                }

            }
        },
        "control_panel",
        window.os_host
    );
}


console.info("Loaded : misc.js");