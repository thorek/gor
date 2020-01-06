"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var graphx_1 = require("./graphx");
var SchemaFactory = /** @class */ (function () {
    //
    //
    function SchemaFactory(types) {
        this.types = types;
    }
    //
    //
    SchemaFactory.prototype.createSchema = function () {
        var graphx = new graphx_1.GraphX();
        lodash_1.default.forEach(this.types, function (type) { return type.init(graphx); });
        lodash_1.default.forEach(this.types, function (type) { return type.createTypes(); });
        lodash_1.default.forEach(this.types, function (type) { return type.extendTypes(); });
        var schema = graphx.generate();
        return schema;
    };
    return SchemaFactory;
}());
exports.SchemaFactory = SchemaFactory;
