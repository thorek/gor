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
var schema_builder_1 = require("./schema-builder");
var graphql_1 = require("graphql");
var EnumBuilder = /** @class */ (function (_super) {
    __extends(EnumBuilder, _super);
    //
    //
    function EnumBuilder(resolver) {
        var _this = _super.call(this) || this;
        _this.resolver = resolver;
        return _this;
    }
    //
    //
    EnumBuilder.prototype.init = function (graphx) {
        _super.prototype.init.call(this, graphx);
        this.resolver.init(this);
    };
    EnumBuilder.prototype.createObjectType = function () {
        var name = this.name();
        var values = {};
        lodash_1.default.forEach(this.enum(), function (value, key) { return lodash_1.default.set(values, key, { value: value }); });
        this.graphx.type(name, { name: name, values: values, from: graphql_1.GraphQLEnumType });
        this.createEnumFilter(name);
    };
    //
    //
    EnumBuilder.prototype.createEnumFilter = function (name) {
        this.resolver.addEnumFilterAttributeType(name);
    };
    return EnumBuilder;
}(schema_builder_1.SchemaBuilder));
exports.EnumBuilder = EnumBuilder;
