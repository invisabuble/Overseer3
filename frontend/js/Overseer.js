import { minimax } from "./misc/misc.js";

window.OS_Components = {};
window.minimax=minimax;

// Get the host location of the frontend.
// This same location is also the host of the WSS.
var os_host = window.location.origin;
const ipAddressRegex = /(?<=https?:\/\/).*/g;
var os_host = os_host.match(ipAddressRegex);

var DYNAMIC_IMPORT_FINISHED = false;


// A list of components to be imported.
const COMPONENTS = ["Container", "Switch", "Button", "Reading", "Terminal"];


// Dynamically import all components within the above list and add them to the window object.
(async () => {
    await Promise.all(
        COMPONENTS.map(async (COMPONENT) => {
            console.log(`Importing ${COMPONENT}`);
            const { default: Component_Class } = await import(`./Generation/Components/${COMPONENT}.js`);
            window.OS_Components[COMPONENT.toLowerCase()] = Component_Class;
        })
    );

    DYNAMIC_IMPORT_FINISHED = true;
    console.info("DYNAMIC IMPORT OF COMPONENTS COMPLETE.");

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
                }

            }
        },
        "control_panel",
        os_host
    );
})();

