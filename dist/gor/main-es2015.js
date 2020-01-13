(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./$$_lazy_route_resource lazy recursive":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/app/app.component.html":
/*!*****************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/components/app/app.component.html ***!
  \*****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<app-navigation></app-navigation>\n<div class=\"container-fluid\">\n  <router-outlet></router-outlet>\n</div>\n");

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/index/index.component.html":
/*!*********************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/components/index/index.component.html ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<h1 class=\"mt-3 mb-1\">{{ metaData?.label }}</h1>\n\n<div class=\"text-right mb-2\">\n    <button class=\"btn btn-primary\">New {{ metaData?.name }}</button>\n</div>\n\n<table *ngIf=\"schema\" mat-table [dataSource]=\"dataSource\" class=\"mat-elevation-z8\">\n\n  <ng-container *ngFor=\"let field of fields\" [matColumnDef]=\"field\">\n    <th mat-header-cell *matHeaderCellDef> {{field}} </th>\n    <td mat-cell *matCellDef=\"let element\"> {{ element ? element[field] : null }} </td>\n  </ng-container>\n\n  <ng-container matColumnDef=\"actions\">\n    <th mat-header-cell *matHeaderCellDef></th>\n    <td class=\"text-right\" mat-cell *matCellDef=\"let element\">\n      <a [routerLink]=\"['/gor', metaData?.path, element?.id]\" class=\"btn btn-info btn-sm ml-1\">View</a>\n      <a [routerLink]=\"['/gor', metaData?.path, element?.id, 'edit']\" class=\"btn btn-secondary btn-sm ml-1\">Edit</a>\n      <a href=\"#\" class=\"btn btn-danger btn-sm ml-1\"(click)=\"onDelete()\">Delete</a>\n    </td>\n  </ng-container>\n\n  <tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>\n  <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\n</table>\n\n\n\n<hr>\n<pre>{{ metaData | json }}</pre>\n<hr>\n<pre>{{ schema | json }}</pre>\n");

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/navigation/navigation.component.html":
/*!*******************************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/components/navigation/navigation.component.html ***!
  \*******************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<nav class=\"navbar navbar-expand-lg navbar-light bg-light\">\n  <a class=\"navbar-brand\" href=\"#\">Navbar</a>\n  <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarSupportedContent\" aria-controls=\"navbarSupportedContent\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\n    <span class=\"navbar-toggler-icon\"></span>\n  </button>\n\n  <div class=\"collapse navbar-collapse\" id=\"navbarSupportedContent\">\n    <ul class=\"navbar-nav mr-auto\">\n      <li *ngFor=\"let item of metaData\" class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['gor', item.path]\" >{{item.label}}</a>\n      </li>\n      <li class=\"nav-item dropdown\">\n        <a class=\"nav-link dropdown-toggle\" href=\"#\" id=\"navbarDropdown\" role=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n          Dropdown\n        </a>\n        <div class=\"dropdown-menu\" aria-labelledby=\"navbarDropdown\">\n          <a class=\"dropdown-item\" href=\"#\">Action</a>\n          <a class=\"dropdown-item\" href=\"#\">Another action</a>\n          <div class=\"dropdown-divider\"></div>\n          <a class=\"dropdown-item\" href=\"#\">Something else here</a>\n        </div>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link disabled\" href=\"#\" tabindex=\"-1\" aria-disabled=\"true\">Disabled</a>\n      </li>\n    </ul>\n    <div class=\"my-2 my-lg-0\">\n      User etc.\n    </div>\n  </div>\n</nav>\n");

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/view/view.component.html":
/*!*******************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/components/view/view.component.html ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<div class=\"container\" *ngIf=\"entity\">\n\n  <h1 class=\"mt-3 mb-1\">{{ metaData?.name }}</h1>\n\n  <div class=\"text-right mb-2\">\n      <a [routerLink]=\"['/gor', metaData?.path, entity?.id, 'edit']\" class=\"btn btn-secondary\">Edit</a>\n      <a href=\"#\" class=\"btn btn-danger ml-1\" (click)=\"onDelete()\">Delete</a>\n  </div>\n\n  <div *ngFor=\"let property of properties\" class=\"row p-1 border-bottom\">\n    <div class=\"col-md-4 text-right bg-light\">{{ property }}</div>\n    <div class=\"col-md-8\">{{ entity[property] }}</div>\n  </div>\n\n</div>\n");

/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}


/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm2015/table.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm2015/platform-browser.js");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm2015/animations.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm2015/router.js");
/* harmony import */ var apollo_angular__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! apollo-angular */ "./node_modules/apollo-angular/fesm2015/ngApollo.js");
/* harmony import */ var apollo_angular_link_http__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! apollo-angular-link-http */ "./node_modules/apollo-angular-link-http/fesm2015/ngApolloLinkHttp.js");
/* harmony import */ var apollo_cache_inmemory__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! apollo-cache-inmemory */ "./node_modules/apollo-cache-inmemory/lib/bundle.esm.js");
/* harmony import */ var _components_app_app_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/app/app.component */ "./src/app/components/app/app.component.ts");
/* harmony import */ var _components_index_index_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/index/index.component */ "./src/app/components/index/index.component.ts");
/* harmony import */ var _components_navigation_navigation_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/navigation/navigation.component */ "./src/app/components/navigation/navigation.component.ts");
/* harmony import */ var _components_view_view_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/view/view.component */ "./src/app/components/view/view.component.ts");














