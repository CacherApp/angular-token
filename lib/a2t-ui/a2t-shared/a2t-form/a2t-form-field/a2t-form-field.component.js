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
var forms_1 = require("@angular/forms");
var a2t_ui_forms_1 = require("../../../a2t-ui.forms");
var A2tFormFieldComponent = (function () {
    function A2tFormFieldComponent() {
    }
    A2tFormFieldComponent.prototype.ngOnInit = function () {
        this._control = this.form.controls[this.question.key];
    };
    Object.defineProperty(A2tFormFieldComponent.prototype, "isValid", {
        get: function () {
            return this._control.valid;
        },
        enumerable: true,
        configurable: true
    });
    return A2tFormFieldComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", a2t_ui_forms_1.BaseField)
], A2tFormFieldComponent.prototype, "question", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", forms_1.FormGroup)
], A2tFormFieldComponent.prototype, "form", void 0);
A2tFormFieldComponent = __decorate([
    core_1.Component({
        selector: 'a2t-form-field',
        template: "\n        <div class=\"a2t-input-group\"\n            [formGroup]=\"form\">\n\n            <label\n                [attr.for]=\"question.key\"\n                [style.color]=\"labelColor\"\n                *ngIf=\"_control.pristine\">\n                {{question.label}}\n            </label>\n\n            <label class=\"a2t-error\"\n                [attr.for]=\"question.key\"\n                *ngIf=\"_control.hasError('required') && !_control.pristine\">\n                {{question.label}} is required\n            </label>\n\n            <label class=\"a2t-error\"\n                [attr.for]=\"question.key\"\n                *ngIf=\"_control.hasError('minlength')\">\n                {{question.label}} is too short\n            </label>\n\n            <label class=\"a2t-error\"\n                [attr.for]=\"question.key\"\n                *ngIf=\"_control.hasError('maxlength')\">\n                {{question.label}} is too long\n            </label>\n\n            <label class=\"a2t-valid\"\n                [attr.for]=\"question.key\"\n                *ngIf=\"_control.valid && !_control.pristine\">\n                {{question.label}}\n            </label>\n\n            <input\n                [formControlName]=\"question.key\"\n                [id]=\"question.key\"\n                [type]=\"question.type\">\n        </div>\n    ",
        styles: ["\n        .a2t-input-group {\n            padding-bottom: 40px;\n            padding-right: 20px;\n            padding-left: 20px;\n            font-family: \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n        }\n\n        .a2t-input-group input {\n            width: 100%;\n            outline: none;\n            border: none;\n            background-color: #eee;\n            line-height: 40px;\n\n            padding-left: 10px;\n            padding-right: 10px;\n        }\n\n        .a2t-input-group label {\n            color: #666;\n            font-weight: 600;\n            font-size: 13px;\n            margin-bottom: 0;\n        }\n\n        .a2t-error {\n            color: #df6564 !important;\n        }\n\n        .a2t-valid {\n            color: #72c380 !important;\n        }\n    "]
    })
], A2tFormFieldComponent);
exports.A2tFormFieldComponent = A2tFormFieldComponent;
//# sourceMappingURL=a2t-form-field.component.js.map