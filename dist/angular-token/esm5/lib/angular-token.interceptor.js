/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AngularTokenService } from './angular-token.service';
import { tap } from 'rxjs/operators';
var AngularTokenInterceptor = /** @class */ (function () {
    function AngularTokenInterceptor(tokenService) {
        this.tokenService = tokenService;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    AngularTokenInterceptor.prototype.intercept = /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    function (req, next) {
        var _this = this;
        // Get auth data from local storage
        this.tokenService.getAuthDataFromStorage();
        // Add the headers if the request is going to the configured server
        if (this.tokenService.currentAuthData && (this.tokenService.apiBase === null || req.url.match(this.tokenService.apiBase))) {
            /** @type {?} */
            var headers = {
                'access-token': this.tokenService.currentAuthData.accessToken,
                'client': this.tokenService.currentAuthData.client,
                'expiry': this.tokenService.currentAuthData.expiry,
                'token-type': this.tokenService.currentAuthData.tokenType,
                'uid': this.tokenService.currentAuthData.uid,
                'provider': this.tokenService.currentAuthData.provider
            };
            // Custom headers passed in for each request
            /** @type {?} */
            var globalOptions = this.tokenService.globalOptions;
            if (globalOptions && globalOptions.headers) {
                for (var key in globalOptions.headers) {
                    headers[key] = globalOptions.headers[key];
                }
            }
            req = req.clone({
                setHeaders: headers
            });
        }
        return next.handle(req).pipe(tap(function (res) { return _this.handleResponse(res); }, function (err) { return _this.handleResponse(err); }));
    };
    // Parse Auth data from response
    // Parse Auth data from response
    /**
     * @param {?} res
     * @return {?}
     */
    AngularTokenInterceptor.prototype.handleResponse = 
    // Parse Auth data from response
    /**
     * @param {?} res
     * @return {?}
     */
    function (res) {
        if (res instanceof HttpResponse || res instanceof HttpErrorResponse) {
            if (this.tokenService.apiBase === null || (res.url && res.url.match(this.tokenService.apiBase))) {
                this.tokenService.getAuthHeadersFromResponse((/** @type {?} */ (res)));
            }
        }
    };
    AngularTokenInterceptor.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AngularTokenInterceptor.ctorParameters = function () { return [
        { type: AngularTokenService }
    ]; };
    return AngularTokenInterceptor;
}());
export { AngularTokenInterceptor };
if (false) {
    /** @type {?} */
    AngularTokenInterceptor.prototype.atOptions;
    /** @type {?} */
    AngularTokenInterceptor.prototype.tokenService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItdG9rZW4vIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQztJQUlFLGlDQUFxQixZQUFpQztRQUFqQyxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7SUFDdEQsQ0FBQzs7Ozs7O0lBRUQsMkNBQVM7Ozs7O0lBQVQsVUFBVSxHQUFxQixFQUFFLElBQWlCO1FBQWxELGlCQWtDQztRQWhDQyxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRTNDLG1FQUFtRTtRQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTs7Z0JBRW5ILE9BQU8sR0FBRztnQkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsV0FBVztnQkFDN0QsUUFBUSxFQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQU07Z0JBQ3hELFFBQVEsRUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2dCQUN4RCxZQUFZLEVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBUztnQkFDM0QsS0FBSyxFQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQUc7Z0JBQ3JELFVBQVUsRUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRO2FBQzNEOzs7Z0JBR0ssYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYTtZQUNyRCxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO2dCQUMxQyxLQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7b0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBRUQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsVUFBVSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDNUIsVUFBQSxHQUFHLElBQUksT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUF4QixDQUF3QixFQUMvQixVQUFBLEdBQUcsSUFBSSxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQXhCLENBQXdCLENBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRCxnQ0FBZ0M7Ozs7OztJQUN4QixnREFBYzs7Ozs7O0lBQXRCLFVBQXVCLEdBQVE7UUFDN0IsSUFBSSxHQUFHLFlBQVksWUFBWSxJQUFJLEdBQUcsWUFBWSxpQkFBaUIsRUFBRTtZQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO2dCQUMvRixJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLG1CQUFLLEdBQUcsRUFBQSxDQUFDLENBQUM7YUFDeEQ7U0FDRjtJQUNILENBQUM7O2dCQW5ERixVQUFVOzs7O2dCQUxGLG1CQUFtQjs7SUF5RDVCLDhCQUFDO0NBQUEsQUFwREQsSUFvREM7U0FuRFksdUJBQXVCOzs7SUFDbEMsNENBQXVDOztJQUUxQiwrQ0FBeUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwRXZlbnQsIEh0dHBSZXF1ZXN0LCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBIYW5kbGVyLCBIdHRwUmVzcG9uc2UsIEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5PcHRpb25zIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlblNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgcHJpdmF0ZSBhdE9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoIHByaXZhdGUgdG9rZW5TZXJ2aWNlOiBBbmd1bGFyVG9rZW5TZXJ2aWNlICkge1xuICB9XG5cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG5cbiAgICAvLyBHZXQgYXV0aCBkYXRhIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgIHRoaXMudG9rZW5TZXJ2aWNlLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIC8vIEFkZCB0aGUgaGVhZGVycyBpZiB0aGUgcmVxdWVzdCBpcyBnb2luZyB0byB0aGUgY29uZmlndXJlZCBzZXJ2ZXJcbiAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhICYmICh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlID09PSBudWxsIHx8IHJlcS51cmwubWF0Y2godGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSkpKSB7XG5cbiAgICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAgICdhY2Nlc3MtdG9rZW4nOiB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuYWNjZXNzVG9rZW4sXG4gICAgICAgICdjbGllbnQnOiAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuY2xpZW50LFxuICAgICAgICAnZXhwaXJ5JzogICAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLmV4cGlyeSxcbiAgICAgICAgJ3Rva2VuLXR5cGUnOiAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS50b2tlblR5cGUsXG4gICAgICAgICd1aWQnOiAgICAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEudWlkLFxuICAgICAgICAncHJvdmlkZXInOiAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnByb3ZpZGVyXG4gICAgICB9O1xuXG4gICAgICAvLyBDdXN0b20gaGVhZGVycyBwYXNzZWQgaW4gZm9yIGVhY2ggcmVxdWVzdFxuICAgICAgY29uc3QgZ2xvYmFsT3B0aW9ucyA9IHRoaXMudG9rZW5TZXJ2aWNlLmdsb2JhbE9wdGlvbnM7XG4gICAgICBpZiAoZ2xvYmFsT3B0aW9ucyAmJiBnbG9iYWxPcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGdsb2JhbE9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgIGhlYWRlcnNba2V5XSA9IGdsb2JhbE9wdGlvbnMuaGVhZGVyc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlcSA9IHJlcS5jbG9uZSh7XG4gICAgICAgIHNldEhlYWRlcnM6IGhlYWRlcnNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpLnBpcGUodGFwKFxuICAgICAgICByZXMgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShyZXMpLFxuICAgICAgICBlcnIgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShlcnIpXG4gICAgKSk7XG4gIH1cblxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHByaXZhdGUgaGFuZGxlUmVzcG9uc2UocmVzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAocmVzIGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlIHx8IHJlcyBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlKSB7XG4gICAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSA9PT0gbnVsbCB8fCAocmVzLnVybCAmJiByZXMudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UpKSkge1xuICAgICAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZSg8YW55PnJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=