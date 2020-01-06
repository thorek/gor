"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
//
//
var Attribute = /** @class */ (function () {
    //
    //
    function Attribute(attr, entity) {
        this.attr = attr;
        this.entity = entity;
    }
    Object.defineProperty(Attribute.prototype, "graphx", {
        get: function () { return this.entity.graphx; },
        enumerable: true,
        configurable: true
    });
    //
    //
    Attribute.prototype.getType = function () {
        switch (lodash_1.default.toLower(this.attr.type)) {
            case 'id': return graphql_1.GraphQLID;
            case 'string': return graphql_1.GraphQLString;
            case '[string]': return new graphql_1.GraphQLList(graphql_1.GraphQLString);
            case 'int': return graphql_1.GraphQLInt;
            case '[int]': return new graphql_1.GraphQLList(graphql_1.GraphQLInt);
            case 'float': return graphql_1.GraphQLFloat;
            case '[float]': return new graphql_1.GraphQLList(graphql_1.GraphQLFloat);
            case 'boolean': return graphql_1.GraphQLBoolean;
            case '[boolean]': return new graphql_1.GraphQLList(graphql_1.GraphQLBoolean);
            default: {
                var type = this.graphx.type(this.attr.type);
                if (!type)
                    console.warn(this.entity.name + " no such type '" + this.attr.type + "'");
                return type;
            }
        }
        ;
    };
    //
    //
    Attribute.prototype.getFilterInputType = function () {
        switch (lodash_1.default.toLower(this.attr.type)) {
            case 'id':
            case 'int': return this.graphx.type('IntFilter');
            case 'float': return this.graphx.type('FloatFilter');
            case 'boolean': return this.graphx.type('BooleanFilter');
            case 'string': return this.graphx.type('StringFilter');
            default: {
                var type = this.graphx.type(this.attr.type);
                if (!type)
                    console.warn(this.entity.name + " no such type '" + this.attr.type + "'");
                if (type instanceof graphql_1.GraphQLEnumType)
                    return this.graphx.type('GenderFilter');
                return null;
            }
        }
        ;
    };
    //
    //
    Attribute.prototype.getFilterAttributeType = function () {
        switch (lodash_1.default.toLower(this.attr.type)) {
            case 'id':
            case 'int': return this.graphx.filterAttributes['IntFilter'];
            case 'float': return this.graphx.filterAttributes['FloatFilter'];
            case 'boolean': return this.graphx.filterAttributes['BooleanFilter'];
            case 'string': return this.graphx.filterAttributes['StringFilter'];
            default: {
                return this.graphx.filterAttributes['GenderFilter'];
            }
        }
        ;
    };
    return Attribute;
}());
exports.Attribute = Attribute;
