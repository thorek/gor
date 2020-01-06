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
var inflection_1 = __importDefault(require("inflection"));
var lodash_1 = __importDefault(require("lodash"));
var schema_type_1 = require("./schema-type");
/**
 * Base class for all Entities
 */
var EntityType = /** @class */ (function (_super) {
    __extends(EntityType, _super);
    //
    //
    function EntityType(resolver) {
        var _this = _super.call(this) || this;
        _this.resolver = resolver;
        return _this;
    }
    EntityType.prototype.belongsTo = function () { return []; };
    EntityType.prototype.hasMany = function () { return []; };
    EntityType.prototype.plural = function () { return inflection_1.default.pluralize(lodash_1.default.toLower(this.name())); };
    EntityType.prototype.singular = function () { return lodash_1.default.toLower(this.name()); };
    EntityType.prototype.collection = function () { return this.plural(); };
    EntityType.prototype.instance = function () { return this.singular(); };
    EntityType.prototype.label = function () { return inflection_1.default.titleize(this.plural()); };
    EntityType.prototype.path = function () { return this.plural(); };
    EntityType.prototype.parent = function () { return null; };
    //
    //
    EntityType.prototype.init = function (graphx) {
        _super.prototype.init.call(this, graphx);
        this.resolver.init(this);
        this.graphx.entities[this.name()] = this;
    };
    //
    //
    EntityType.prototype.createObjectType = function () {
        var _this = this;
        var name = this.typeName();
        this.graphx.type(name, { name: name, fields: function () {
                var fields = { id: { type: graphql_1.GraphQLID } };
                return _this.setAttributes(fields);
            } });
    };
    //
    //
    EntityType.prototype.extendTypes = function () {
        this.createInputType();
        this.createFilterType();
        this.addReferences();
        this.addQueries();
        this.addMutations();
        this.resolver.extendType(this);
    };
    //
    //
    EntityType.prototype.addReferences = function () {
        this.addBelongsTo();
        this.addHasMany();
    };
    //
    //
    EntityType.prototype.addMutations = function () {
        this.addSaveMutation();
        this.addDeleteMutation();
    };
    //
    //
    EntityType.prototype.addQueries = function () {
        this.addTypeQuery();
        this.addTypesQuery();
    };
    //
    //
    EntityType.prototype.addBelongsTo = function () {
        var _this = this;
        var belongsTo = lodash_1.default.filter(this.belongsTo(), function (bt) { return _this.checkReference('belongsTo', bt); });
        this.graphx.type(this.typeName()).extend(function () { return lodash_1.default.reduce(belongsTo, function (fields, ref) { return _this.addBelongsToReference(fields, ref); }, {}); });
        this.graphx.type(this.typeName() + "Input").extend(function () { return lodash_1.default.reduce(belongsTo, function (fields, ref) { return _this.addBelongsToId(fields, ref); }, {}); });
    };
    //
    //
    EntityType.prototype.addBelongsToId = function (fields, ref) {
        var refEntity = this.graphx.entities[ref.type];
        return lodash_1.default.set(fields, refEntity.singular() + "Id", { type: graphql_1.GraphQLID });
    };
    //
    //
    EntityType.prototype.addBelongsToReference = function (fields, ref) {
        var _this = this;
        var refEntity = this.graphx.entities[ref.type];
        var refObjectType = this.graphx.type(refEntity.typeName());
        return lodash_1.default.set(fields, refEntity.singular(), {
            type: refObjectType,
            resolve: function (root, args) { return _this.resolver.resolveRefType(refEntity, root, args); }
        });
    };
    //
    //
    EntityType.prototype.addHasMany = function () {
        var _this = this;
        var hasMany = lodash_1.default.filter(this.hasMany(), function (hm) { return _this.checkReference('hasMany', hm); });
        this.graphx.type(this.typeName()).extend(function () { return lodash_1.default.reduce(hasMany, function (fields, ref) { return _this.addHasManyReference(fields, ref); }, {}); });
    };
    //
    //
    EntityType.prototype.addHasManyReference = function (fields, ref) {
        var _this = this;
        var refEntity = this.graphx.entities[ref.type];
        var refObjectType = this.graphx.type(refEntity.typeName());
        return lodash_1.default.set(fields, refEntity.plural(), {
            type: new graphql_1.GraphQLList(refObjectType),
            resolve: function (root, args) { return _this.resolver.resolveRefTypes(_this, refEntity, root, args); }
        });
    };
    //
    //
    EntityType.prototype.checkReference = function (direction, ref) {
        var refEntity = this.graphx.entities[ref.type];
        if (!(refEntity instanceof EntityType)) {
            console.warn("'" + this.typeName() + ":" + direction + "': no such entity type '" + ref.type + "'");
            return false;
        }
        if (!this.graphx.type(refEntity.typeName())) {
            console.warn("'" + this.typeName() + ":" + direction + "': no objectType in '" + ref.type + "'");
            return false;
        }
        return true;
    };
    //
    //
    EntityType.prototype.createInputType = function () {
        var _this = this;
        var name = this.typeName() + "Input";
        this.graphx.type(name, { name: name, from: graphql_1.GraphQLInputObjectType, fields: function () {
                var fields = { id: { type: graphql_1.GraphQLID } };
                return _this.setAttributes(fields);
            } });
    };
    //
    //
    EntityType.prototype.setAttributes = function (fields) {
        lodash_1.default.forEach(this.getAttributes(), function (attribute, name) {
            lodash_1.default.set(fields, name, { type: attribute.getType() });
        });
        return fields;
    };
    //
    //
    EntityType.prototype.createFilterType = function () {
        var _this = this;
        var name = this.typeName() + "Filter";
        this.graphx.type(name, { name: name, from: graphql_1.GraphQLInputObjectType, fields: function () {
                var fields = { id: { type: graphql_1.GraphQLID } };
                lodash_1.default.forEach(_this.getAttributes(), function (attribute, name) {
                    lodash_1.default.set(fields, name, { type: attribute.getFilterInputType() });
                });
                return fields;
            } });
    };
    //
    //
    EntityType.prototype.addTypeQuery = function () {
        var _this = this;
        this.graphx.type('query').extend(function () {
            return lodash_1.default.set({}, _this.singular(), {
                type: _this.graphx.type(_this.typeName()),
                args: { id: { type: graphql_1.GraphQLID } },
                resolve: function (root, args) { return _this.resolver.resolveType(_this, root, args); }
            });
        });
    };
    //
    //
    EntityType.prototype.addTypesQuery = function () {
        var _this = this;
        this.graphx.type('query').extend(function () {
            return lodash_1.default.set({}, _this.plural(), {
                type: new graphql_1.GraphQLList(_this.graphx.type(_this.typeName())),
                args: { filter: { type: _this.graphx.type(_this.typeName() + "Filter") } },
                resolve: function (root, args) { return _this.resolver.resolveTypes(_this, root, args); }
            });
        });
    };
    //
    //
    EntityType.prototype.addSaveMutation = function () {
        var _this = this;
        this.graphx.type('mutation').extend(function () {
            var args = lodash_1.default.set({}, _this.singular(), { type: _this.graphx.type(_this.typeName() + "Input") });
            return lodash_1.default.set({}, "save" + _this.typeName(), {
                type: _this.graphx.type(_this.typeName()),
                args: args,
                resolve: function (root, args) { return _this.resolver.saveEntity(_this, root, args); }
            });
        });
    };
    //
    //
    EntityType.prototype.addDeleteMutation = function () {
        var _this = this;
        this.graphx.type('mutation').extend(function () {
            return lodash_1.default.set({}, "delete" + _this.typeName(), {
                type: graphql_1.GraphQLBoolean,
                args: { id: { type: graphql_1.GraphQLID } },
                resolve: function (root, args) { return _this.resolver.deleteEntity(_this, root, args); }
            });
        });
    };
    return EntityType;
}(schema_type_1.SchemaType));
exports.EntityType = EntityType;
