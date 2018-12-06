import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { AngularTokenService } from './angular-token.service';
import { Observable } from 'rxjs';
export declare class AngularTokenInterceptor implements HttpInterceptor {
    private tokenService;
    private atOptions;
    constructor(tokenService: AngularTokenService);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private handleResponse;
}