const appRoutes = [
    { path: 'gor/:index', component: _components_index_index_component__WEBPACK_IMPORTED_MODULE_11__["IndexComponent"] },
    { path: 'gor/:index/:id', component: _components_view_view_component__WEBPACK_IMPORTED_MODULE_13__["ViewComponent"] },
    { path: 'gor/:index/:id/edit', component: _components_view_view_component__WEBPACK_IMPORTED_MODULE_13__["ViewComponent"] },
    { path: 'gor/:index/:id/new', component: _components_view_view_component__WEBPACK_IMPORTED_MODULE_13__["ViewComponent"] }
];
let AppModule = class AppModule {
    /**
     *
     */
    constructor(apollo, httpLink) {
        apollo.create({
            link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
            cache: new apollo_cache_inmemory__WEBPACK_IMPORTED_MODULE_9__["InMemoryCache"]()
        });
    }
};
AppModule.ctorParameters = () => [
    { type: apollo_angular__WEBPACK_IMPORTED_MODULE_7__["Apollo"] },
    { type: apollo_angular_link_http__WEBPACK_IMPORTED_MODULE_8__["HttpLink"] }
];
AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
        declarations: [
            _components_app_app_component__WEBPACK_IMPORTED_MODULE_10__["AppComponent"],
            _components_navigation_navigation_component__WEBPACK_IMPORTED_MODULE_12__["NavigationComponent"],
            _components_index_index_component__WEBPACK_IMPORTED_MODULE_11__["IndexComponent"],
            _components_view_view_component__WEBPACK_IMPORTED_MODULE_13__["ViewComponent"]
        ],
        imports: [
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__["BrowserModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClientModule"],
            apollo_angular__WEBPACK_IMPORTED_MODULE_7__["ApolloModule"],
            apollo_angular_link_http__WEBPACK_IMPORTED_MODULE_8__["HttpLinkModule"],
            _angular_material_table__WEBPACK_IMPORTED_MODULE_3__["MatTableModule"],
            _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterModule"].forRoot(appRoutes)
        ],
        entryComponents: [
            _components_index_index_component__WEBPACK_IMPORTED_MODULE_11__["IndexComponent"],
            _components_view_view_component__WEBPACK_IMPORTED_MODULE_13__["ViewComponent"]
        ],
        providers: [],
        bootstrap: [_components_app_app_component__WEBPACK_IMPORTED_MODULE_10__["AppComponent"]]
    })
], AppModule);



