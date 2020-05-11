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
var enum_builder_1 = require("./enum-builder");
/**
 *
 */
var EnumConfigBuilder = /** @class */ (function (_super) {
    __extends(EnumConfigBuilder, _super);
    //
    //
    function EnumConfigBuilder(_name, resolver, config) {
        var _this = _super.call(this, resolver) || this;
        _this._name = _name;
        _this.resolver = resolver;
        _this.config = config;
        console.log(_name, config);
        return _this;
    }
    EnumConfigBuilder.prototype.name = function () { return this._name; };
    EnumConfigBuilder.prototype.enum = function () { return this.config; };
    /**
     *
     */
    EnumConfigBuilder.create = function (name, resolver, config) {
        return new EnumConfigBuilder(name, resolver, config);
    };
    return EnumConfigBuilder;
}(enum_builder_1.EnumBuilder));
exports.EnumConfigBuilder = EnumConfigBuilder;
