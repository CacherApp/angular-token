/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AngularTokenService } from './angular-token.service';
import { tap } from 'rxjs/operators';
export class AngularTokenInterceptor {
    /**
     * @param {?} tokenService
     */
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    intercept(req, next) {
        // Get auth data from local storage
        this.tokenService.getAuthDataFromStorage();
        // Add the headers if the request is going to the configured server
        if (this.tokenService.currentAuthData && (this.tokenService.apiBase === null || req.url.match(this.tokenService.apiBase))) {
            /** @type {?} */
            const headers = {
                'access-token': this.tokenService.currentAuthData.accessToken,
                'client': this.tokenService.currentAuthData.client,
                'expiry': this.tokenService.currentAuthData.expiry,
                'token-type': this.tokenService.currentAuthData.tokenType,
                'uid': this.tokenService.currentAuthData.uid
            };
            // Custom headers passed in for each request
            /** @type {?} */
            const globalOptions = this.tokenService.globalOptions;
            if (globalOptions && globalOptions.headers) {
                for (let key in globalOptions.headers) {
                    headers[key] = globalOptions.headers[key];
                }
            }
            req = req.clone({
                setHeaders: headers
            });
        }
        return next.handle(req).pipe(tap(res => this.handleResponse(res), err => this.handleResponse(err)));
    }
    // Parse Auth data from response
    /**
     * @param {?} res
     * @return {?}
     */
    handleResponse(res) {
        if (res instanceof HttpResponse || res instanceof HttpErrorResponse) {
            if (this.tokenService.apiBase === null || (res.url && res.url.match(this.tokenService.apiBase))) {
                this.tokenService.getAuthHeadersFromResponse((/** @type {?} */ (res)));
            }
        }
    }
}
AngularTokenInterceptor.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AngularTokenInterceptor.ctorParameters = () => [
    { type: AngularTokenService }
];
if (false) {
    /** @type {?} */
    AngularTokenInterceptor.prototype.atOptions;
    /** @type {?} */
    AngularTokenInterceptor.prototype.tokenService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItdG9rZW4vIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdyQyxNQUFNLE9BQU8sdUJBQXVCOzs7O0lBR2xDLFlBQXFCLFlBQWlDO1FBQWpDLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtJQUN0RCxDQUFDOzs7Ozs7SUFFRCxTQUFTLENBQUMsR0FBcUIsRUFBRSxJQUFpQjtRQUVoRCxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRTNDLG1FQUFtRTtRQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTs7a0JBRW5ILE9BQU8sR0FBRztnQkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsV0FBVztnQkFDN0QsUUFBUSxFQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQU07Z0JBQ3hELFFBQVEsRUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2dCQUN4RCxZQUFZLEVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBUztnQkFDM0QsS0FBSyxFQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQUc7YUFDdEQ7OztrQkFHSyxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhO1lBQ3JELElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7Z0JBQzFDLEtBQUssSUFBSSxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtvQkFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzNDO2FBQ0Y7WUFFRCxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztnQkFDZCxVQUFVLEVBQUUsT0FBTzthQUNwQixDQUFDLENBQUM7U0FDSjtRQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUM1QixHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FDbEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7O0lBSU8sY0FBYyxDQUFDLEdBQVE7UUFDN0IsSUFBSSxHQUFHLFlBQVksWUFBWSxJQUFJLEdBQUcsWUFBWSxpQkFBaUIsRUFBRTtZQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO2dCQUMvRixJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLG1CQUFLLEdBQUcsRUFBQSxDQUFDLENBQUM7YUFDeEQ7U0FDRjtJQUNILENBQUM7OztZQWxERixVQUFVOzs7O1lBTEYsbUJBQW1COzs7O0lBTzFCLDRDQUF1Qzs7SUFFMUIsK0NBQXlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cEV2ZW50LCBIdHRwUmVxdWVzdCwgSHR0cEludGVyY2VwdG9yLCBIdHRwSGFuZGxlciwgSHR0cFJlc3BvbnNlLCBIdHRwRXJyb3JSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgQW5ndWxhclRva2VuT3B0aW9ucyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5tb2RlbCc7XG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLnNlcnZpY2UnO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG4gIHByaXZhdGUgYXRPcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCBwcml2YXRlIHRva2VuU2VydmljZTogQW5ndWxhclRva2VuU2VydmljZSApIHtcbiAgfVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuXG4gICAgLy8gR2V0IGF1dGggZGF0YSBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk7XG5cbiAgICAvLyBBZGQgdGhlIGhlYWRlcnMgaWYgdGhlIHJlcXVlc3QgaXMgZ29pbmcgdG8gdGhlIGNvbmZpZ3VyZWQgc2VydmVyXG4gICAgaWYgKHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YSAmJiAodGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSA9PT0gbnVsbCB8fCByZXEudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UpKSkge1xuXG4gICAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgICAnYWNjZXNzLXRva2VuJzogdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLmFjY2Vzc1Rva2VuLFxuICAgICAgICAnY2xpZW50JzogICAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLmNsaWVudCxcbiAgICAgICAgJ2V4cGlyeSc6ICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5leHBpcnksXG4gICAgICAgICd0b2tlbi10eXBlJzogICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEudG9rZW5UeXBlLFxuICAgICAgICAndWlkJzogICAgICAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnVpZFxuICAgICAgfTtcblxuICAgICAgLy8gQ3VzdG9tIGhlYWRlcnMgcGFzc2VkIGluIGZvciBlYWNoIHJlcXVlc3RcbiAgICAgIGNvbnN0IGdsb2JhbE9wdGlvbnMgPSB0aGlzLnRva2VuU2VydmljZS5nbG9iYWxPcHRpb25zO1xuICAgICAgaWYgKGdsb2JhbE9wdGlvbnMgJiYgZ2xvYmFsT3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBnbG9iYWxPcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICBoZWFkZXJzW2tleV0gPSBnbG9iYWxPcHRpb25zLmhlYWRlcnNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXEgPSByZXEuY2xvbmUoe1xuICAgICAgICBzZXRIZWFkZXJzOiBoZWFkZXJzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKS5waXBlKHRhcChcbiAgICAgICAgcmVzID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UocmVzKSxcbiAgICAgICAgZXJyID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UoZXJyKVxuICAgICkpO1xuICB9XG5cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSByZXNwb25zZVxuICBwcml2YXRlIGhhbmRsZVJlc3BvbnNlKHJlczogYW55KTogdm9pZCB7XG4gICAgaWYgKHJlcyBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSB8fCByZXMgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSkge1xuICAgICAgaWYgKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UgPT09IG51bGwgfHwgKHJlcy51cmwgJiYgcmVzLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlKSkpIHtcbiAgICAgICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aEhlYWRlcnNGcm9tUmVzcG9uc2UoPGFueT5yZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19