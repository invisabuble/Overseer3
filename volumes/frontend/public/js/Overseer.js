import { minimax } from "./misc/misc.js";
import { CreateInfoWindow } from "./misc/misc.js";
import { OSN_Client } from "./misc/websockets.js";

window.OS_DEBUG = false;
window.OSN_Client = OSN_Client;
window.OS_Components = {};
window.minimax=minimax;
window.CreateInfoWindow=CreateInfoWindow;

// Get the host location of the frontend.
// This same location is also the host of the WSS.
var OSN_host = window.location.origin;
const ipAddressRegex = /(?<=https?:\/\/).*/g;
window.OSN_host = OSN_host.match(ipAddressRegex);
window.Controllables = {};

// A list of components to be imported.
const COMPONENTS = ["Container", "Switch", "Button", "Reading", "Terminal", "Bar", "Line_Chart", "Bar_Chart", "Pie_Chart", "Login"];

// Dynamically import all components within the above list and add them to the window object.
(async () => {
    await Promise.all(
        COMPONENTS.map(async (COMPONENT) => {
            console.log(`Importing ${COMPONENT}`);
            const { default: Component_Class } = await import(`./Generation/Components/${COMPONENT}.js`);
            window.OS_Components[COMPONENT.toLowerCase()] = Component_Class;
        })
    );

    window.DYNAMIC_IMPORT_FINISHED = true;
    console.info("DYNAMIC IMPORT OF COMPONENTS COMPLETE.");

    // Delay the connection of the WSS client until after all the js has been imported.
    window.OSN_Client.connect();
})();

