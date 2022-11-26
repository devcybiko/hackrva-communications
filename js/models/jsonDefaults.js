class JsonDefaults {
    constructor(defaults) {
        this.defaults = defaults;
    }
    isBadJson(values) {
        return this._isBadJson(values, this.defaults);
    }
    _isBadJson(values, jsonDefaults) {
        // checks for only valid keys in the json
        // updates the json with default values
        // if default is 'false' it is removed from the json
        // if default is 'true' it is required
        if (!values) return ["Missing JSON"];
        let errors = [];
        // first check all the value keys to verify they are valid
        for (let valueKey of Object.keys(values)) {
            let jsonValue = jsonDefaults[valueKey];
            let value = values[valueKey];
            // you must not add keys that are not in the defaults
            if (jsonValue === undefined) errors.push("illegal JSON key: " + valueKey);
            // false keys are deprecated and deleted
            else if (jsonValue === false) delete values[valueKey];
            // arrays aren't allowed
            else if (Array.isArray(value)) errors.push("arrays are not allowed in value, key: " + valueKey);
            else if (Array.isArray(jsonValue)) errors.push("arrays are not allowed in defaults, key: " + valueKey);
            // only strings and objects allowed
            else if (typeof (jsonValue) !== "object" && typeof (jsonValue) !== "string" && jsonValue !== true) errors.push("only objects and strings allowed in defaults, key: " + valueKey)
            else if (typeof (value) !== "object" && typeof (value) !== "string") errors.push("only objects and strings allowed in values, key: " + valueKey)
            // value/default mismatch
            else if (typeof (value) === "object" && typeof (jsonValue) === "string") errors.push("string expected, but object given, key: " + valueKey);
            else if (typeof (value) === "string" && typeof (jsonValue) === "object") errors.push("object expected, but string given, key: " + valueKey);
            // objects require recursive descent
            else if (typeof (value) === "object") {
                // only descend if an object is expected
                if (typeof (jsonValue) !== "object") errors.push("object not expected here, key=" + valueKey);
                // descend recursively and match the two objects
                else errors = errors.concat(this._isBadJson(value, jsonValue));
            }
        }
        // next check all the json keys for required values
        for (let jsonKey of Object.keys(jsonDefaults)) {
            let jsonValue = jsonDefaults[jsonKey];
            let value = values[jsonKey];
            if (value === undefined) {
                // if the default is 'true' it must be provied
                if (jsonValue === true) errors.push("required key missing from JSON: " + jsonKey);
                else if (jsonValue === false) continue; // this case already handled above
                else {
                    // there's a default value
                    if (Array.isArray(jsonValue)) errors.push("arrays are not allowed in defaults, key: " + jsonKey);
                    else if (typeof (jsonValue) !== "object" && typeof (jsonValue) !== "string") errors.push("only objects and strings allowed in defaults, key: " + jsonKey)
                    else if (typeof (jsonValue) === "object") errors.push("object expected but not defined in values, key: " + jsonKey)
                    else values[jsonKey] = jsonValue; // assign the default value
                }
            }
        }
        return errors;
    }
}

module.exports = JsonDefaults;