const path = require("path");

module.exports = {
    entry: ["core-js/fn/promise", "./app/dist/scripts"],
    output: {
        path: path.resolve(__dirname, "app/dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                exclude: __dirname + "app/dist/slow-load"
            }
        ]
    }
};