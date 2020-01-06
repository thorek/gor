"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_express_1 = require("apollo-server-express");
var fs_1 = __importDefault(require("fs"));
var graphql_depth_limit_1 = __importDefault(require("graphql-depth-limit"));
var lodash_1 = __importDefault(require("lodash"));
var path_1 = __importDefault(require("path"));
var yaml_1 = __importDefault(require("yaml"));
var int_filter_attribute_type_1 = require("../filter-attributes/int-filter-attribute.type");
var string_filter_attribute_type_1 = require("../filter-attributes/string-filter-attribute.type");
var configuration_type_1 = require("./configuration-type");
var schema_factory_1 = require("./schema-factory");
var no_resolver_1 = require("./no-resolver");
/**
 *
 */
var Gor = /** @class */ (function () {
    function Gor() {
        this.configs = {};
        this.customEntities = [];
    }
    /**
     *
     */
    Gor.prototype.addConfigs = function (folder, resolver) {
        this.configs[folder] = resolver;
    };
    /**
     *
     */
    Gor.prototype.addCustomEntities = function (types) {
        lodash_1.default.concat(this.customEntities, types);
    };
    /**
     *
     */
    Gor.prototype.schema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configEntities, defaultFilterTypes, types, factory;
            return __generator(this, function (_a) {
                if (this._schema)
                    return [2 /*return*/, this._schema];
                configEntities = this.getConfigEntities();
                defaultFilterTypes = this.getDefaultFilterTypes();
                types = __spreadArrays(this.customEntities, configEntities, defaultFilterTypes);
                factory = new schema_factory_1.SchemaFactory(types);
                this._schema = factory.createSchema();
                return [2 /*return*/, this._schema];
            });
        });
    };
    /**
     *
     */
    Gor.prototype.server = function (config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = config;
                        return [4 /*yield*/, this.schema()];
                    case 1:
                        _a.schema = _b.sent();
                        lodash_1.default.defaults(config, { validationRules: [graphql_depth_limit_1.default(7)] });
                        return [2 /*return*/, new apollo_server_express_1.ApolloServer(config)];
                }
            });
        });
    };
    /**
     *
     */
    Gor.prototype.getConfigEntities = function () {
        var _this = this;
        console.info("this.configs", this.configs);
        return lodash_1.default.flatten(lodash_1.default.map(this.configs, function (resolver, folder) {
            if (!resolver)
                resolver = new no_resolver_1.NoResolver();
            var files = _this.getConfigFiles(folder);
            return lodash_1.default.compact(lodash_1.default.map(files, function (file) { return _this.createConfigurationType(folder, file, resolver); }));
        }));
    };
    /**
     *
     */
    Gor.prototype.getDefaultFilterTypes = function () {
        return [
            new int_filter_attribute_type_1.IntFilterAttributeType(),
            new string_filter_attribute_type_1.StringFilterAttributeType()
        ];
    };
    /**
     *
     */
    Gor.prototype.getConfigFiles = function (folder) {
        try {
            console.log(__dirname);
            return lodash_1.default.filter(fs_1.default.readdirSync(folder), function (file) { return lodash_1.default.toLower(path_1.default.extname(file)) === '.yaml'; });
        }
        catch (error) {
            console.error("cannot read files from folder '" + folder + "'", error);
            return [];
        }
    };
    /**
     *
     */
    Gor.prototype.createConfigurationType = function (folder, file, resolver) {
        try {
            file = path_1.default.join(folder, file);
            var content = fs_1.default.readFileSync(file).toString();
            var config = lodash_1.default.get(yaml_1.default.parse(content), 'entity');
            return configuration_type_1.ConfigurationType.create(resolver, config);
        }
        catch (e) {
            console.warn("[" + file + "]: " + e);
            return null;
        }
    };
    return Gor;
}());
exports.Gor = Gor;
