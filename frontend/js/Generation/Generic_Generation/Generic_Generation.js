/*
A class to facilitate the recursive generation of elements using JSON.
JSON should be provided like so:

"Element Name" : {
    
    "ATTR" : {
        "class" : "Elements class list..."
        <Any other attributes laid out like above>
    },

    "CHILDREN" : {
        "Child Name" : {
            <ATTR, CHILDREN, TEXT of children>
        }
    },

    "TEXT" : "<Any text that needs to be added to the element>"

}

Any children should be smaller copies of this JSON.
This way we can build up arbitrarily complex structures using JSON.
*/
export class Generic_Generation {

    constructor (uuid) {

        // Keep a record of the UUID
        this.UUID = uuid;

        // Make a note of the time the object was created
        this.CREATION_TIME = Math.floor(Date.now() / 1000);

        this.COM = {};
    }


    recursive_generate (element_json, parent = null) {
        /*
        Geneate a complex element from JSON.
        */
        Object.keys(element_json).forEach(element => {

            const ELMNT    = element_json[element];
            const ATTR     = this.get_CI_value("ATTR",     ELMNT, {}); // \
            const CHILDREN = this.get_CI_value("CHILDREN", ELMNT, {}); //  | - Get the values associated with ATTR, CHILDREN, TEXT.
            const TEXT     = this.get_CI_value("TEXT",     ELMNT);     // /    Case Insensitive so can be     attr, Children, tExT.

            var new_element = this.create_element(element, ATTR, TEXT);
            this.COM[element] = new_element;

            // Recursively process children if there are any.
            if (CHILDREN && typeof CHILDREN === 'object') {
                this.recursive_generate(CHILDREN, new_element);
            }

            // If a parent was passed in, append the created element to that parent.
            if (parent) {
                this.append_element(parent, new_element);
            } else {
                return new_element;
            }

        });

    }

    create_element (type, attributes = {}, text = "") {
        /*
        Creates an element.
        */
        const element = document.createElementNS("http://www.w3.org/1999/xhtml", type);
        Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
        element.textContent = text;
        return element;
    }


    append_element (parent, child) {
        /*
        Adds a single or multiple child elements to a parent element.
        */
        if (!Array.isArray(child)) {
            child = [child];
        }
        child.forEach(item => parent.appendChild(item));
        return parent;
    }


    get_CI_value (key_value, object=null, default_value = "") {
        /*
        Returns the value or default value associated with a key. This makes retrieval case insensitive.
        */
        if (!object) {
            return default_value;
        }
        const key = Object.keys(object).find(key => key.toLowerCase() === key_value.toLowerCase());
        return object?.[key] ?? default_value;
    }


    get_component_name (object_json) {
        /*
        Returns the name of the highest key in the hirearchy of the passed JSON
        */
        return Object.keys(object_json)[0];
    }

}