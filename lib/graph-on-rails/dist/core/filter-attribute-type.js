"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var schema_type_1 = require("./schema-type");
/**
 * Base class for all Filter Attributes
 */
var FilterAttributeType = /** @class */ (function (_super) {
    __extends(FilterAttributeType, _super);
    function FilterAttributeType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    //
    //
    FilterAttributeType.prototype.init = function (graphx) {
        _super.prototype.init.call(this, graphx);
        this.graphx.filterAttributes[this.name + "Filter"] = this;
    };
    //
    //
    FilterAttributeType.prototype.createObjectType = function () {
        var _this = this;
        var filterName = this.typeName() + "Filter";
        this.graphx.type(filterName, { name: filterName, from: graphql_1.GraphQLInputObjectType, fields: function () {
                var fields = {};
                _this.setAttributes(fields);
                return fields;
            } });
    };
    //
    //
    FilterAttributeType.prototype.extendTypes = function () { };
    //
    //
    FilterAttributeType.prototype.setAttributes = function (fields) {
        lodash_1.default.forEach(this.getAttributes(), function (attribute, name) {
            lodash_1.default.set(fields, name, { type: attribute.getType() });
        });
    };
    return FilterAttributeType;
}(schema_type_1.SchemaType));
exports.FilterAttributeType = FilterAttributeType;
