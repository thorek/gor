"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var inflection_1 = __importDefault(require("inflection"));
var lodash_1 = __importDefault(require("lodash"));
var type_attribute_1 = require("./type-attribute");
/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
var SchemaBuilder = /** @class */ (function () {
    function SchemaBuilder() {
    }
    SchemaBuilder.prototype.typeName = function () { return inflection_1.default.camelize(this.name()); };
    SchemaBuilder.prototype.attributes = function () { return {}; };
    ;
    //
    //
    SchemaBuilder.prototype.init = function (graphx) {
        this.graphx = graphx;
    };
    //
    //
    SchemaBuilder.prototype.createTypes = function () { this.createObjectType(); };
    //
    //
    SchemaBuilder.prototype.extendTypes = function () { };
    //
    //
    SchemaBuilder.prototype.getAttributes = function () {
        var _this = this;
        if (!this._attributes) {
            this._attributes = lodash_1.default.mapValues(this.attributes(), function (attribute) { return new type_attribute_1.Attribute(attribute, _this); });
        }
        return this._attributes;
    };
    //
    //
    SchemaBuilder.prototype.getAttribute = function (name) {
        return this.getAttributes()[name];
    };
    return SchemaBuilder;
}());
exports.SchemaBuilder = SchemaBuilder;
