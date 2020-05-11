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
Object.defineProperty(exports, "__esModule", { value: true });
var graph_on_rails_1 = require("graph-on-rails");
/**
 *
 */
var AddressType = /** @class */ (function (_super) {
    __extends(AddressType, _super);
    function AddressType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddressType.prototype.name = function () { return 'Address'; };
    AddressType.prototype.attributes = function () {
        return {
            street: { type: "String" },
            zip: { type: "String" },
            city: { type: "String" },
            country: { type: "String" }
        };
    };
    AddressType.prototype.belongsTo = function () {
        return [
            { type: 'Person' }
        ];
    };
    AddressType.prototype.parent = function () { return "foo"; };
    return AddressType;
}(graph_on_rails_1.EntityBuilder));
exports.AddressType = AddressType;
