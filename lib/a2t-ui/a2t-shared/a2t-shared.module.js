"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var a2t_form_1 = require("./a2t-form");
var a2t_links_component_1 = require("./a2t-links/a2t-links.component");
var a2t_error_component_1 = require("./a2t-error/a2t-error.component");
var a2t_headline_component_1 = require("./a2t-headline/a2t-headline.component");
var A2tSharedModule = (function () {
    function A2tSharedModule() {
    }
    return A2tSharedModule;
}());
A2tSharedModule = __decorate([
    core_1.NgModule({
        imports: [
            common_1.CommonModule,
            forms_1.ReactiveFormsModule,
            router_1.RouterModule
        ],
        declarations: [
            a2t_form_1.A2tFormFieldComponent,
            a2t_form_1.A2tFormComponent,
            a2t_links_component_1.A2tLinksComponent,
            a2t_error_component_1.A2tErrorComponent,
            a2t_headline_component_1.A2tHeadlineComponent
        ],
        exports: [
            a2t_form_1.A2tFormComponent,
            a2t_links_component_1.A2tLinksComponent,
            a2t_error_component_1.A2tErrorComponent,
            a2t_headline_component_1.A2tHeadlineComponent
        ]
    })
], A2tSharedModule);
exports.A2tSharedModule = A2tSharedModule;
//# sourceMappingURL=a2t-shared.module.js.map