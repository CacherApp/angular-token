"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var _1 = require("./");
var a2t_sign_in_component_1 = require("./a2t-sign-in/a2t-sign-in.component");
var a2t_sign_up_component_1 = require("./a2t-sign-up/a2t-sign-up.component");
var a2t_reset_password_component_1 = require("./a2t-reset-password/a2t-reset-password.component");
var a2t_update_password_component_1 = require("./a2t-update-password/a2t-update-password.component");
var A2tUiModule = (function () {
    function A2tUiModule() {
    }
    return A2tUiModule;
}());
A2tUiModule = __decorate([
    core_1.NgModule({
        imports: [
            common_1.CommonModule,
            router_1.RouterModule,
            _1.A2tSharedModule,
            _1.a2tRoutes
        ],
        declarations: [
            _1.A2tUiComponent,
            a2t_sign_in_component_1.A2tSignInComponent,
            a2t_sign_up_component_1.A2tSignUpComponent,
            a2t_reset_password_component_1.A2tResetPasswordComponent,
            a2t_update_password_component_1.A2tUpdatePasswordComponent
        ]
    })
], A2tUiModule);
exports.A2tUiModule = A2tUiModule;
//# sourceMappingURL=a2t-ui.module.js.map