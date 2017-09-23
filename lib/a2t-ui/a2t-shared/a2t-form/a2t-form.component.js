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
var a2t_form_service_1 = require("./a2t-form.service");
var A2tFormComponent = (function () {
    function A2tFormComponent(_formService) {
        this._formService = _formService;
    }
    return A2tFormComponent;
}());
A2tFormComponent = __decorate([
    core_1.Component({
        selector: 'a2t-form',
        template: "\n        <form class=\"a2t-form\"\n            (ngSubmit)=\"_formService.submit()\"\n            [formGroup]=\"_formService.formGroup\">\n\n            <a2t-form-field\n                *ngFor=\"let field of this._formService.fields\"\n                [question]=\"field\"\n                [form]=\"_formService.formGroup\">\n            </a2t-form-field>\n\n            <button type=\"submit\" [disabled]=\"!_formService.formGroup.valid || _formService.formGroup.pristine || _formService.submitLock\">\n                <ng-content *ngIf=\"!_formService.submitLock\"></ng-content>\n                <span *ngIf=\"_formService.submitLock\">Submitting ...</span>\n            </button>\n        </form>\n    ",
        styles: ["\n        .a2t-form {\n            background-color: white;\n            border-radius: 3px;\n            box-shadow: 0px 1px 5px 0 rgba(0,0,0,0.3);\n            padding-top: 20px;\n            font-family: \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n        }\n\n        .a2t-form button {\n            width: 100%;\n\n            transition: .3s;\n            background-color: #72c380;\n\n            border-bottom-right-radius: 3px;\n            border-bottom-left-radius: 3px;\n\n            outline: none;\n            text-align: center;\n            font-weight: 400;\n            border: none;\n            font-size: 16px;\n            line-height: 30px;\n\n            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);\n            color: white;\n            border-bottom: 3px solid transparent;\n        }\n\n        .a2t-form button:disabled {\n            background-color: #eee !important;\n            cursor: not-allowed;\n            color: #999;\n            text-shadow: none;\n        }\n\n        .a2t-form button:hover {\n            background-color: #a6d9ae;\n        }\n    "]
    }),
    __metadata("design:paramtypes", [a2t_form_service_1.A2tFormService])
], A2tFormComponent);
exports.A2tFormComponent = A2tFormComponent;
//# sourceMappingURL=a2t-form.component.js.map