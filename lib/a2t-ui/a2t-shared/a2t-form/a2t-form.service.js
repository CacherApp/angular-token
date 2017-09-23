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
var A2tFormService = (function () {
    function A2tFormService() {
        // Submit Event
        this.submit$ = new core_1.EventEmitter();
        this.submitLock = false;
    }
    A2tFormService.prototype.initForm = function (fields) {
        this.fields = fields;
        this._createFormGroup();
    };
    A2tFormService.prototype.submit = function () {
        this.submitLock = true;
        this.submit$.emit(this.formGroup.value);
    };
    A2tFormService.prototype.unlockSubmit = function () {
        this.formGroup.reset();
        this.submitLock = false;
    };
    ;
    A2tFormService.prototype._createFormGroup = function () {
        var group = {};
        this.fields.forEach(function (question) {
            group[question.key] = new forms_1.FormControl(null, question.validators);
        });
        this.formGroup = new forms_1.FormGroup(group);
    };
    return A2tFormService;
}());
A2tFormService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], A2tFormService);
exports.A2tFormService = A2tFormService;
//# sourceMappingURL=a2t-form.service.js.map