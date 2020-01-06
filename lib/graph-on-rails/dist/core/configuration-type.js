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
var entity_type_1 = require("./entity-type");
/**
 *
 */
var ConfigurationType = /** @class */ (function (_super) {
    __extends(ConfigurationType, _super);
    /**
     *
     */
    function ConfigurationType(resolver, config) {
        var _this = _super.call(this, resolver) || this;
        _this.resolver = resolver;
        _this.config = config;
        return _this;
    }
    /**
     *
     */
    ConfigurationType.create = function (resolver, config) {
        if (!lodash_1.default.has(config, 'name'))
            throw new Error('no name property');
        return new ConfigurationType(resolver, config);
    };
    ConfigurationType.prototype.name = function () { return this.config.name; };
    ConfigurationType.prototype.typeName = function () { return this.config.typeName || _super.prototype.typeName.call(this); };
    ConfigurationType.prototype.attributes = function () {
        if (!this.config.attributes)
            return _super.prototype.attributes.call(this);
        return lodash_1.default.mapValues(this.config.attributes, function (attr) {
            return lodash_1.default.isString(attr) ? { type: attr } : attr;
        });
    };
    ConfigurationType.prototype.belongsTo = function () {
        if (!this.config.belongsTo)
            return _super.prototype.belongsTo.call(this);
        return lodash_1.default.map(this.config.belongsTo, function (bt) {
            return lodash_1.default.isString(bt) ? { type: bt } : bt;
        });
    };
    ConfigurationType.prototype.hasMany = function () {
        if (!this.config.hasMany)
            return _super.prototype.hasMany.call(this);
        return lodash_1.default.map(this.config.hasMany, function (hm) {
            return lodash_1.default.isString(hm) ? { type: hm } : hm;
        });
    };
    ConfigurationType.prototype.plural = function () { return this.config.plural || _super.prototype.plural.call(this); };
    ConfigurationType.prototype.singular = function () { return this.config.singular || _super.prototype.singular.call(this); };
    ConfigurationType.prototype.collection = function () { return this.config.collection || _super.prototype.collection.call(this); };
    ConfigurationType.prototype.instance = function () { return this.config.instance || _super.prototype.instance.call(this); };
    ConfigurationType.prototype.label = function () { return this.config.label || _super.prototype.label.call(this); };
    ConfigurationType.prototype.path = function () { return this.config.path || _super.prototype.path.call(this); };
    ConfigurationType.prototype.parent = function () { return this.config.parent || _super.prototype.parent.call(this); };
    return ConfigurationType;
}(entity_type_1.EntityType));
exports.ConfigurationType = ConfigurationType;