/***/ }),

/***/ "./src/app/components/app/app.component.scss":
/*!***************************************************!*\
  !*** ./src/app/components/app/app.component.scss ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2NvbXBvbmVudHMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */");

/***/ }),

/***/ "./src/app/components/app/app.component.ts":
/*!*************************************************!*\
  !*** ./src/app/components/app/app.component.ts ***!
  \*************************************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");


let AppComponent = class AppComponent {
    constructor() {
        this.title = 'gor';
    }
};
AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-root',
        template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./app.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/app/app.component.html")).default,
        styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./app.component.scss */ "./src/app/components/app/app.component.scss")).default]
    })
], AppComponent);



/***/ }),

/***/ "./src/app/components/index/index.component.scss":
/*!*******************************************************!*\
  !*** ./src/app/components/index/index.component.scss ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("table {\n  width: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aG9yZWsvUHJvamVjdHMvaW5nLmQvZ29yLmQvZ3JhcGgtb24tcmFpbHMvc3JjL2FwcC9jb21wb25lbnRzL2luZGV4L2luZGV4LmNvbXBvbmVudC5zY3NzIiwic3JjL2FwcC9jb21wb25lbnRzL2luZGV4L2luZGV4LmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsV0FBQTtBQ0NGIiwiZmlsZSI6InNyYy9hcHAvY29tcG9uZW50cy9pbmRleC9pbmRleC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbInRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG59XG4iLCJ0YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xufSJdfQ== */");

/***/ }),

/***/ "./src/app/components/index/index.component.ts":
/*!*****************************************************!*\
  !*** ./src/app/components/index/index.component.ts ***!
  \*****************************************************/
/*! exports provided: IndexComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IndexComponent", function() { return IndexComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var src_app_shared_crud_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/shared/crud.component */ "./src/app/shared/crud.component.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm2015/router.js");
/* harmony import */ var src_app_services_meta_data_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/services/meta-data.service */ "./src/app/services/meta-data.service.ts");
/* harmony import */ var src_app_services_entity_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! src/app/services/entity.service */ "./src/app/services/entity.service.ts");







let IndexComponent = class IndexComponent extends src_app_shared_crud_component__WEBPACK_IMPORTED_MODULE_3__["CrudComponent"] {
    /**
     *
     */
    constructor(route, metaDataService, entityService) {
        super(route, metaDataService, entityService);
        this.route = route;
        this.metaDataService = metaDataService;
        this.entityService = entityService;
        this.fields = [];
        this.dataSource = null;
    }
    get displayedColumns() { return lodash__WEBPACK_IMPORTED_MODULE_2__["concat"](this.fields, ['actions']); }
    /**
     *
     */
    setData() {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            this.setColumns();
            const list = lodash__WEBPACK_IMPORTED_MODULE_2__["get"](this.metaData, 'list');
            this.dataSource = this.entityService.getIndexData(list, this.fields);
        });
    }
    /**
     *
     */
    setColumns() {
        this.fields = lodash__WEBPACK_IMPORTED_MODULE_2__["get"](this.metaData, 'table');
        this.fields = this.fields || lodash__WEBPACK_IMPORTED_MODULE_2__["map"](lodash__WEBPACK_IMPORTED_MODULE_2__["filter"](this.schema.fields, (field) => lodash__WEBPACK_IMPORTED_MODULE_2__["includes"](['SCALAR', 'ENUM'], lodash__WEBPACK_IMPORTED_MODULE_2__["get"](field, 'type.kind'))), (field) => field.name);
    }
};
IndexComponent.ctorParameters = () => [
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"] },
    { type: src_app_services_meta_data_service__WEBPACK_IMPORTED_MODULE_5__["MetaDataService"] },
    { type: src_app_services_entity_service__WEBPACK_IMPORTED_MODULE_6__["EntityService"] }
];
IndexComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-index',
        template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./index.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/index/index.component.html")).default,
        styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./index.component.scss */ "./src/app/components/index/index.component.scss")).default]
    })
], IndexComponent);



