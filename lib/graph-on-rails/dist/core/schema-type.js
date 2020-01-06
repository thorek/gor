"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var inflection_1 = __importDefault(require("inflection"));
var lodash_1 = __importDefault(require("lodash"));
var type_attribute_1 = require("./type-attribute");
/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
var SchemaType = /** @class */ (function () {
    function SchemaType() {
    }
    SchemaType.prototype.typeName = function () { return inflection_1.default.camelize(this.name()); };
    SchemaType.prototype.attributes = function () { return {}; };
    ;
    SchemaType.prototype.enums = function () { return {}; };
    //
    //
    SchemaType.prototype.init = function (graphx) {
        this.graphx = graphx;
        this.createEnums();
    };
    //
    //
    SchemaType.prototype.createTypes = function () { this.createObjectType(); };
    //
    //
    SchemaType.prototype.createEnums = function () {
        var _this = this;
        lodash_1.default.forEach(this.enums(), function (keyValues, name) {
            var values = {};
            lodash_1.default.forEach(keyValues, function (value, key) { return lodash_1.default.set(values, key, { value: value }); });
            _this.graphx.type(name, { name: name, values: values, from: graphql_1.GraphQLEnumType });
            _this.createEnumFilter(name);
        });
    };
    //
    //
    SchemaType.prototype.createEnumFilter = function (name) {
        this.graphx.addEnumFilterAttributeType(name);
    };
    //
    //
    SchemaType.prototype.getAttributes = function () {
        var _this = this;
        if (!this._attributes) {
            this._attributes = lodash_1.default.mapValues(this.attributes(), function (attribute) { return new type_attribute_1.Attribute(attribute, _this); });
        }
        return this._attributes;
    };
    //
    //
    SchemaType.prototype.getAttribute = function (name) {
        return this.getAttributes()[name];
    };
    return SchemaType;
}());
exports.SchemaType = SchemaType;
