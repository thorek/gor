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
/**
 *
 */
var StringFilterAttributeType = /** @class */ (function (_super) {
    __extends(StringFilterAttributeType, _super);
    function StringFilterAttributeType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringFilterAttributeType.prototype.name = function () { return 'String'; };
    StringFilterAttributeType.prototype.attributes = function () {
        return {
            ne: { type: 'String' },
            eq: { type: 'String' },
            in: { type: '[String]' },
            notIn: { type: '[String]' },
            contains: { type: 'String' },
            notContains: { type: 'String' },
            beginsWith: { type: 'String' }
        };
    };
    //
    //
    StringFilterAttributeType.prototype.getFilterExpression = function (condition, field) {
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        switch (operator) {
            case 'eq': return { '$eq': operand };
            case 'nw': return { '$nw': operand };
            case 'contains': return { $regex: new RegExp(".*" + operand + ".*", 'i') };
            case 'notContains': return { $regex: new RegExp(".*^[" + operand + "].*", 'i') };
            case 'beginsWith': return { $regex: new RegExp(operand + ".*", 'i') };
        }
        console.warn("StringFilterType unknown operator '" + operator + "' ");
    };
    return StringFilterAttributeType;
}(filter_attribute_type_1.FilterAttributeType));
exports.StringFilterAttributeType = StringFilterAttributeType;