/***/ }),

/***/ "./src/app/components/navigation/navigation.component.scss":
/*!*****************************************************************!*\
  !*** ./src/app/components/navigation/navigation.component.scss ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2NvbXBvbmVudHMvbmF2aWdhdGlvbi9uYXZpZ2F0aW9uLmNvbXBvbmVudC5zY3NzIn0= */");

/***/ }),

/***/ "./src/app/components/navigation/navigation.component.ts":
/*!***************************************************************!*\
  !*** ./src/app/components/navigation/navigation.component.ts ***!
  \***************************************************************/
/*! exports provided: NavigationComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavigationComponent", function() { return NavigationComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var src_app_services_meta_data_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/meta-data.service */ "./src/app/services/meta-data.service.ts");



let NavigationComponent = class NavigationComponent {
    /**
     *
     */
    constructor(metaDataService) {
        this.metaDataService = metaDataService;
        this.metaData = null;
    }
    /**
     *
     */
    ngOnInit() {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            this.metaData = yield this.metaDataService.resolveMetaData();
        });
    }
};
NavigationComponent.ctorParameters = () => [
    { type: src_app_services_meta_data_service__WEBPACK_IMPORTED_MODULE_2__["MetaDataService"] }
];
NavigationComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-navigation',
        template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./navigation.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/navigation/navigation.component.html")).default,
        styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./navigation.component.scss */ "./src/app/components/navigation/navigation.component.scss")).default]
    })
], NavigationComponent);



/***/ }),

/***/ "./src/app/components/view/view.component.scss":
/*!*****************************************************!*\
  !*** ./src/app/components/view/view.component.scss ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("table {\n  width: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aG9yZWsvUHJvamVjdHMvaW5nLmQvZ29yLmQvZ3JhcGgtb24tcmFpbHMvc3JjL2FwcC9jb21wb25lbnRzL3ZpZXcvdmlldy5jb21wb25lbnQuc2NzcyIsInNyYy9hcHAvY29tcG9uZW50cy92aWV3L3ZpZXcuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxXQUFBO0FDQ0YiLCJmaWxlIjoic3JjL2FwcC9jb21wb25lbnRzL3ZpZXcvdmlldy5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbInRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG59XG4iLCJ0YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xufSJdfQ== */");

/***/ }),

/***/ "./src/app/components/view/view.component.ts":
/*!***************************************************!*\
  !*** ./src/app/components/view/view.component.ts ***!
  \***************************************************/
/*! exports provided: ViewComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewComponent", function() { return ViewComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm2015/router.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var src_app_services_entity_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/entity.service */ "./src/app/services/entity.service.ts");
/* harmony import */ var src_app_services_meta_data_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/services/meta-data.service */ "./src/app/services/meta-data.service.ts");
/* harmony import */ var src_app_shared_crud_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! src/app/shared/crud.component */ "./src/app/shared/crud.component.ts");







let ViewComponent = class ViewComponent extends src_app_shared_crud_component__WEBPACK_IMPORTED_MODULE_6__["CrudComponent"] {
    /**
     *
     */
    constructor(route, metaDataService, entityService) {
        super(route, metaDataService, entityService);
        this.route = route;
        this.metaDataService = metaDataService;
        this.entityService = entityService;
        this.properties = [];
        this.entity = {};
    }
    /**
     *
     */
    setData() {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            this.properties = lodash__WEBPACK_IMPORTED_MODULE_3__["get"](this.metaData, 'view.properties') || lodash__WEBPACK_IMPORTED_MODULE_3__["map"](lodash__WEBPACK_IMPORTED_MODULE_3__["filter"](this.schema.fields, (field) => lodash__WEBPACK_IMPORTED_MODULE_3__["includes"](['SCALAR', 'ENUM'], lodash__WEBPACK_IMPORTED_MODULE_3__["get"](field, 'type.kind'))), (field) => field.name);
            this.entityService.getEntityData(this.entityName, this.id, this.properties).subscribe(entity => this.entity = entity);
        });
    }
};
ViewComponent.ctorParameters = () => [
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"] },
    { type: src_app_services_meta_data_service__WEBPACK_IMPORTED_MODULE_5__["MetaDataService"] },
    { type: src_app_services_entity_service__WEBPACK_IMPORTED_MODULE_4__["EntityService"] }
];
ViewComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-view',
        template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./view.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/components/view/view.component.html")).default,
        styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./view.component.scss */ "./src/app/components/view/view.component.scss")).default]
    })
], ViewComponent);



