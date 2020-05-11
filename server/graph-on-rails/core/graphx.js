"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var _ = __importStar(require("lodash"));
//
//
var GraphX = /** @class */ (function () {
    //
    //
    function GraphX() {
        var _this = this;
        this.entities = {};
        this.filterAttributes = {};
        this.rawTypes = {};
        this.fnFromArray = function (fns) { return function () { return fns.reduce(function (obj, fn) { return Object.assign({}, obj, fn.call()); }, {}); }; };
        /**
         *
         */
        this.generate = function () {
            _this.generateMetaData();
            _this.generateTypes();
            return new graphql_1.GraphQLSchema({
                query: _this.type('query'),
                mutation: _this.type('mutation')
            });
        };
        /**
         *
         */
        this.generateMetaData = function () {
            var metaDataType = new graphql_1.GraphQLObjectType({
                name: 'metaData',
                fields: {
                    name: { type: graphql_1.GraphQLString, resolve: function (obj) { return obj.name(); } },
                    path: { type: graphql_1.GraphQLString, resolve: function (obj) { return obj.path(); } },
                    list: { type: graphql_1.GraphQLString, resolve: function (obj) { return obj.list(); } },
                    entity: { type: graphql_1.GraphQLString, resolve: function (obj) { return obj.entity(); } },
                    label: { type: graphql_1.GraphQLString, resolve: function (obj) { return obj.label(); } },
                    parent: { type: graphql_1.GraphQLString, resolve: function (obj) { return obj.parent(); } }
                }
            });
            _this.type('query').extend(function () {
                return _.set({}, 'metaData', {
                    type: new graphql_1.GraphQLList(metaDataType),
                    resolve: function (root) { return _.values(_this.entities); }
                });
            });
        };
        /**
         *
         */
        this.generateTypes = function () {
            _.forEach(_this.rawTypes, function (item, key) {
                _this.rawTypes[key] = new item.from({
                    name: item.name,
                    description: item.description,
                    args: item.args,
                    fields: _this.fnFromArray(item.fields),
                    values: item.values
                });
            });
        };
        this.createType('query', {
            name: 'Query',
            fields: function () { return ({
                ping: { type: graphql_1.GraphQLString, resolve: function () { return 'pong'; } }
            }); }
        });
        this.createType('mutation', {
            name: 'Mutation',
            fields: function () { return ({
                ping: {
                    type: graphql_1.GraphQLString,
                    args: { some: { type: graphql_1.GraphQLString } },
                    resolve: function (root, args) { return "pong, " + args.some + "!"; }
                }
            }); }
        });
    }
    //
    //
    GraphX.prototype.createType = function (name, obj) {
        var _this = this;
        if (this.rawTypes[name])
            throw new Error("Type '" + name + "' already exists.");
        return this.rawTypes[name] = {
            from: obj.from || graphql_1.GraphQLObjectType,
            name: obj.name,
            description: obj.description,
            args: obj.args,
            fields: [obj.fields],
            values: obj.values,
            extend: function (fields) { return _this.rawTypes[name].fields.push(fields instanceof Function ? fields : function () { return fields; }); }
        };
    };
    //
    //
    GraphX.prototype.type = function (name, obj) {
        if (obj === undefined) {
            if (this.rawTypes[name] === undefined)
                throw new Error("Type '" + name + "' does not exist in this GraphX.");
            return this.rawTypes[name];
        }
        return this.createType(name, obj);
    };
    return GraphX;
}());
exports.GraphX = GraphX;
