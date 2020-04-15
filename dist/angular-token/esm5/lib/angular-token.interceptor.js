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
        console.log(req);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItdG9rZW4vIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQztJQUlFLGlDQUFxQixZQUFpQztRQUFqQyxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7SUFDdEQsQ0FBQzs7Ozs7O0lBRUQsMkNBQVM7Ozs7O0lBQVQsVUFBVSxHQUFxQixFQUFFLElBQWlCO1FBQWxELGlCQW9DQztRQWxDQyxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRTNDLG1FQUFtRTtRQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTs7Z0JBRW5ILE9BQU8sR0FBRztnQkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsV0FBVztnQkFDN0QsUUFBUSxFQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQU07Z0JBQ3hELFFBQVEsRUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2dCQUN4RCxZQUFZLEVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBUztnQkFDM0QsS0FBSyxFQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQUc7Z0JBQ3JELFVBQVUsRUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRO2FBQzNEOzs7Z0JBR0ssYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYTtZQUNyRCxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO2dCQUMxQyxLQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7b0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBRUQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsVUFBVSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUM1QixVQUFBLEdBQUcsSUFBSSxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQXhCLENBQXdCLEVBQy9CLFVBQUEsR0FBRyxJQUFJLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBeEIsQ0FBd0IsQ0FDbEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdELGdDQUFnQzs7Ozs7O0lBQ3hCLGdEQUFjOzs7Ozs7SUFBdEIsVUFBdUIsR0FBUTtRQUM3QixJQUFJLEdBQUcsWUFBWSxZQUFZLElBQUksR0FBRyxZQUFZLGlCQUFpQixFQUFFO1lBQ25FLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Z0JBQy9GLElBQUksQ0FBQyxZQUFZLENBQUMsMEJBQTBCLENBQUMsbUJBQUssR0FBRyxFQUFBLENBQUMsQ0FBQzthQUN4RDtTQUNGO0lBQ0gsQ0FBQzs7Z0JBckRGLFVBQVU7Ozs7Z0JBTEYsbUJBQW1COztJQTJENUIsOEJBQUM7Q0FBQSxBQXRERCxJQXNEQztTQXJEWSx1QkFBdUI7OztJQUNsQyw0Q0FBdUM7O0lBRTFCLCtDQUF5QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBFdmVudCwgSHR0cFJlcXVlc3QsIEh0dHBJbnRlcmNlcHRvciwgSHR0cEhhbmRsZXIsIEh0dHBSZXNwb25zZSwgSHR0cEVycm9yUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFuZ3VsYXJUb2tlbk9wdGlvbnMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuaW1wb3J0IHsgQW5ndWxhclRva2VuU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBwcml2YXRlIGF0T3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvciggcHJpdmF0ZSB0b2tlblNlcnZpY2U6IEFuZ3VsYXJUb2tlblNlcnZpY2UgKSB7XG4gIH1cblxuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcblxuICAgIC8vIEdldCBhdXRoIGRhdGEgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpO1xuXG4gICAgLy8gQWRkIHRoZSBoZWFkZXJzIGlmIHRoZSByZXF1ZXN0IGlzIGdvaW5nIHRvIHRoZSBjb25maWd1cmVkIHNlcnZlclxuICAgIGlmICh0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEgJiYgKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UgPT09IG51bGwgfHwgcmVxLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlKSkpIHtcblxuICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgJ2FjY2Vzcy10b2tlbic6IHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5hY2Nlc3NUb2tlbixcbiAgICAgICAgJ2NsaWVudCc6ICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5jbGllbnQsXG4gICAgICAgICdleHBpcnknOiAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuZXhwaXJ5LFxuICAgICAgICAndG9rZW4tdHlwZSc6ICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnRva2VuVHlwZSxcbiAgICAgICAgJ3VpZCc6ICAgICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS51aWQsXG4gICAgICAgICdwcm92aWRlcic6ICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEucHJvdmlkZXJcbiAgICAgIH07XG5cbiAgICAgIC8vIEN1c3RvbSBoZWFkZXJzIHBhc3NlZCBpbiBmb3IgZWFjaCByZXF1ZXN0XG4gICAgICBjb25zdCBnbG9iYWxPcHRpb25zID0gdGhpcy50b2tlblNlcnZpY2UuZ2xvYmFsT3B0aW9ucztcbiAgICAgIGlmIChnbG9iYWxPcHRpb25zICYmIGdsb2JhbE9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZ2xvYmFsT3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgICAgaGVhZGVyc1trZXldID0gZ2xvYmFsT3B0aW9ucy5oZWFkZXJzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVxID0gcmVxLmNsb25lKHtcbiAgICAgICAgc2V0SGVhZGVyczogaGVhZGVyc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2cocmVxKTtcblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpLnBpcGUodGFwKFxuICAgICAgICByZXMgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShyZXMpLFxuICAgICAgICBlcnIgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShlcnIpXG4gICAgKSk7XG4gIH1cblxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHByaXZhdGUgaGFuZGxlUmVzcG9uc2UocmVzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAocmVzIGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlIHx8IHJlcyBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlKSB7XG4gICAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSA9PT0gbnVsbCB8fCAocmVzLnVybCAmJiByZXMudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UpKSkge1xuICAgICAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZSg8YW55PnJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=