/***/ }),

/***/ "./src/app/services/entity.service.ts":
/*!********************************************!*\
  !*** ./src/app/services/entity.service.ts ***!
  \********************************************/
/*! exports provided: EntityService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EntityService", function() { return EntityService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var apollo_angular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! apollo-angular */ "./node_modules/apollo-angular/fesm2015/ngApollo.js");
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! graphql-tag */ "./node_modules/graphql-tag/src/index.js");
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(graphql_tag__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm2015/index.js");







let EntityService = class EntityService {
    /**
     *
     */
    constructor(apollo) {
        this.apollo = apollo;
        this.metaData = {};
    }
    /**
     *
     */
    resolveMetaData(entity) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            const data = this.metaData[entity];
            if (data)
                return new Promise(resolve => resolve(data));
            return new Promise(resolve => {
                this.apollo.watchQuery({
                    query: graphql_tag__WEBPACK_IMPORTED_MODULE_3___default.a `
        {
          __type(name: "${entity}") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }`
                }).valueChanges.subscribe(response => {
                    const loading = lodash__WEBPACK_IMPORTED_MODULE_4__["get"](response, 'data.loading');
                    if (loading)
                        return;
                    const data = lodash__WEBPACK_IMPORTED_MODULE_4__["get"](response, 'data.__type');
                    if (data)
                        this.metaData[entity] = data;
                    resolve(data);
                });
            });
        });
    }
    /**
     *
     */
    getIndexData(index, fields) {
        const query = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default.a `query { ${index} { ${lodash__WEBPACK_IMPORTED_MODULE_4__["join"](fields)} } }`;
        return this.apollo.watchQuery({ query }).valueChanges.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["filter"])((result) => !result.loading), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["map"])((result) => {
            if (result.error)
                console.error(result.error);
            return lodash__WEBPACK_IMPORTED_MODULE_4__["get"](result, ['data', index]);
        }));
    }
    /**
     *
     */
    getEntityData(entity, id, fields) {
        const query = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default.a `query { ${entity}(id: "${id}") { ${lodash__WEBPACK_IMPORTED_MODULE_4__["join"](fields)} } }`;
        return this.apollo.watchQuery({ query, errorPolicy: 'all' }).valueChanges.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["filter"])(result => !result.loading), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["map"])(result => lodash__WEBPACK_IMPORTED_MODULE_4__["get"](result, ['data', entity]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["catchError"])(error => {
            if (error.graphQLErrors)
                error.graphQLErrors.forEach((e) => console.error(e));
            if (error.networkError)
                console.error(error.networkError);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_6__["of"])([]);
        })));
    }
};
EntityService.ctorParameters = () => [
    { type: apollo_angular__WEBPACK_IMPORTED_MODULE_2__["Apollo"] }
];
EntityService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
        providedIn: 'root'
    })
], EntityService);



/***/ }),

/***/ "./src/app/services/meta-data.service.ts":
/*!***********************************************!*\
  !*** ./src/app/services/meta-data.service.ts ***!
  \***********************************************/
/*! exports provided: MetaDataService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetaDataService", function() { return MetaDataService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm2015/router.js");
/* harmony import */ var apollo_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! apollo-angular */ "./node_modules/apollo-angular/fesm2015/ngApollo.js");
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! graphql-tag */ "./node_modules/graphql-tag/src/index.js");
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(graphql_tag__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_5__);






