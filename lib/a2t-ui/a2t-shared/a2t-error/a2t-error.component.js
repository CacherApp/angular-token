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
var A2tErrorComponent = (function () {
    function A2tErrorComponent() {
    }
    return A2tErrorComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], A2tErrorComponent.prototype, "errors", void 0);
A2tErrorComponent = __decorate([
    core_1.Component({
        selector: 'a2t-error',
        template: '<div *ngFor="let error of errors"><p>{{error}}</p></div>',
        styles: ["\n        div {\n            width: 100%;\n            background-color: #df6564;\n            color: white;\n            font-weight: 300;\n            font-size: 15px;\n            padding: 10px 20px;\n            border-radius: 3px;\n            margin-bottom: 15px;\n        }\n\n        div > p {\n            margin-bottom: 0;\n        }\n    "]
    }),
    __metadata("design:paramtypes", [])
], A2tErrorComponent);
exports.A2tErrorComponent = A2tErrorComponent;
//# sourceMappingURL=a2t-error.component.js.map