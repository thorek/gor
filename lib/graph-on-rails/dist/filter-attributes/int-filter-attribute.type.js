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
var IntFilterAttributeType = /** @class */ (function (_super) {
    __extends(IntFilterAttributeType, _super);
    function IntFilterAttributeType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntFilterAttributeType.prototype.name = function () { return 'Int'; };
    IntFilterAttributeType.prototype.attributes = function () {
        return {
            eq: { type: 'int' },
            ne: { type: 'int' },
            le: { type: 'int' },
            lt: { type: 'int' },
            ge: { type: 'int' },
            gt: { type: 'int' },
            isIn: { type: '[int]' },
            notIn: { type: '[int]' },
            between: { type: '[int]' },
        };
    };
    //
    //
    IntFilterAttributeType.prototype.getFilterExpression = function (condition, field) {
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        switch (operator) {
            // 	case 'eq': return { $eq : operand };
            // 	case 'ne': return { $ne : operand };
            // 	case 'contains': return { $regex : new RegExp(`.*${operand}.*`, 'i') };
            // 	case 'notContains': return { $regex : new RegExp(`.*^[${operand}].*`, 'i')  };
            // 	case 'beginsWith': return { $regex : new RegExp(`${operand}.*`, 'i')  };
            // }
        }
    };
    return IntFilterAttributeType;
}(filter_attribute_type_1.FilterAttributeType));
exports.IntFilterAttributeType = IntFilterAttributeType;
