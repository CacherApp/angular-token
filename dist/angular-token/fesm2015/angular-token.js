import { InjectionToken, Injectable, Optional, Inject, PLATFORM_ID, NgModule, SkipSelf, defineInjectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { fromEvent, interval } from 'rxjs';
import { pluck, filter, share, finalize, tap } from 'rxjs/operators';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/** @type {?} */
const ANGULAR_TOKEN_OPTIONS = new InjectionToken('ANGULAR_TOKEN_OPTIONS');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
class AngularTokenService {
    /**
     * @param {?} http
     * @param {?} config
     * @param {?} platformId
     * @param {?} activatedRoute
     * @param {?} router
     */
    constructor(http, config, platformId, activatedRoute, router) {
        this.http = http;
        this.platformId = platformId;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.localStorage = {};
        this.global = (typeof window !== 'undefined') ? window : {};
        if (isPlatformServer(platformId)) {
            this.global = {
                open: () => null,
                location: {
                    href: '/',
                    origin: '/'
                }
            };
            this.localStorage.setItem = () => null;
            this.localStorage.getItem = () => null;
            this.localStorage.removeItem = () => null;
        }
        else {
            this.localStorage = localStorage;
        }
        /** @type {?} */
        const defaultOptions = {
            apiPath: null,
            apiBase: null,
            signInPath: 'auth/sign_in',
            signInRedirect: null,
            signInStoredUrlStorageKey: null,
            signOutPath: 'auth/sign_out',
            validateTokenPath: 'auth/validate_token',
            signOutFailedValidate: false,
            registerAccountPath: 'auth',
            deleteAccountPath: 'auth',
            registerAccountCallback: this.global.location.href,
            updatePasswordPath: 'auth',
            resetPasswordPath: 'auth/password',
            resetPasswordCallback: this.global.location.href,
            userTypes: null,
            loginField: 'email',
            oAuthBase: this.global.location.origin,
            oAuthPaths: {
                github: 'auth/github'
            },
            oAuthCallbackPath: 'oauth_callback',
            oAuthWindowType: 'newWindow',
            oAuthWindowOptions: null,
        };
        /** @type {?} */
        const mergedOptions = ((/** @type {?} */ (Object))).assign(defaultOptions, config);
        this.options = mergedOptions;
        if (this.options.apiBase === null) {
            console.warn(`[angular-token] You have not configured 'apiBase', which may result in security issues. ` +
                `Please refer to the documentation at https://github.com/neroniaky/angular-token/wiki`);
        }
        this.tryLoadAuthData();
    }
    /**
     * @return {?}
     */
    get currentUserType() {
        if (this.userType != null) {
            return this.userType.name;
        }
        else {
            return undefined;
        }
    }
    /**
     * @return {?}
     */
    get currentUserData() {
        return this.userData;
    }
    /**
     * @return {?}
     */
    get currentAuthData() {
        return this.authData;
    }
    /**
     * @return {?}
     */
    get apiBase() {
        return this.options.apiBase;
    }
    /**
     * @return {?}
     */
    userSignedIn() {
        return !!this.authData;
    }
    /**
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    canActivate(route, state) {
        if (this.userSignedIn()) {
            return true;
        }
        else {
            // Store current location in storage (usefull for redirection after signing in)
            if (this.options.signInStoredUrlStorageKey) {
                this.localStorage.setItem(this.options.signInStoredUrlStorageKey, state.url);
            }
            // Redirect user to sign in if signInRedirect is set
            if (this.router && this.options.signInRedirect) {
                this.router.navigate([this.options.signInRedirect]);
            }
            return false;
        }
    }
    /**
     *
     * Actions
     *
     * @param {?} registerData
     * @return {?}
     */
    // Register request
    registerAccount(registerData) {
        registerData = Object.assign({}, registerData);
        if (registerData.userType == null) {
            this.userType = null;
        }
        else {
            this.userType = this.getUserTypeByName(registerData.userType);
            delete registerData.userType;
        }
        if (registerData.password_confirmation == null &&
            registerData.passwordConfirmation != null) {
            registerData.password_confirmation = registerData.passwordConfirmation;
            delete registerData.passwordConfirmation;
        }
        /** @type {?} */
        const login = registerData.login;
        delete registerData.login;
        registerData[this.options.loginField] = login;
        registerData.confirm_success_url = this.options.registerAccountCallback;
        return this.http.post(this.getServerPath() + this.options.registerAccountPath, registerData);
    }
    // Delete Account
    /**
     * @return {?}
     */
    deleteAccount() {
        return this.http.delete(this.getServerPath() + this.options.deleteAccountPath);
    }
    // Sign in request and set storage
    /**
     * @param {?} signInData
     * @return {?}
     */
    signIn(signInData) {
        this.userType = (signInData.userType == null) ? null : this.getUserTypeByName(signInData.userType);
        /** @type {?} */
        const body = {
            [this.options.loginField]: signInData.login,
            password: signInData.password
        };
        /** @type {?} */
        const observ = this.http.post(this.getServerPath() + this.options.signInPath, body, { observe: 'response' }).pipe(share());
        observ.subscribe(res => this.userData = res.body['data']);
        return observ;
    }
    /**
     * @param {?} oAuthType
     * @param {?=} params
     * @return {?}
     */
    signInOAuth(oAuthType, params) {
        /** @type {?} */
        const oAuthPath = this.getOAuthPath(oAuthType);
        /** @type {?} */
        const callbackUrl = `${this.global.location.origin}/${this.options.oAuthCallbackPath}`;
        /** @type {?} */
        const oAuthWindowType = this.options.oAuthWindowType;
        /** @type {?} */
        const authUrl = this.getOAuthUrl(oAuthPath, callbackUrl, oAuthWindowType, params);
        if (oAuthWindowType === 'newWindow') {
            /** @type {?} */
            const oAuthWindowOptions = this.options.oAuthWindowOptions;
            /** @type {?} */
            let windowOptions = '';
            if (oAuthWindowOptions) {
                for (const key in oAuthWindowOptions) {
                    if (oAuthWindowOptions.hasOwnProperty(key)) {
                        windowOptions += `,${key}=${oAuthWindowOptions[key]}`;
                    }
                }
            }
            /** @type {?} */
            const popup = window.open(authUrl, '_blank', `closebuttoncaption=Cancel${windowOptions}`);
            return this.requestCredentialsViaPostMessage(popup);
        }
        else if (oAuthWindowType === 'sameWindow') {
            this.global.location.href = authUrl;
        }
        else {
            throw new Error(`Unsupported oAuthWindowType "${oAuthWindowType}"`);
        }
    }
    /**
     * @return {?}
     */
    processOAuthCallback() {
        this.getAuthDataFromParams();
    }
    // Sign out request and delete storage
    /**
     * @return {?}
     */
    signOut() {
        /** @type {?} */
        const observ = this.http.delete(this.getServerPath() + this.options.signOutPath)
            // Only remove the localStorage and clear the data after the call
            .pipe(finalize(() => {
            this.localStorage.removeItem('accessToken');
            this.localStorage.removeItem('client');
            this.localStorage.removeItem('expiry');
            this.localStorage.removeItem('tokenType');
            this.localStorage.removeItem('uid');
            this.authData = null;
            this.userType = null;
            this.userData = null;
        }));
        return observ;
    }
    // Validate token request
    /**
     * @return {?}
     */
    validateToken() {
        /** @type {?} */
        const observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(share());
        observ.subscribe((res) => this.userData = res['data'], (error) => {
            if (error.status === 401 && this.options.signOutFailedValidate) {
                this.signOut();
            }
        });
        return observ;
    }
    // Update password request
    /**
     * @param {?} updatePasswordData
     * @return {?}
     */
    updatePassword(updatePasswordData) {
        if (updatePasswordData.userType != null) {
            this.userType = this.getUserTypeByName(updatePasswordData.userType);
        }
        /** @type {?} */
        let args;
        if (updatePasswordData.passwordCurrent == null) {
            args = {
                password: updatePasswordData.password,
                password_confirmation: updatePasswordData.passwordConfirmation
            };
        }
        else {
            args = {
                current_password: updatePasswordData.passwordCurrent,
                password: updatePasswordData.password,
                password_confirmation: updatePasswordData.passwordConfirmation
            };
        }
        if (updatePasswordData.resetPasswordToken) {
            args.reset_password_token = updatePasswordData.resetPasswordToken;
        }
        /** @type {?} */
        const body = args;
        return this.http.put(this.getServerPath() + this.options.updatePasswordPath, body);
    }
    // Reset password request
    /**
     * @param {?} resetPasswordData
     * @return {?}
     */
    resetPassword(resetPasswordData) {
        this.userType = (resetPasswordData.userType == null) ? null : this.getUserTypeByName(resetPasswordData.userType);
        /** @type {?} */
        const body = {
            [this.options.loginField]: resetPasswordData.login,
            redirect_url: this.options.resetPasswordCallback
        };
        return this.http.post(this.getServerPath() + this.options.resetPasswordPath, body);
    }
    /**
     *
     * Construct Paths / Urls
     *
     * @return {?}
     */
    getUserPath() {
        return (this.userType == null) ? '' : this.userType.path + '/';
    }
    /**
     * @return {?}
     */
    getApiPath() {
        /** @type {?} */
        let constructedPath = '';
        if (this.options.apiBase != null) {
            constructedPath += this.options.apiBase + '/';
        }
        if (this.options.apiPath != null) {
            constructedPath += this.options.apiPath + '/';
        }
        return constructedPath;
    }
    /**
     * @return {?}
     */
    getServerPath() {
        return this.getApiPath() + this.getUserPath();
    }
    /**
     * @param {?} oAuthType
     * @return {?}
     */
    getOAuthPath(oAuthType) {
        /** @type {?} */
        let oAuthPath;
        oAuthPath = this.options.oAuthPaths[oAuthType];
        if (oAuthPath == null) {
            oAuthPath = `/auth/${oAuthType}`;
        }
        return oAuthPath;
    }
    /**
     * @param {?} oAuthPath
     * @param {?} callbackUrl
     * @param {?} windowType
     * @param {?=} params
     * @return {?}
     */
    getOAuthUrl(oAuthPath, callbackUrl, windowType, params) {
        /** @type {?} */
        let url;
        url = `${this.options.oAuthBase}/${oAuthPath}`;
        url += `?omniauth_window_type=${windowType}`;
        url += `&auth_origin_url=${encodeURIComponent(callbackUrl)}`;
        if (this.userType != null) {
            url += `&resource_class=${this.userType.name}`;
        }
        if (params) {
            for (let key in params) {
                url += `&${key}=${encodeURIComponent(params[key])}`;
            }
        }
        return url;
    }
    /**
     *
     * Get Auth Data
     *
     * @return {?}
     */
    // Try to load auth data
    tryLoadAuthData() {
        /** @type {?} */
        const userType = this.getUserTypeByName(this.localStorage.getItem('userType'));
        if (userType) {
            this.userType = userType;
        }
        this.getAuthDataFromStorage();
        if (this.activatedRoute) {
            this.getAuthDataFromParams();
        }
        // if (this.authData) {
        //     this.validateToken();
        // }
    }
    // Parse Auth data from response
    /**
     * @param {?} data
     * @return {?}
     */
    getAuthHeadersFromResponse(data) {
        /** @type {?} */
        const headers = data.headers;
        /** @type {?} */
        const authData = {
            accessToken: headers.get('access-token'),
            client: headers.get('client'),
            expiry: headers.get('expiry'),
            tokenType: headers.get('token-type'),
            uid: headers.get('uid')
        };
        this.setAuthData(authData);
    }
    // Parse Auth data from post message
    /**
     * @param {?} data
     * @return {?}
     */
    getAuthDataFromPostMessage(data) {
        /** @type {?} */
        const authData = {
            accessToken: data['auth_token'],
            client: data['client_id'],
            expiry: data['expiry'],
            tokenType: 'Bearer',
            uid: data['uid']
        };
        this.setAuthData(authData);
    }
    // Try to get auth data from storage.
    /**
     * @return {?}
     */
    getAuthDataFromStorage() {
        /** @type {?} */
        const authData = {
            accessToken: this.localStorage.getItem('accessToken'),
            client: this.localStorage.getItem('client'),
            expiry: this.localStorage.getItem('expiry'),
            tokenType: this.localStorage.getItem('tokenType'),
            uid: this.localStorage.getItem('uid')
        };
        if (this.checkAuthData(authData)) {
            this.authData = authData;
        }
    }
    // Try to get auth data from url parameters.
    /**
     * @return {?}
     */
    getAuthDataFromParams() {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            /** @type {?} */
            const authData = {
                accessToken: queryParams['token'] || queryParams['auth_token'],
                client: queryParams['client_id'],
                expiry: queryParams['expiry'],
                tokenType: 'Bearer',
                uid: queryParams['uid']
            };
            if (this.checkAuthData(authData)) {
                this.authData = authData;
            }
        });
    }
    /**
     *
     * Set Auth Data
     *
     * @param {?} authData
     * @return {?}
     */
    // Write auth data to storage
    setAuthData(authData) {
        if (this.checkAuthData(authData)) {
            this.authData = authData;
            this.localStorage.setItem('accessToken', authData.accessToken);
            this.localStorage.setItem('client', authData.client);
            this.localStorage.setItem('expiry', authData.expiry);
            this.localStorage.setItem('tokenType', authData.tokenType);
            this.localStorage.setItem('uid', authData.uid);
            if (this.userType != null) {
                this.localStorage.setItem('userType', this.userType.name);
            }
        }
    }
    /**
     *
     * Validate Auth Data
     *
     * @param {?} authData
     * @return {?}
     */
    // Check if auth data complete and if response token is newer
    checkAuthData(authData) {
        if (authData.accessToken != null &&
            authData.client != null &&
            authData.expiry != null &&
            authData.tokenType != null &&
            authData.uid != null) {
            if (this.authData != null) {
                return authData.expiry >= this.authData.expiry;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    /**
     *
     * OAuth
     *
     * @param {?} authWindow
     * @return {?}
     */
    requestCredentialsViaPostMessage(authWindow) {
        /** @type {?} */
        const pollerObserv = interval(500);
        /** @type {?} */
        const responseObserv = fromEvent(this.global, 'message').pipe(pluck('data'), filter(this.oAuthWindowResponseFilter));
        /** @type {?} */
        const responseSubscription = responseObserv.subscribe(this.getAuthDataFromPostMessage.bind(this));
        /** @type {?} */
        const pollerSubscription = pollerObserv.subscribe(() => {
            if (authWindow.closed) {
                pollerSubscription.unsubscribe();
            }
            else {
                authWindow.postMessage('requestCredentials', '*');
            }
        });
        return responseObserv;
    }
    /**
     * @param {?} data
     * @return {?}
     */
    oAuthWindowResponseFilter(data) {
        if (data.message === 'deliverCredentials'
            || data.message === 'authFailure'
            || data.message === 'deliverProviderAuth') {
            return data;
        }
    }
    /**
     *
     * Utilities
     *
     * @param {?} name
     * @return {?}
     */
    // Match user config by user config name
    getUserTypeByName(name) {
        if (name == null || this.options.userTypes == null) {
            return null;
        }
        return this.options.userTypes.find(userType => userType.name === name);
    }
}
AngularTokenService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
/** @nocollapse */
AngularTokenService.ctorParameters = () => [
    { type: HttpClient },
    { type: undefined, decorators: [{ type: Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: ActivatedRoute, decorators: [{ type: Optional }] },
    { type: Router, decorators: [{ type: Optional }] }
];
/** @nocollapse */ AngularTokenService.ngInjectableDef = defineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(inject(HttpClient), inject(ANGULAR_TOKEN_OPTIONS), inject(PLATFORM_ID), inject(ActivatedRoute, 8), inject(Router, 8)); }, token: AngularTokenService, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
class AngularTokenInterceptor {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
class AngularTokenModule {
    /**
     * @param {?} parentModule
     */
    constructor(parentModule) {
        if (parentModule) {
            throw new Error('AngularToken is already loaded. It should only be imported in your application\'s main module.');
        }
    }
    /**
     * @param {?} options
     * @return {?}
     */
    static forRoot(options) {
        return {
            ngModule: AngularTokenModule,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AngularTokenInterceptor,
                    multi: true
                },
                options.angularTokenOptionsProvider ||
                    {
                        provide: ANGULAR_TOKEN_OPTIONS,
                        useValue: options
                    },
                AngularTokenService
            ]
        };
    }
}
AngularTokenModule.decorators = [
    { type: NgModule }
];
/** @nocollapse */
AngularTokenModule.ctorParameters = () => [
    { type: AngularTokenModule, decorators: [{ type: Optional }, { type: SkipSelf }] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

export { ANGULAR_TOKEN_OPTIONS, AngularTokenService, AngularTokenModule, AngularTokenInterceptor as ɵb, AngularTokenService as ɵa };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi50b2tlbi50cyIsIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi5zZXJ2aWNlLnRzIiwibmc6Ly9hbmd1bGFyLXRva2VuL2xpYi9hbmd1bGFyLXRva2VuLmludGVyY2VwdG9yLnRzIiwibmc6Ly9hbmd1bGFyLXRva2VuL2xpYi9hbmd1bGFyLXRva2VuLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY29uc3QgQU5HVUxBUl9UT0tFTl9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuKCdBTkdVTEFSX1RPS0VOX09QVElPTlMnKTtcbiIsImltcG9ydCB7IEluamVjdGFibGUsIE9wdGlvbmFsLCBJbmplY3QsIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyLCBDYW5BY3RpdmF0ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb21FdmVudCwgaW50ZXJ2YWwgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHBsdWNrLCBmaWx0ZXIsIHNoYXJlLCBmaW5hbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgQU5HVUxBUl9UT0tFTl9PUFRJT05TIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLnRva2VuJztcblxuaW1wb3J0IHtcbiAgU2lnbkluRGF0YSxcbiAgUmVnaXN0ZXJEYXRhLFxuICBVcGRhdGVQYXNzd29yZERhdGEsXG4gIFJlc2V0UGFzc3dvcmREYXRhLFxuXG4gIFVzZXJUeXBlLFxuICBVc2VyRGF0YSxcbiAgQXV0aERhdGEsXG5cbiAgQW5ndWxhclRva2VuT3B0aW9uc1xufSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuU2VydmljZSBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcblxuICBnZXQgY3VycmVudFVzZXJUeXBlKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlclR5cGUubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFVzZXJEYXRhKCk6IFVzZXJEYXRhIHtcbiAgICByZXR1cm4gdGhpcy51c2VyRGF0YTtcbiAgfVxuXG4gIGdldCBjdXJyZW50QXV0aERhdGEoKTogQXV0aERhdGEge1xuICAgIHJldHVybiB0aGlzLmF1dGhEYXRhO1xuICB9XG5cbiAgZ2V0IGFwaUJhc2UoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFwaUJhc2U7XG4gIH1cblxuICBwcml2YXRlIG9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnM7XG4gIHByaXZhdGUgdXNlclR5cGU6IFVzZXJUeXBlO1xuICBwcml2YXRlIGF1dGhEYXRhOiBBdXRoRGF0YTtcbiAgcHJpdmF0ZSB1c2VyRGF0YTogVXNlckRhdGE7XG4gIHByaXZhdGUgZ2xvYmFsOiBXaW5kb3cgfCBhbnk7XG5cbiAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2U6IFN0b3JhZ2UgfCBhbnkgPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgQEluamVjdChBTkdVTEFSX1RPS0VOX09QVElPTlMpIGNvbmZpZzogYW55LFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcGxhdGZvcm1JZDogT2JqZWN0LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgKSB7XG4gICAgdGhpcy5nbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG5cbiAgICBpZiAoaXNQbGF0Zm9ybVNlcnZlcihwbGF0Zm9ybUlkKSkge1xuICAgICAgdGhpcy5nbG9iYWwgPSB7XG4gICAgICAgIG9wZW46ICgpID0+IG51bGwsXG4gICAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgICAgaHJlZjogJy8nLFxuICAgICAgICAgIG9yaWdpbjogJy8nXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0gPSAoKSA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSA9ICgpID0+IG51bGw7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtID0gKCkgPT4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnMgPSB7XG4gICAgICBhcGlQYXRoOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGFwaUJhc2U6ICAgICAgICAgICAgICAgICAgICBudWxsLFxuXG4gICAgICBzaWduSW5QYXRoOiAgICAgICAgICAgICAgICAgJ2F1dGgvc2lnbl9pbicsXG4gICAgICBzaWduSW5SZWRpcmVjdDogICAgICAgICAgICAgbnVsbCxcbiAgICAgIHNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXk6ICBudWxsLFxuXG4gICAgICBzaWduT3V0UGF0aDogICAgICAgICAgICAgICAgJ2F1dGgvc2lnbl9vdXQnLFxuICAgICAgdmFsaWRhdGVUb2tlblBhdGg6ICAgICAgICAgICdhdXRoL3ZhbGlkYXRlX3Rva2VuJyxcbiAgICAgIHNpZ25PdXRGYWlsZWRWYWxpZGF0ZTogICAgICBmYWxzZSxcblxuICAgICAgcmVnaXN0ZXJBY2NvdW50UGF0aDogICAgICAgICdhdXRoJyxcbiAgICAgIGRlbGV0ZUFjY291bnRQYXRoOiAgICAgICAgICAnYXV0aCcsXG4gICAgICByZWdpc3RlckFjY291bnRDYWxsYmFjazogICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXBkYXRlUGFzc3dvcmRQYXRoOiAgICAgICAgICdhdXRoJyxcblxuICAgICAgcmVzZXRQYXNzd29yZFBhdGg6ICAgICAgICAgICdhdXRoL3Bhc3N3b3JkJyxcbiAgICAgIHJlc2V0UGFzc3dvcmRDYWxsYmFjazogICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmLFxuXG4gICAgICB1c2VyVHlwZXM6ICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGxvZ2luRmllbGQ6ICAgICAgICAgICAgICAgICAnZW1haWwnLFxuXG4gICAgICBvQXV0aEJhc2U6ICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24ub3JpZ2luLFxuICAgICAgb0F1dGhQYXRoczoge1xuICAgICAgICBnaXRodWI6ICAgICAgICAgICAgICAgICAgICdhdXRoL2dpdGh1YidcbiAgICAgIH0sXG4gICAgICBvQXV0aENhbGxiYWNrUGF0aDogICAgICAgICAgJ29hdXRoX2NhbGxiYWNrJyxcbiAgICAgIG9BdXRoV2luZG93VHlwZTogICAgICAgICAgICAnbmV3V2luZG93JyxcbiAgICAgIG9BdXRoV2luZG93T3B0aW9uczogICAgICAgICBudWxsLFxuICAgIH07XG5cbiAgICBjb25zdCBtZXJnZWRPcHRpb25zID0gKDxhbnk+T2JqZWN0KS5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIGNvbmZpZyk7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VkT3B0aW9ucztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS53YXJuKGBbYW5ndWxhci10b2tlbl0gWW91IGhhdmUgbm90IGNvbmZpZ3VyZWQgJ2FwaUJhc2UnLCB3aGljaCBtYXkgcmVzdWx0IGluIHNlY3VyaXR5IGlzc3Vlcy4gYCArXG4gICAgICAgICAgICAgICAgICAgYFBsZWFzZSByZWZlciB0byB0aGUgZG9jdW1lbnRhdGlvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vbmVyb25pYWt5L2FuZ3VsYXItdG9rZW4vd2lraWApO1xuICAgIH1cblxuICAgIHRoaXMudHJ5TG9hZEF1dGhEYXRhKCk7XG4gIH1cblxuICB1c2VyU2lnbmVkSW4oKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gISF0aGlzLmF1dGhEYXRhO1xuICB9XG5cbiAgY2FuQWN0aXZhdGUocm91dGUsIHN0YXRlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudXNlclNpZ25lZEluKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdG9yZSBjdXJyZW50IGxvY2F0aW9uIGluIHN0b3JhZ2UgKHVzZWZ1bGwgZm9yIHJlZGlyZWN0aW9uIGFmdGVyIHNpZ25pbmcgaW4pXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSxcbiAgICAgICAgICBzdGF0ZS51cmxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdXNlciB0byBzaWduIGluIGlmIHNpZ25JblJlZGlyZWN0IGlzIHNldFxuICAgICAgaWYgKHRoaXMucm91dGVyICYmIHRoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBBY3Rpb25zXG4gICAqXG4gICAqL1xuXG4gIC8vIFJlZ2lzdGVyIHJlcXVlc3RcbiAgcmVnaXN0ZXJBY2NvdW50KHJlZ2lzdGVyRGF0YTogUmVnaXN0ZXJEYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHJlZ2lzdGVyRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHJlZ2lzdGVyRGF0YSk7XG5cbiAgICBpZiAocmVnaXN0ZXJEYXRhLnVzZXJUeXBlID09IG51bGwpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZWdpc3RlckRhdGEudXNlclR5cGUpO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS51c2VyVHlwZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID09IG51bGwgJiZcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbiAhPSBudWxsXG4gICAgKSB7XG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID0gcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dpbiA9IHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIHJlZ2lzdGVyRGF0YVt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF0gPSBsb2dpbjtcblxuICAgIHJlZ2lzdGVyRGF0YS5jb25maXJtX3N1Y2Nlc3NfdXJsID0gdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudENhbGxiYWNrO1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudFBhdGgsIHJlZ2lzdGVyRGF0YSk7XG4gIH1cblxuICAvLyBEZWxldGUgQWNjb3VudFxuICBkZWxldGVBY2NvdW50KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuZGVsZXRlQWNjb3VudFBhdGgpO1xuICB9XG5cbiAgLy8gU2lnbiBpbiByZXF1ZXN0IGFuZCBzZXQgc3RvcmFnZVxuICBzaWduSW4oc2lnbkluRGF0YTogU2lnbkluRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgdGhpcy51c2VyVHlwZSA9IChzaWduSW5EYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUoc2lnbkluRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogc2lnbkluRGF0YS5sb2dpbixcbiAgICAgIHBhc3N3b3JkOiBzaWduSW5EYXRhLnBhc3N3b3JkXG4gICAgfTtcblxuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25JblBhdGgsIGJvZHksIHsgb2JzZXJ2ZTogJ3Jlc3BvbnNlJyB9KS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShyZXMgPT4gdGhpcy51c2VyRGF0YSA9IHJlcy5ib2R5WydkYXRhJ10pO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIHNpZ25Jbk9BdXRoKG9BdXRoVHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwYXJhbXM/OiB7IFtrZXk6c3RyaW5nXTogc3RyaW5nOyB9KSB7XG5cbiAgICBjb25zdCBvQXV0aFBhdGg6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhQYXRoKG9BdXRoVHlwZSk7XG4gICAgY29uc3QgY2FsbGJhY2tVcmwgPSBgJHt0aGlzLmdsb2JhbC5sb2NhdGlvbi5vcmlnaW59LyR7dGhpcy5vcHRpb25zLm9BdXRoQ2FsbGJhY2tQYXRofWA7XG4gICAgY29uc3Qgb0F1dGhXaW5kb3dUeXBlOiBzdHJpbmcgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dUeXBlO1xuICAgIGNvbnN0IGF1dGhVcmw6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhVcmwoXG4gICAgICBvQXV0aFBhdGgsXG4gICAgICBjYWxsYmFja1VybCxcbiAgICAgIG9BdXRoV2luZG93VHlwZSxcbiAgICAgIHBhcmFtc1xuICAgICk7XG5cbiAgICBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnbmV3V2luZG93Jykge1xuICAgICAgY29uc3Qgb0F1dGhXaW5kb3dPcHRpb25zID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93T3B0aW9ucztcbiAgICAgIGxldCB3aW5kb3dPcHRpb25zID0gJyc7XG5cbiAgICAgIGlmIChvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIHdpbmRvd09wdGlvbnMgKz0gYCwke2tleX09JHtvQXV0aFdpbmRvd09wdGlvbnNba2V5XX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwb3B1cCA9IHdpbmRvdy5vcGVuKFxuICAgICAgICAgIGF1dGhVcmwsXG4gICAgICAgICAgJ19ibGFuaycsXG4gICAgICAgICAgYGNsb3NlYnV0dG9uY2FwdGlvbj1DYW5jZWwke3dpbmRvd09wdGlvbnN9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3RDcmVkZW50aWFsc1ZpYVBvc3RNZXNzYWdlKHBvcHVwKTtcbiAgICB9IGVsc2UgaWYgKG9BdXRoV2luZG93VHlwZSA9PT0gJ3NhbWVXaW5kb3cnKSB7XG4gICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmID0gYXV0aFVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvQXV0aFdpbmRvd1R5cGUgXCIke29BdXRoV2luZG93VHlwZX1cImApO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NPQXV0aENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gIH1cblxuICAvLyBTaWduIG91dCByZXF1ZXN0IGFuZCBkZWxldGUgc3RvcmFnZVxuICBzaWduT3V0KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmRlbGV0ZTxhbnk+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25PdXRQYXRoKVxuXHQgIC8vIE9ubHkgcmVtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYW5kIGNsZWFyIHRoZSBkYXRhIGFmdGVyIHRoZSBjYWxsXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWNjZXNzVG9rZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjbGllbnQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdleHBpcnknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlblR5cGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1aWQnKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYXV0aERhdGEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0b2tlbiByZXF1ZXN0XG4gIHZhbGlkYXRlVG9rZW4oKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAuZ2V0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnZhbGlkYXRlVG9rZW5QYXRoKS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIChyZXMpID0+IHRoaXMudXNlckRhdGEgPSByZXNbJ2RhdGEnXSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDEgJiYgdGhpcy5vcHRpb25zLnNpZ25PdXRGYWlsZWRWYWxpZGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbk91dCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgLy8gVXBkYXRlIHBhc3N3b3JkIHJlcXVlc3RcbiAgdXBkYXRlUGFzc3dvcmQodXBkYXRlUGFzc3dvcmREYXRhOiBVcGRhdGVQYXNzd29yZERhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUpO1xuICAgIH1cblxuICAgIGxldCBhcmdzOiBhbnk7XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCA9PSBudWxsKSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncyA9IHtcbiAgICAgICAgY3VycmVudF9wYXNzd29yZDogICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCxcbiAgICAgICAgcGFzc3dvcmQ6ICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkLFxuICAgICAgICBwYXNzd29yZF9jb25maXJtYXRpb246ICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDb25maXJtYXRpb25cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW4pIHtcbiAgICAgIGFyZ3MucmVzZXRfcGFzc3dvcmRfdG9rZW4gPSB1cGRhdGVQYXNzd29yZERhdGEucmVzZXRQYXNzd29yZFRva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSBhcmdzO1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnVwZGF0ZVBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuICAvLyBSZXNldCBwYXNzd29yZCByZXF1ZXN0XG4gIHJlc2V0UGFzc3dvcmQocmVzZXRQYXNzd29yZERhdGE6IFJlc2V0UGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHRoaXMudXNlclR5cGUgPSAocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogcmVzZXRQYXNzd29yZERhdGEubG9naW4sXG4gICAgICByZWRpcmVjdF91cmw6IHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIENvbnN0cnVjdCBQYXRocyAvIFVybHNcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSBnZXRVc2VyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy51c2VyVHlwZSA9PSBudWxsKSA/ICcnIDogdGhpcy51c2VyVHlwZS5wYXRoICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBcGlQYXRoKCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbnN0cnVjdGVkUGF0aCA9ICcnO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpQmFzZSArICcvJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaVBhdGggIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlQYXRoICsgJy8nO1xuICAgIH1cblxuICAgIHJldHVybiBjb25zdHJ1Y3RlZFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBcGlQYXRoKCkgKyB0aGlzLmdldFVzZXJQYXRoKCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoUGF0aChvQXV0aFR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IG9BdXRoUGF0aDogc3RyaW5nO1xuXG4gICAgb0F1dGhQYXRoID0gdGhpcy5vcHRpb25zLm9BdXRoUGF0aHNbb0F1dGhUeXBlXTtcblxuICAgIGlmIChvQXV0aFBhdGggPT0gbnVsbCkge1xuICAgICAgb0F1dGhQYXRoID0gYC9hdXRoLyR7b0F1dGhUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9BdXRoUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhVcmwob0F1dGhQYXRoOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tVcmw6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzogeyBba2V5OnN0cmluZ106IHN0cmluZzsgfSk6IHN0cmluZyB7XG4gICAgbGV0IHVybDogc3RyaW5nO1xuXG4gICAgdXJsID0gICBgJHt0aGlzLm9wdGlvbnMub0F1dGhCYXNlfS8ke29BdXRoUGF0aH1gO1xuICAgIHVybCArPSAgYD9vbW5pYXV0aF93aW5kb3dfdHlwZT0ke3dpbmRvd1R5cGV9YDtcbiAgICB1cmwgKz0gIGAmYXV0aF9vcmlnaW5fdXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNhbGxiYWNrVXJsKX1gO1xuXG4gICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdXJsICs9IGAmcmVzb3VyY2VfY2xhc3M9JHt0aGlzLnVzZXJUeXBlLm5hbWV9YDtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgIHVybCArPSBgJiR7a2V5fT0ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXNba2V5XSl9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogR2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBUcnkgdG8gbG9hZCBhdXRoIGRhdGFcbiAgcHJpdmF0ZSB0cnlMb2FkQXV0aERhdGEoKTogdm9pZCB7XG5cbiAgICBjb25zdCB1c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlclR5cGUnKSk7XG5cbiAgICBpZiAodXNlclR5cGUpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSB1c2VyVHlwZTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIGlmICh0aGlzLmFjdGl2YXRlZFJvdXRlKSB7XG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBhcmFtcygpO1xuICAgIH1cblxuICAgIC8vIGlmICh0aGlzLmF1dGhEYXRhKSB7XG4gICAgLy8gICAgIHRoaXMudmFsaWRhdGVUb2tlbigpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHB1YmxpYyBnZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBoZWFkZXJzID0gZGF0YS5oZWFkZXJzO1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGhlYWRlcnMuZ2V0KCdhY2Nlc3MtdG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICBoZWFkZXJzLmdldCgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgaGVhZGVycy5nZXQoJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIGhlYWRlcnMuZ2V0KCd0b2tlbi10eXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgaGVhZGVycy5nZXQoJ3VpZCcpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcG9zdCBtZXNzYWdlXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGRhdGFbJ2F1dGhfdG9rZW4nXSxcbiAgICAgIGNsaWVudDogICAgICAgICBkYXRhWydjbGllbnRfaWQnXSxcbiAgICAgIGV4cGlyeTogICAgICAgICBkYXRhWydleHBpcnknXSxcbiAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgIHVpZDogICAgICAgICAgICBkYXRhWyd1aWQnXVxuICAgIH07XG5cbiAgICB0aGlzLnNldEF1dGhEYXRhKGF1dGhEYXRhKTtcbiAgfVxuXG4gIC8vIFRyeSB0byBnZXQgYXV0aCBkYXRhIGZyb20gc3RvcmFnZS5cbiAgcHVibGljIGdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG5cbiAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYWNjZXNzVG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjbGllbnQnKSxcbiAgICAgIGV4cGlyeTogICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleHBpcnknKSxcbiAgICAgIHRva2VuVHlwZTogICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlblR5cGUnKSxcbiAgICAgIHVpZDogICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1aWQnKVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRyeSB0byBnZXQgYXV0aCBkYXRhIGZyb20gdXJsIHBhcmFtZXRlcnMuXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk6IHZvaWQge1xuICAgIHRoaXMuYWN0aXZhdGVkUm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKHF1ZXJ5UGFyYW1zID0+IHtcbiAgICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgICAgYWNjZXNzVG9rZW46ICAgIHF1ZXJ5UGFyYW1zWyd0b2tlbiddIHx8IHF1ZXJ5UGFyYW1zWydhdXRoX3Rva2VuJ10sXG4gICAgICAgIGNsaWVudDogICAgICAgICBxdWVyeVBhcmFtc1snY2xpZW50X2lkJ10sXG4gICAgICAgIGV4cGlyeTogICAgICAgICBxdWVyeVBhcmFtc1snZXhwaXJ5J10sXG4gICAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgICAgdWlkOiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zWyd1aWQnXVxuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gV3JpdGUgYXV0aCBkYXRhIHRvIHN0b3JhZ2VcbiAgcHJpdmF0ZSBzZXRBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuXG4gICAgICB0aGlzLmF1dGhEYXRhID0gYXV0aERhdGE7XG5cbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FjY2Vzc1Rva2VuJywgYXV0aERhdGEuYWNjZXNzVG9rZW4pO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY2xpZW50JywgYXV0aERhdGEuY2xpZW50KTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4cGlyeScsIGF1dGhEYXRhLmV4cGlyeSk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlblR5cGUnLCBhdXRoRGF0YS50b2tlblR5cGUpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndWlkJywgYXV0aERhdGEudWlkKTtcblxuICAgICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyVHlwZScsIHRoaXMudXNlclR5cGUubmFtZSk7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBWYWxpZGF0ZSBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gQ2hlY2sgaWYgYXV0aCBkYXRhIGNvbXBsZXRlIGFuZCBpZiByZXNwb25zZSB0b2tlbiBpcyBuZXdlclxuICBwcml2YXRlIGNoZWNrQXV0aERhdGEoYXV0aERhdGE6IEF1dGhEYXRhKTogYm9vbGVhbiB7XG5cbiAgICBpZiAoXG4gICAgICBhdXRoRGF0YS5hY2Nlc3NUb2tlbiAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS5jbGllbnQgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuZXhwaXJ5ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLnRva2VuVHlwZSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS51aWQgIT0gbnVsbFxuICAgICkge1xuICAgICAgaWYgKHRoaXMuYXV0aERhdGEgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYXV0aERhdGEuZXhwaXJ5ID49IHRoaXMuYXV0aERhdGEuZXhwaXJ5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBPQXV0aFxuICAgKlxuICAgKi9cblxuICBwcml2YXRlIHJlcXVlc3RDcmVkZW50aWFsc1ZpYVBvc3RNZXNzYWdlKGF1dGhXaW5kb3c6IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3QgcG9sbGVyT2JzZXJ2ID0gaW50ZXJ2YWwoNTAwKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlT2JzZXJ2ID0gZnJvbUV2ZW50KHRoaXMuZ2xvYmFsLCAnbWVzc2FnZScpLnBpcGUoXG4gICAgICBwbHVjaygnZGF0YScpLFxuICAgICAgZmlsdGVyKHRoaXMub0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcilcbiAgICApO1xuXG4gICAgY29uc3QgcmVzcG9uc2VTdWJzY3JpcHRpb24gPSByZXNwb25zZU9ic2Vydi5zdWJzY3JpYmUoXG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBvc3RNZXNzYWdlLmJpbmQodGhpcylcbiAgICApO1xuXG4gICAgY29uc3QgcG9sbGVyU3Vic2NyaXB0aW9uID0gcG9sbGVyT2JzZXJ2LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoYXV0aFdpbmRvdy5jbG9zZWQpIHtcbiAgICAgICAgcG9sbGVyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdXRoV2luZG93LnBvc3RNZXNzYWdlKCdyZXF1ZXN0Q3JlZGVudGlhbHMnLCAnKicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlT2JzZXJ2O1xuICB9XG5cbiAgcHJpdmF0ZSBvQXV0aFdpbmRvd1Jlc3BvbnNlRmlsdGVyKGRhdGE6IGFueSk6IGFueSB7XG4gICAgaWYgKGRhdGEubWVzc2FnZSA9PT0gJ2RlbGl2ZXJDcmVkZW50aWFscydcbiAgICAgIHx8IGRhdGEubWVzc2FnZSA9PT0gJ2F1dGhGYWlsdXJlJ1xuICAgICAgfHwgZGF0YS5tZXNzYWdlID09PSAnZGVsaXZlclByb3ZpZGVyQXV0aCcpIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFV0aWxpdGllc1xuICAgKlxuICAgKi9cblxuICAvLyBNYXRjaCB1c2VyIGNvbmZpZyBieSB1c2VyIGNvbmZpZyBuYW1lXG4gIHByaXZhdGUgZ2V0VXNlclR5cGVCeU5hbWUobmFtZTogc3RyaW5nKTogVXNlclR5cGUge1xuICAgIGlmIChuYW1lID09IG51bGwgfHwgdGhpcy5vcHRpb25zLnVzZXJUeXBlcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZXJUeXBlcy5maW5kKFxuICAgICAgdXNlclR5cGUgPT4gdXNlclR5cGUubmFtZSA9PT0gbmFtZVxuICAgICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBFdmVudCwgSHR0cFJlcXVlc3QsIEh0dHBJbnRlcmNlcHRvciwgSHR0cEhhbmRsZXIsIEh0dHBSZXNwb25zZSwgSHR0cEVycm9yUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFuZ3VsYXJUb2tlbk9wdGlvbnMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuaW1wb3J0IHsgQW5ndWxhclRva2VuU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBwcml2YXRlIGF0T3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvciggcHJpdmF0ZSB0b2tlblNlcnZpY2U6IEFuZ3VsYXJUb2tlblNlcnZpY2UgKSB7XG4gIH1cblxuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcblxuICAgIC8vIEdldCBhdXRoIGRhdGEgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpO1xuXG4gICAgLy8gQWRkIHRoZSBoZWFkZXJzIGlmIHRoZSByZXF1ZXN0IGlzIGdvaW5nIHRvIHRoZSBjb25maWd1cmVkIHNlcnZlclxuICAgIGlmICh0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEgJiYgKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UgPT09IG51bGwgfHwgcmVxLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlKSkpIHtcblxuICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgJ2FjY2Vzcy10b2tlbic6IHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5hY2Nlc3NUb2tlbixcbiAgICAgICAgJ2NsaWVudCc6ICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5jbGllbnQsXG4gICAgICAgICdleHBpcnknOiAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuZXhwaXJ5LFxuICAgICAgICAndG9rZW4tdHlwZSc6ICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnRva2VuVHlwZSxcbiAgICAgICAgJ3VpZCc6ICAgICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS51aWRcbiAgICAgIH07XG5cbiAgICAgIHJlcSA9IHJlcS5jbG9uZSh7XG4gICAgICAgIHNldEhlYWRlcnM6IGhlYWRlcnNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpLnBpcGUodGFwKFxuICAgICAgICByZXMgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShyZXMpLFxuICAgICAgICBlcnIgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShlcnIpXG4gICAgKSk7XG4gIH1cblxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHByaXZhdGUgaGFuZGxlUmVzcG9uc2UocmVzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAocmVzIGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlIHx8IHJlcyBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlKSB7XG4gICAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSA9PT0gbnVsbCB8fCAocmVzLnVybCAmJiByZXMudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UpKSkge1xuICAgICAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZSg8YW55PnJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycywgT3B0aW9uYWwsIFNraXBTZWxmLCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFuZ3VsYXJUb2tlbk9wdGlvbnMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuaW1wb3J0IHsgQW5ndWxhclRva2VuU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLmludGVyY2VwdG9yJztcbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmV4cG9ydCAqIGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5Nb2R1bGUge1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHBhcmVudE1vZHVsZTogQW5ndWxhclRva2VuTW9kdWxlKSB7XG4gICAgaWYgKHBhcmVudE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyVG9rZW4gaXMgYWxyZWFkeSBsb2FkZWQuIEl0IHNob3VsZCBvbmx5IGJlIGltcG9ydGVkIGluIHlvdXIgYXBwbGljYXRpb25cXCdzIG1haW4gbW9kdWxlLicpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgZm9yUm9vdChvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBBbmd1bGFyVG9rZW5Nb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLFxuICAgICAgICAgIHVzZUNsYXNzOiBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvcixcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zLmFuZ3VsYXJUb2tlbk9wdGlvbnNQcm92aWRlciB8fFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogQU5HVUxBUl9UT0tFTl9PUFRJT05TLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRpb25zXG4gICAgICAgIH0sXG4gICAgICAgIEFuZ3VsYXJUb2tlblNlcnZpY2VcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUVBLE1BQWEscUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQUMsdUJBQXVCLENBQUM7Ozs7OztBQ0ZoRixNQTBCYSxtQkFBbUI7Ozs7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