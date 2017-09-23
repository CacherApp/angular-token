"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var angular2_token_service_1 = require("../../angular2-token.service");
var a2t_shared_1 = require("../a2t-shared");
var _1 = require("../");
var A2tResetPasswordComponent = (function () {
    function A2tResetPasswordComponent(_formService, _sessionService) {
        var _this = this;
        this._formService = _formService;
        this._sessionService = _sessionService;
        this._emailSend = false;
        this._formService.initForm(_1.RESET_PASSWORD_FORM);
        this._formService.submit$.subscribe(function (data) { return _this._sessionService.resetPassword(data).subscribe(function (res) { return _this._handleSuccess(); }, function (error) { return _this._handleError(); }); });
    }
    A2tResetPasswordComponent.prototype._handleSuccess = function () {
        this._emailSend = true;
    };
    A2tResetPasswordComponent.prototype._handleError = function () {
        this._emailSend = true;
    };
    return A2tResetPasswordComponent;
}());
A2tResetPasswordComponent = __decorate([
    core_1.Component({
        selector: 'a2t-reset-password',
        providers: [a2t_shared_1.A2tFormService],
        template: "\n        <a2t-headline *ngIf=\"!_emailSend\">Reset your Password</a2t-headline>\n        <a2t-form *ngIf=\"!_emailSend\">Reset Password</a2t-form>\n        <p class=\"email-send-text\" *ngIf=\"_emailSend\">\n            If the entered email is registered we will send instruction on how to reset your password.\n        </p>\n        <a2t-links *ngIf=\"!_emailSend\" case=\"reset-password\"></a2t-links>\n    ",
        styles: ["\n        .email-send-text {\n            background-color: #72c380;\n            color: white;\n            font-size: 16pt;\n            text-align: center;\n            padding: 20px;\n            border-radius: 3px;\n        }\n    "]
    }),
    __metadata("design:paramtypes", [a2t_shared_1.A2tFormService,
        angular2_token_service_1.Angular2TokenService])
], A2tResetPasswordComponent);
exports.A2tResetPasswordComponent = A2tResetPasswordComponent;
//# sourceMappingURL=a2t-reset-password.component.js.map