let MetaDataService = class MetaDataService {
    /**
     *
     */
    constructor(router, apollo) {
        this.router = router;
        this.apollo = apollo;
        this.metaData = undefined;
    }
    /**
     *
     */
    resolveMetaData() {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            if (this.metaData)
                return new Promise(resolve => resolve(this.metaData));
            return new Promise(resolve => {
                this.apollo.watchQuery({
                    query: graphql_tag__WEBPACK_IMPORTED_MODULE_4___default.a `
          query{
            metaData {
              name
              path
              label
              parent
              list
              entity
            }
          }
        `
                }).valueChanges.subscribe(response => {
                    const loading = lodash__WEBPACK_IMPORTED_MODULE_5___default.a.get(response, 'data.loading');
                    if (loading)
                        return;
                    this.metaData = lodash__WEBPACK_IMPORTED_MODULE_5___default.a.get(response, 'data.metaData');
                    this.addRoutes();
                    resolve(this.metaData);
                });
            });
        });
    }
    /**
     *
     */
    addRoutes() {
        // const routes = _.flatten( _.map( this.metaData, (item:any) => [
        //   { path: item.path, component: IndexComponent },
        //   { path: `${item.path}/:id`, component: ViewComponent },
        //   { path: `${item.path}/:id/edit`, component: ViewComponent },
        //   { path: `${item.path}/new`, component: ViewComponent }
        // ]));
        // this.router.resetConfig( routes );
    }
};
MetaDataService.ctorParameters = () => [
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
    { type: apollo_angular__WEBPACK_IMPORTED_MODULE_3__["Apollo"] }
];
MetaDataService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
        providedIn: 'root'
    })
], MetaDataService);



/***/ }),

/***/ "./src/app/shared/crud.component.ts":
/*!******************************************!*\
  !*** ./src/app/shared/crud.component.ts ***!
  \******************************************/
/*! exports provided: CrudComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudComponent", function() { return CrudComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);


class CrudComponent {
    /**
     *
     */
    constructor(route, metaDataService, entityService) {
        this.route = route;
        this.metaDataService = metaDataService;
        this.entityService = entityService;
        this.metaData = null;
        this.schema = null;
    }
    /**
     *
     */
    ngOnInit() {
        this.route.params.subscribe((params) => tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            this.index = lodash__WEBPACK_IMPORTED_MODULE_1__["get"](params, 'index');
            if (lodash__WEBPACK_IMPORTED_MODULE_1__["isNil"](this.index))
                return console.warn(`need 'index' in url`);
            this.id = lodash__WEBPACK_IMPORTED_MODULE_1__["get"](params, 'id');
            yield this.setMetaData();
            this.setData();
        }));
    }
    /**
     *
     */
    setMetaData() {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
            const data = yield this.metaDataService.resolveMetaData();
            this.metaData = lodash__WEBPACK_IMPORTED_MODULE_1__["find"](data, (item) => lodash__WEBPACK_IMPORTED_MODULE_1__["get"](item, 'path') === this.index);
            if (lodash__WEBPACK_IMPORTED_MODULE_1__["isNil"](this.metaData))
                throw new Error(`cannot find metadata for '${this.index}'`);
            const name = lodash__WEBPACK_IMPORTED_MODULE_1__["get"](this.metaData, 'name');
            this.entityName = lodash__WEBPACK_IMPORTED_MODULE_1__["get"](this.metaData, 'entity');
            this.schema = yield this.entityService.resolveMetaData(name);
        });
    }
    /**
     *
     */
    onDelete() {
        console.log("onDelete clicked");
        return false;
    }
}


/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm2015/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");






if (_environments_environment__WEBPACK_IMPORTED_MODULE_5__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_3__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_4__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/thorek/Projects/ing.d/gor.d/graph-on-rails/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);