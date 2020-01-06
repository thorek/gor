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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var mongodb_1 = require("mongodb");
var graph_on_rails_1 = require("graph-on-rails");
/**
 *
 */
var MongoDbResolver = /** @class */ (function (_super) {
    __extends(MongoDbResolver, _super);
    /**
     *
     */
    function MongoDbResolver(db) {
        var _this = _super.call(this) || this;
        _this.db = db;
        return _this;
    }
    /**
     *
     */
    MongoDbResolver.create = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb(config)];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new MongoDbResolver(db)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.getDb = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var url, dbName, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = lodash_1.default.get(config, 'url');
                        if (!url)
                            throw "please provide url";
                        dbName = lodash_1.default.get(config, 'dbName');
                        if (!dbName)
                            throw "please provide dbName";
                        return [4 /*yield*/, mongodb_1.MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.db(dbName)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.getCollection = function (entityType) {
        return this.db.collection(entityType.plural());
    };
    /**
     *
     */
    MongoDbResolver.prototype.resolveType = function (entityType, root, args) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, id, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(entityType);
                        id = lodash_1.default.get(args, 'id');
                        return [4 /*yield*/, collection.findOne(new mongodb_1.ObjectId(id))];
                    case 1:
                        entity = _a.sent();
                        return [2 /*return*/, this.getOutEntity(entity)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.resolveRefType = function (refType, root, args) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, id, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(refType);
                        id = lodash_1.default.get(root, refType.singular() + "Id");
                        return [4 /*yield*/, collection.findOne(new mongodb_1.ObjectId(id))];
                    case 1:
                        entity = _a.sent();
                        return [2 /*return*/, this.getOutEntity(entity)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.resolveRefTypes = function (entityType, refType, root, args) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, filter, entities;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(refType);
                        filter = lodash_1.default.set({}, [entityType.singular() + "Id"], lodash_1.default.toString(root.id));
                        return [4 /*yield*/, collection.find(filter).toArray()];
                    case 1:
                        entities = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(entities, function (entity) { return _this.getOutEntity(entity); })];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.resolveTypes = function (entityType, root, args) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, filter, entities;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(entityType);
                        filter = this.getFilter(entityType, root, args);
                        lodash_1.default.set(filter, 'deleted', { $ne: true });
                        return [4 /*yield*/, collection.find(filter).toArray()];
                    case 1:
                        entities = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(entities, function (entity) { return _this.getOutEntity(entity); })];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.saveEntity = function (entityType, root, args) {
        return __awaiter(this, void 0, void 0, function () {
            var attrs;
            return __generator(this, function (_a) {
                attrs = lodash_1.default.get(args, entityType.singular());
                return [2 /*return*/, lodash_1.default.has(attrs, 'id') ? this.updateEntity(entityType, attrs) : this.createEntity(entityType, attrs)];
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.getFilter = function (entityType, root, args) {
        var filter = {};
        lodash_1.default.forEach(lodash_1.default.get(args, 'filter'), function (condition, field) {
            var attribute = entityType.getAttribute(field);
            if (!attribute)
                return;
            var filterType = attribute.getFilterAttributeType();
            var expression = filterType ? filterType.getFilterExpression(condition, field) : null;
            if (expression)
                filter["" + field] = expression;
        });
        return filter;
    };
    //
    //
    MongoDbResolver.prototype.getOutEntity = function (entity) {
        lodash_1.default.set(entity, 'id', entity._id);
        lodash_1.default.unset(entity, '_id');
        return entity;
    };
    //
    //
    MongoDbResolver.prototype.updateEntity = function (entityType, attrs) {
        return __awaiter(this, void 0, void 0, function () {
            var id, collection, entity, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = new mongodb_1.ObjectId(attrs.id);
                        delete attrs.id;
                        collection = this.getCollection(entityType);
                        return [4 /*yield*/, collection.findOne(id)];
                    case 1:
                        entity = _a.sent();
                        if (!entity)
                            return [2 /*return*/, null];
                        lodash_1.default.merge(entity, attrs);
                        return [4 /*yield*/, collection.findOneAndReplace(id, entity)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, this.getOutEntity(entity)];
                }
            });
        });
    };
    //
    //
    MongoDbResolver.prototype.createEntity = function (entityType, attrs) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, result, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(entityType);
                        return [4 /*yield*/, collection.insertOne(attrs)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, collection.findOne(new mongodb_1.ObjectId(result.insertedId))];
                    case 2:
                        entity = _a.sent();
                        return [2 /*return*/, this.getOutEntity(entity)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbResolver.prototype.deleteEntity = function (entityType, root, args) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, id, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(entityType);
                        id = lodash_1.default.get(args, 'id');
                        return [4 /*yield*/, collection.updateOne({ "_id": new mongodb_1.ObjectId(id) }, {
                                $set: { "deleted": true }
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return MongoDbResolver;
}(graph_on_rails_1.Resolver));
exports.MongoDbResolver = MongoDbResolver;
