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
var A2tLinksComponent = (function () {
    function A2tLinksComponent() {
    }
    return A2tLinksComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], A2tLinksComponent.prototype, "case", void 0);
A2tLinksComponent = __decorate([
    core_1.Component({
        selector: 'a2t-links',
        template: "\n        <div class=\"a2t-wrapper\">\n            <p><a routerLink=\"/session/reset-password\" *ngIf=\"case != 'reset-password'\">Forgot Password?</a></p>\n            <p><a routerLink=\"/session/sign-up\" *ngIf=\"case != 'sign-up'\">Sign Up</a></p>\n            <p><a routerLink=\"/session/sign-in\" *ngIf=\"case != 'sign-in'\">Sign In</a></p>\n        </div>\n    ",
        styles: ["\n        .a2t-wrapper {\n            margin-top: 20px;\n        }\n\n        p {\n            margin-bottom: 0;\n        }\n\n        a {\n            color: #eee !important;\n            transition: .3s;\n            text-decoration: none;\n            font-size: 15px;\n            font-weight: 300;\n            font-family: \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n        }\n\n        a:hover {\n            color: white;\n        }\n    "]
    }),
    __metadata("design:paramtypes", [])
], A2tLinksComponent);
exports.A2tLinksComponent = A2tLinksComponent;
//# sourceMappingURL=a2t-links.component.js.map