import { minimax } from "./misc/misc.js";

window.OS_Components = {};
window.minimax=minimax;

var DYNAMIC_IMPORT_FINISHED = false;


// A list of components to be imported.
const COMPONENTS = ["Container", "Switch"];


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
})();