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
var lodash_1 = __importDefault(require("lodash"));
var filter_attribute_type_1 = require("../core/filter-attribute-type");
var graphql_1 = require("graphql");
//
//
var EnumFilterAttributeType = /** @class */ (function (_super) {
    __extends(EnumFilterAttributeType, _super);
    //
    //
    function EnumFilterAttributeType(_name) {
        var _this = _super.call(this) || this;
        _this._name = _name;
        return _this;
    }
    EnumFilterAttributeType.prototype.name = function () { return this._name; };
    //
    //
    EnumFilterAttributeType.prototype.createObjectType = function () {
        var _this = this;
        var filterName = this._name + "Filter";
        this.graphx.type(filterName, {
            name: filterName,
            from: graphql_1.GraphQLInputObjectType,
            fields: function () {
                var enumType = _this.graphx.type(_this._name);
                return {
                    ne: { type: enumType },
                    eq: { type: enumType },
                    in: { type: new graphql_1.GraphQLList(enumType) },
                    notIn: { type: new graphql_1.GraphQLList(enumType) }
                };
            }
        });
    };
    //
    //
    EnumFilterAttributeType.prototype.getFilterExpression = function (condition, field) {
        var enumType = this.graphx.type(this._name);
        if (!(enumType instanceof graphql_1.GraphQLEnumType))
            return null;
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        switch (operator) {
            case 'eq': return { '$eq': operand };
            case 'nw': return { '$nw': operand };
            case 'contains': return { $regex: new RegExp(".*" + operand + ".*", 'i') };
            case 'notContains': return { $regex: new RegExp(".*^[" + operand + "].*", 'i') };
            case 'beginsWith': return { $regex: new RegExp(operand + ".*", 'i') };
        }
        console.warn("EnumFilterType '" + this._name + "' unknown operator '" + operator + "' ");
    };
    return EnumFilterAttributeType;
}(filter_attribute_type_1.FilterAttributeType));
exports.EnumFilterAttributeType = EnumFilterAttributeType;
