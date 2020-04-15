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
                'uid': this.tokenService.currentAuthData.uid,
                'provider': this.tokenService.currentAuthData.provider
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItdG9rZW4vIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdyQyxNQUFNLE9BQU8sdUJBQXVCOzs7O0lBR2xDLFlBQXFCLFlBQWlDO1FBQWpDLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtJQUN0RCxDQUFDOzs7Ozs7SUFFRCxTQUFTLENBQUMsR0FBcUIsRUFBRSxJQUFpQjtRQUVoRCxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRTNDLG1FQUFtRTtRQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTs7a0JBRW5ILE9BQU8sR0FBRztnQkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsV0FBVztnQkFDN0QsUUFBUSxFQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQU07Z0JBQ3hELFFBQVEsRUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2dCQUN4RCxZQUFZLEVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBUztnQkFDM0QsS0FBSyxFQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQUc7Z0JBQ3JELFVBQVUsRUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRO2FBQzNEOzs7a0JBR0ssYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYTtZQUNyRCxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO2dCQUMxQyxLQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7b0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBRUQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsVUFBVSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDNUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7OztJQUlPLGNBQWMsQ0FBQyxHQUFRO1FBQzdCLElBQUksR0FBRyxZQUFZLFlBQVksSUFBSSxHQUFHLFlBQVksaUJBQWlCLEVBQUU7WUFDbkUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtnQkFDL0YsSUFBSSxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxtQkFBSyxHQUFHLEVBQUEsQ0FBQyxDQUFDO2FBQ3hEO1NBQ0Y7SUFDSCxDQUFDOzs7WUFuREYsVUFBVTs7OztZQUxGLG1CQUFtQjs7OztJQU8xQiw0Q0FBdUM7O0lBRTFCLCtDQUF5QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBFdmVudCwgSHR0cFJlcXVlc3QsIEh0dHBJbnRlcmNlcHRvciwgSHR0cEhhbmRsZXIsIEh0dHBSZXNwb25zZSwgSHR0cEVycm9yUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFuZ3VsYXJUb2tlbk9wdGlvbnMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuaW1wb3J0IHsgQW5ndWxhclRva2VuU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBwcml2YXRlIGF0T3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvciggcHJpdmF0ZSB0b2tlblNlcnZpY2U6IEFuZ3VsYXJUb2tlblNlcnZpY2UgKSB7XG4gIH1cblxuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcblxuICAgIC8vIEdldCBhdXRoIGRhdGEgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpO1xuXG4gICAgLy8gQWRkIHRoZSBoZWFkZXJzIGlmIHRoZSByZXF1ZXN0IGlzIGdvaW5nIHRvIHRoZSBjb25maWd1cmVkIHNlcnZlclxuICAgIGlmICh0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEgJiYgKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UgPT09IG51bGwgfHwgcmVxLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlKSkpIHtcblxuICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgJ2FjY2Vzcy10b2tlbic6IHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5hY2Nlc3NUb2tlbixcbiAgICAgICAgJ2NsaWVudCc6ICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5jbGllbnQsXG4gICAgICAgICdleHBpcnknOiAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuZXhwaXJ5LFxuICAgICAgICAndG9rZW4tdHlwZSc6ICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnRva2VuVHlwZSxcbiAgICAgICAgJ3VpZCc6ICAgICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS51aWQsXG4gICAgICAgICdwcm92aWRlcic6ICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEucHJvdmlkZXJcbiAgICAgIH07XG5cbiAgICAgIC8vIEN1c3RvbSBoZWFkZXJzIHBhc3NlZCBpbiBmb3IgZWFjaCByZXF1ZXN0XG4gICAgICBjb25zdCBnbG9iYWxPcHRpb25zID0gdGhpcy50b2tlblNlcnZpY2UuZ2xvYmFsT3B0aW9ucztcbiAgICAgIGlmIChnbG9iYWxPcHRpb25zICYmIGdsb2JhbE9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZ2xvYmFsT3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgICAgaGVhZGVyc1trZXldID0gZ2xvYmFsT3B0aW9ucy5oZWFkZXJzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVxID0gcmVxLmNsb25lKHtcbiAgICAgICAgc2V0SGVhZGVyczogaGVhZGVyc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSkucGlwZSh0YXAoXG4gICAgICAgIHJlcyA9PiB0aGlzLmhhbmRsZVJlc3BvbnNlKHJlcyksXG4gICAgICAgIGVyciA9PiB0aGlzLmhhbmRsZVJlc3BvbnNlKGVycilcbiAgICApKTtcbiAgfVxuXG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcmVzcG9uc2VcbiAgcHJpdmF0ZSBoYW5kbGVSZXNwb25zZShyZXM6IGFueSk6IHZvaWQge1xuICAgIGlmIChyZXMgaW5zdGFuY2VvZiBIdHRwUmVzcG9uc2UgfHwgcmVzIGluc3RhbmNlb2YgSHR0cEVycm9yUmVzcG9uc2UpIHtcbiAgICAgIGlmICh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlID09PSBudWxsIHx8IChyZXMudXJsICYmIHJlcy51cmwubWF0Y2godGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSkpKSB7XG4gICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmdldEF1dGhIZWFkZXJzRnJvbVJlc3BvbnNlKDxhbnk+cmVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==