import { ModuleWithProviders } from '@angular/core';
import { AngularTokenOptions } from './angular-token.model';
export * from './angular-token.service';
export declare class AngularTokenModule {
    constructor(parentModule: AngularTokenModule);
    static forRoot(options: AngularTokenOptions): ModuleWithProviders;
}
