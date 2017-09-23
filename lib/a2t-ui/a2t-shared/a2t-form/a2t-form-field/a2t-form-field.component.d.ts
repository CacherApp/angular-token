import { OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseField } from '../../../a2t-ui.forms';
export declare class A2tFormFieldComponent implements OnInit {
    question: BaseField;
    form: FormGroup;
    private _control;
    ngOnInit(): void;
    readonly isValid: boolean;
}
