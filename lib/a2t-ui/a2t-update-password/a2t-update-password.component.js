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
var router_1 = require("@angular/router");
var angular2_token_service_1 = require("../../angular2-token.service");
var a2t_shared_1 = require("../a2t-shared");
var _1 = require("../");
var A2tUpdatePasswordComponent = (function () {
    function A2tUpdatePasswordComponent(_formService, _sessionService, _router) {
        var _this = this;
        this._formService = _formService;
        this._sessionService = _sessionService;
        this._router = _router;
        this._formService.initForm(_1.UPDATE_PASSWORD_FORM);
        this._formService.submit$.subscribe(function (data) { return _this._sessionService.updatePassword(data).subscribe(function (res) { return _this._handleSuccess(res); }, function (error) { return _this._handleError(error); }); });
    }
    A2tUpdatePasswordComponent.prototype._handleSuccess = function (data) {
        this._router.navigate(['session/sign-in']);
    };
    A2tUpdatePasswordComponent.prototype._handleError = function (error) {
        this._errors = error.json().errors;
        this._formService.unlockSubmit();
    };
    return A2tUpdatePasswordComponent;
}());
A2tUpdatePasswordComponent = __decorate([
    core_1.Component({
        selector: 'a2t-update-password',
        providers: [a2t_shared_1.A2tFormService],
        template: "\n        <a2t-headline>Update your Password</a2t-headline>\n        <a2t-error [errors]=\"_errors\"></a2t-error>\n        <a2t-form>Update Password</a2t-form>\n    "
    }),
    __metadata("design:paramtypes", [a2t_shared_1.A2tFormService,
        angular2_token_service_1.Angular2TokenService,
        router_1.Router])
], A2tUpdatePasswordComponent);
exports.A2tUpdatePasswordComponent = A2tUpdatePasswordComponent;
//# sourceMappingURL=a2t-update-password.component.js.map