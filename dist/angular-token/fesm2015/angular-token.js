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
            globalOptions: {
                headers: {}
            }
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
    get globalOptions() {
        return this.options.globalOptions;
    }
    /**
     * @param {?} options
     * @return {?}
     */
    setGlobalOptions(options) {
        this.options.globalOptions = options;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi50b2tlbi50cyIsIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi5zZXJ2aWNlLnRzIiwibmc6Ly9hbmd1bGFyLXRva2VuL2xpYi9hbmd1bGFyLXRva2VuLmludGVyY2VwdG9yLnRzIiwibmc6Ly9hbmd1bGFyLXRva2VuL2xpYi9hbmd1bGFyLXRva2VuLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY29uc3QgQU5HVUxBUl9UT0tFTl9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuKCdBTkdVTEFSX1RPS0VOX09QVElPTlMnKTtcbiIsImltcG9ydCB7IEluamVjdGFibGUsIE9wdGlvbmFsLCBJbmplY3QsIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyLCBDYW5BY3RpdmF0ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb21FdmVudCwgaW50ZXJ2YWwgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHBsdWNrLCBmaWx0ZXIsIHNoYXJlLCBmaW5hbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgQU5HVUxBUl9UT0tFTl9PUFRJT05TIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLnRva2VuJztcblxuaW1wb3J0IHtcbiAgU2lnbkluRGF0YSxcbiAgUmVnaXN0ZXJEYXRhLFxuICBVcGRhdGVQYXNzd29yZERhdGEsXG4gIFJlc2V0UGFzc3dvcmREYXRhLFxuXG4gIFVzZXJUeXBlLFxuICBVc2VyRGF0YSxcbiAgQXV0aERhdGEsXG5cbiAgQW5ndWxhclRva2VuT3B0aW9ucyxcbiAgR2xvYmFsT3B0aW9uc1xufSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuU2VydmljZSBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcblxuICBnZXQgY3VycmVudFVzZXJUeXBlKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlclR5cGUubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFVzZXJEYXRhKCk6IFVzZXJEYXRhIHtcbiAgICByZXR1cm4gdGhpcy51c2VyRGF0YTtcbiAgfVxuXG4gIGdldCBjdXJyZW50QXV0aERhdGEoKTogQXV0aERhdGEge1xuICAgIHJldHVybiB0aGlzLmF1dGhEYXRhO1xuICB9XG5cbiAgZ2V0IGFwaUJhc2UoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFwaUJhc2U7XG4gIH1cblxuICBnZXQgZ2xvYmFsT3B0aW9ucygpOiBHbG9iYWxPcHRpb25zIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmdsb2JhbE9wdGlvbnM7XG4gIH1cblxuICBwcml2YXRlIG9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnM7XG4gIHByaXZhdGUgdXNlclR5cGU6IFVzZXJUeXBlO1xuICBwcml2YXRlIGF1dGhEYXRhOiBBdXRoRGF0YTtcbiAgcHJpdmF0ZSB1c2VyRGF0YTogVXNlckRhdGE7XG4gIHByaXZhdGUgZ2xvYmFsOiBXaW5kb3cgfCBhbnk7XG5cbiAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2U6IFN0b3JhZ2UgfCBhbnkgPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgQEluamVjdChBTkdVTEFSX1RPS0VOX09QVElPTlMpIGNvbmZpZzogYW55LFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcGxhdGZvcm1JZDogT2JqZWN0LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgKSB7XG4gICAgdGhpcy5nbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG5cbiAgICBpZiAoaXNQbGF0Zm9ybVNlcnZlcihwbGF0Zm9ybUlkKSkge1xuICAgICAgdGhpcy5nbG9iYWwgPSB7XG4gICAgICAgIG9wZW46ICgpID0+IG51bGwsXG4gICAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgICAgaHJlZjogJy8nLFxuICAgICAgICAgIG9yaWdpbjogJy8nXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0gPSAoKSA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSA9ICgpID0+IG51bGw7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtID0gKCkgPT4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnMgPSB7XG4gICAgICBhcGlQYXRoOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGFwaUJhc2U6ICAgICAgICAgICAgICAgICAgICBudWxsLFxuXG4gICAgICBzaWduSW5QYXRoOiAgICAgICAgICAgICAgICAgJ2F1dGgvc2lnbl9pbicsXG4gICAgICBzaWduSW5SZWRpcmVjdDogICAgICAgICAgICAgbnVsbCxcbiAgICAgIHNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXk6ICBudWxsLFxuXG4gICAgICBzaWduT3V0UGF0aDogICAgICAgICAgICAgICAgJ2F1dGgvc2lnbl9vdXQnLFxuICAgICAgdmFsaWRhdGVUb2tlblBhdGg6ICAgICAgICAgICdhdXRoL3ZhbGlkYXRlX3Rva2VuJyxcbiAgICAgIHNpZ25PdXRGYWlsZWRWYWxpZGF0ZTogICAgICBmYWxzZSxcblxuICAgICAgcmVnaXN0ZXJBY2NvdW50UGF0aDogICAgICAgICdhdXRoJyxcbiAgICAgIGRlbGV0ZUFjY291bnRQYXRoOiAgICAgICAgICAnYXV0aCcsXG4gICAgICByZWdpc3RlckFjY291bnRDYWxsYmFjazogICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXBkYXRlUGFzc3dvcmRQYXRoOiAgICAgICAgICdhdXRoJyxcblxuICAgICAgcmVzZXRQYXNzd29yZFBhdGg6ICAgICAgICAgICdhdXRoL3Bhc3N3b3JkJyxcbiAgICAgIHJlc2V0UGFzc3dvcmRDYWxsYmFjazogICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmLFxuXG4gICAgICB1c2VyVHlwZXM6ICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGxvZ2luRmllbGQ6ICAgICAgICAgICAgICAgICAnZW1haWwnLFxuXG4gICAgICBvQXV0aEJhc2U6ICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24ub3JpZ2luLFxuICAgICAgb0F1dGhQYXRoczoge1xuICAgICAgICBnaXRodWI6ICAgICAgICAgICAgICAgICAgICdhdXRoL2dpdGh1YidcbiAgICAgIH0sXG4gICAgICBvQXV0aENhbGxiYWNrUGF0aDogICAgICAgICAgJ29hdXRoX2NhbGxiYWNrJyxcbiAgICAgIG9BdXRoV2luZG93VHlwZTogICAgICAgICAgICAnbmV3V2luZG93JyxcbiAgICAgIG9BdXRoV2luZG93T3B0aW9uczogICAgICAgICBudWxsLFxuXG4gICAgICBnbG9iYWxPcHRpb25zOiB7XG4gICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSAoPGFueT5PYmplY3QpLmFzc2lnbihkZWZhdWx0T3B0aW9ucywgY29uZmlnKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZWRPcHRpb25zO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlID09PSBudWxsKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFthbmd1bGFyLXRva2VuXSBZb3UgaGF2ZSBub3QgY29uZmlndXJlZCAnYXBpQmFzZScsIHdoaWNoIG1heSByZXN1bHQgaW4gc2VjdXJpdHkgaXNzdWVzLiBgICtcbiAgICAgICAgICAgICAgICAgICBgUGxlYXNlIHJlZmVyIHRvIHRoZSBkb2N1bWVudGF0aW9uIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZXJvbmlha3kvYW5ndWxhci10b2tlbi93aWtpYCk7XG4gICAgfVxuXG4gICAgdGhpcy50cnlMb2FkQXV0aERhdGEoKTtcbiAgfVxuXG4gIHNldEdsb2JhbE9wdGlvbnMob3B0aW9uczogR2xvYmFsT3B0aW9ucyk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucy5nbG9iYWxPcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIHVzZXJTaWduZWRJbigpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhIXRoaXMuYXV0aERhdGE7XG4gIH1cblxuICBjYW5BY3RpdmF0ZShyb3V0ZSwgc3RhdGUpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy51c2VyU2lnbmVkSW4oKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0b3JlIGN1cnJlbnQgbG9jYXRpb24gaW4gc3RvcmFnZSAodXNlZnVsbCBmb3IgcmVkaXJlY3Rpb24gYWZ0ZXIgc2lnbmluZyBpbilcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgIHRoaXMub3B0aW9ucy5zaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5LFxuICAgICAgICAgIHN0YXRlLnVybFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWRpcmVjdCB1c2VyIHRvIHNpZ24gaW4gaWYgc2lnbkluUmVkaXJlY3QgaXMgc2V0XG4gICAgICBpZiAodGhpcy5yb3V0ZXIgJiYgdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0KSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLm9wdGlvbnMuc2lnbkluUmVkaXJlY3RdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIEFjdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLy8gUmVnaXN0ZXIgcmVxdWVzdFxuICByZWdpc3RlckFjY291bnQocmVnaXN0ZXJEYXRhOiBSZWdpc3RlckRhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuXG4gICAgcmVnaXN0ZXJEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgcmVnaXN0ZXJEYXRhKTtcblxuICAgIGlmIChyZWdpc3RlckRhdGEudXNlclR5cGUgPT0gbnVsbCkge1xuICAgICAgdGhpcy51c2VyVHlwZSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHJlZ2lzdGVyRGF0YS51c2VyVHlwZSk7XG4gICAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLnVzZXJUeXBlO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZF9jb25maXJtYXRpb24gPT0gbnVsbCAmJlxuICAgICAgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uICE9IG51bGxcbiAgICApIHtcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZF9jb25maXJtYXRpb24gPSByZWdpc3RlckRhdGEucGFzc3dvcmRDb25maXJtYXRpb247XG4gICAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ2luID0gcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIGRlbGV0ZSByZWdpc3RlckRhdGEubG9naW47XG4gICAgcmVnaXN0ZXJEYXRhW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXSA9IGxvZ2luO1xuXG4gICAgcmVnaXN0ZXJEYXRhLmNvbmZpcm1fc3VjY2Vzc191cmwgPSB0aGlzLm9wdGlvbnMucmVnaXN0ZXJBY2NvdW50Q2FsbGJhY2s7XG5cbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMucmVnaXN0ZXJBY2NvdW50UGF0aCwgcmVnaXN0ZXJEYXRhKTtcbiAgfVxuXG4gIC8vIERlbGV0ZSBBY2NvdW50XG4gIGRlbGV0ZUFjY291bnQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZSh0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5kZWxldGVBY2NvdW50UGF0aCk7XG4gIH1cblxuICAvLyBTaWduIGluIHJlcXVlc3QgYW5kIHNldCBzdG9yYWdlXG4gIHNpZ25JbihzaWduSW5EYXRhOiBTaWduSW5EYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICB0aGlzLnVzZXJUeXBlID0gKHNpZ25JbkRhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShzaWduSW5EYXRhLnVzZXJUeXBlKTtcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBbdGhpcy5vcHRpb25zLmxvZ2luRmllbGRdOiBzaWduSW5EYXRhLmxvZ2luLFxuICAgICAgcGFzc3dvcmQ6IHNpZ25JbkRhdGEucGFzc3dvcmRcbiAgICB9O1xuXG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLnBvc3QodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuc2lnbkluUGF0aCwgYm9keSwgeyBvYnNlcnZlOiAncmVzcG9uc2UnIH0pLnBpcGUoc2hhcmUoKSk7XG5cbiAgICBvYnNlcnYuc3Vic2NyaWJlKHJlcyA9PiB0aGlzLnVzZXJEYXRhID0gcmVzLmJvZHlbJ2RhdGEnXSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgc2lnbkluT0F1dGgob0F1dGhUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHBhcmFtcz86IHsgW2tleTpzdHJpbmddOiBzdHJpbmc7IH0pIHtcblxuICAgIGNvbnN0IG9BdXRoUGF0aDogc3RyaW5nID0gdGhpcy5nZXRPQXV0aFBhdGgob0F1dGhUeXBlKTtcbiAgICBjb25zdCBjYWxsYmFja1VybCA9IGAke3RoaXMuZ2xvYmFsLmxvY2F0aW9uLm9yaWdpbn0vJHt0aGlzLm9wdGlvbnMub0F1dGhDYWxsYmFja1BhdGh9YDtcbiAgICBjb25zdCBvQXV0aFdpbmRvd1R5cGU6IHN0cmluZyA9IHRoaXMub3B0aW9ucy5vQXV0aFdpbmRvd1R5cGU7XG4gICAgY29uc3QgYXV0aFVybDogc3RyaW5nID0gdGhpcy5nZXRPQXV0aFVybChcbiAgICAgIG9BdXRoUGF0aCxcbiAgICAgIGNhbGxiYWNrVXJsLFxuICAgICAgb0F1dGhXaW5kb3dUeXBlLFxuICAgICAgcGFyYW1zXG4gICAgKTtcblxuICAgIGlmIChvQXV0aFdpbmRvd1R5cGUgPT09ICduZXdXaW5kb3cnKSB7XG4gICAgICBjb25zdCBvQXV0aFdpbmRvd09wdGlvbnMgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dPcHRpb25zO1xuICAgICAgbGV0IHdpbmRvd09wdGlvbnMgPSAnJztcblxuICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgICBpZiAob0F1dGhXaW5kb3dPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgd2luZG93T3B0aW9ucyArPSBgLCR7a2V5fT0ke29BdXRoV2luZG93T3B0aW9uc1trZXldfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvcHVwID0gd2luZG93Lm9wZW4oXG4gICAgICAgICAgYXV0aFVybCxcbiAgICAgICAgICAnX2JsYW5rJyxcbiAgICAgICAgICBgY2xvc2VidXR0b25jYXB0aW9uPUNhbmNlbCR7d2luZG93T3B0aW9uc31gXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdENyZWRlbnRpYWxzVmlhUG9zdE1lc3NhZ2UocG9wdXApO1xuICAgIH0gZWxzZSBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnc2FtZVdpbmRvdycpIHtcbiAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYgPSBhdXRoVXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIG9BdXRoV2luZG93VHlwZSBcIiR7b0F1dGhXaW5kb3dUeXBlfVwiYCk7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc09BdXRoQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5nZXRBdXRoRGF0YUZyb21QYXJhbXMoKTtcbiAgfVxuXG4gIC8vIFNpZ24gb3V0IHJlcXVlc3QgYW5kIGRlbGV0ZSBzdG9yYWdlXG4gIHNpZ25PdXQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAuZGVsZXRlPGFueT4odGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuc2lnbk91dFBhdGgpXG5cdCAgLy8gT25seSByZW1vdmUgdGhlIGxvY2FsU3RvcmFnZSBhbmQgY2xlYXIgdGhlIGRhdGEgYWZ0ZXIgdGhlIGNhbGxcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgIGZpbmFsaXplKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdhY2Nlc3NUb2tlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NsaWVudCcpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2V4cGlyeScpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuVHlwZScpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VpZCcpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hdXRoRGF0YSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VyVHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VyRGF0YSA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRva2VuIHJlcXVlc3RcbiAgdmFsaWRhdGVUb2tlbigpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5nZXQodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMudmFsaWRhdGVUb2tlblBhdGgpLnBpcGUoc2hhcmUoKSk7XG5cbiAgICBvYnNlcnYuc3Vic2NyaWJlKFxuICAgICAgKHJlcykgPT4gdGhpcy51c2VyRGF0YSA9IHJlc1snZGF0YSddLFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT09IDQwMSAmJiB0aGlzLm9wdGlvbnMuc2lnbk91dEZhaWxlZFZhbGlkYXRlKSB7XG4gICAgICAgICAgdGhpcy5zaWduT3V0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBVcGRhdGUgcGFzc3dvcmQgcmVxdWVzdFxuICB1cGRhdGVQYXNzd29yZCh1cGRhdGVQYXNzd29yZERhdGE6IFVwZGF0ZVBhc3N3b3JkRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHVwZGF0ZVBhc3N3b3JkRGF0YS51c2VyVHlwZSk7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3M6IGFueTtcblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDdXJyZW50ID09IG51bGwpIHtcbiAgICAgIGFyZ3MgPSB7XG4gICAgICAgIHBhc3N3b3JkOiAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZCxcbiAgICAgICAgcGFzc3dvcmRfY29uZmlybWF0aW9uOiAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBjdXJyZW50X3Bhc3N3b3JkOiAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDdXJyZW50LFxuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnJlc2V0UGFzc3dvcmRUb2tlbikge1xuICAgICAgYXJncy5yZXNldF9wYXNzd29yZF90b2tlbiA9IHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IGFyZ3M7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMudXBkYXRlUGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG4gIC8vIFJlc2V0IHBhc3N3b3JkIHJlcXVlc3RcbiAgcmVzZXRQYXNzd29yZChyZXNldFBhc3N3b3JkRGF0YTogUmVzZXRQYXNzd29yZERhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuXG4gICAgdGhpcy51c2VyVHlwZSA9IChyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSA9PSBudWxsKSA/IG51bGwgOiB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHJlc2V0UGFzc3dvcmREYXRhLnVzZXJUeXBlKTtcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBbdGhpcy5vcHRpb25zLmxvZ2luRmllbGRdOiByZXNldFBhc3N3b3JkRGF0YS5sb2dpbixcbiAgICAgIHJlZGlyZWN0X3VybDogdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRDYWxsYmFja1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMucmVzZXRQYXNzd29yZFBhdGgsIGJvZHkpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogQ29uc3RydWN0IFBhdGhzIC8gVXJsc1xuICAgKlxuICAgKi9cblxuICBwcml2YXRlIGdldFVzZXJQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLnVzZXJUeXBlID09IG51bGwpID8gJycgOiB0aGlzLnVzZXJUeXBlLnBhdGggKyAnLyc7XG4gIH1cblxuICBwcml2YXRlIGdldEFwaVBhdGgoKTogc3RyaW5nIHtcbiAgICBsZXQgY29uc3RydWN0ZWRQYXRoID0gJyc7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaUJhc2UgIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlCYXNlICsgJy8nO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpUGF0aCAhPSBudWxsKSB7XG4gICAgICBjb25zdHJ1Y3RlZFBhdGggKz0gdGhpcy5vcHRpb25zLmFwaVBhdGggKyAnLyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnN0cnVjdGVkUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2VydmVyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEFwaVBhdGgoKSArIHRoaXMuZ2V0VXNlclBhdGgoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhQYXRoKG9BdXRoVHlwZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgb0F1dGhQYXRoOiBzdHJpbmc7XG5cbiAgICBvQXV0aFBhdGggPSB0aGlzLm9wdGlvbnMub0F1dGhQYXRoc1tvQXV0aFR5cGVdO1xuXG4gICAgaWYgKG9BdXRoUGF0aCA9PSBudWxsKSB7XG4gICAgICBvQXV0aFBhdGggPSBgL2F1dGgvJHtvQXV0aFR5cGV9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gb0F1dGhQYXRoO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPQXV0aFVybChvQXV0aFBhdGg6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja1VybDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd1R5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM/OiB7IFtrZXk6c3RyaW5nXTogc3RyaW5nOyB9KTogc3RyaW5nIHtcbiAgICBsZXQgdXJsOiBzdHJpbmc7XG5cbiAgICB1cmwgPSAgIGAke3RoaXMub3B0aW9ucy5vQXV0aEJhc2V9LyR7b0F1dGhQYXRofWA7XG4gICAgdXJsICs9ICBgP29tbmlhdXRoX3dpbmRvd190eXBlPSR7d2luZG93VHlwZX1gO1xuICAgIHVybCArPSAgYCZhdXRoX29yaWdpbl91cmw9JHtlbmNvZGVVUklDb21wb25lbnQoY2FsbGJhY2tVcmwpfWA7XG5cbiAgICBpZiAodGhpcy51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICB1cmwgKz0gYCZyZXNvdXJjZV9jbGFzcz0ke3RoaXMudXNlclR5cGUubmFtZX1gO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIGZvciAobGV0IGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgdXJsICs9IGAmJHtrZXl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtc1trZXldKX1gO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1cmw7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBHZXQgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIFRyeSB0byBsb2FkIGF1dGggZGF0YVxuICBwcml2YXRlIHRyeUxvYWRBdXRoRGF0YSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IHVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyVHlwZScpKTtcblxuICAgIGlmICh1c2VyVHlwZSkge1xuICAgICAgdGhpcy51c2VyVHlwZSA9IHVzZXJUeXBlO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpO1xuXG4gICAgaWYgKHRoaXMuYWN0aXZhdGVkUm91dGUpIHtcbiAgICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gICAgfVxuXG4gICAgLy8gaWYgKHRoaXMuYXV0aERhdGEpIHtcbiAgICAvLyAgICAgdGhpcy52YWxpZGF0ZVRva2VuKCk7XG4gICAgLy8gfVxuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcmVzcG9uc2VcbiAgcHVibGljIGdldEF1dGhIZWFkZXJzRnJvbVJlc3BvbnNlKGRhdGE6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGhlYWRlcnMgPSBkYXRhLmhlYWRlcnM7XG5cbiAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogICAgaGVhZGVycy5nZXQoJ2FjY2Vzcy10b2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIGhlYWRlcnMuZ2V0KCdjbGllbnQnKSxcbiAgICAgIGV4cGlyeTogICAgICAgICBoZWFkZXJzLmdldCgnZXhwaXJ5JyksXG4gICAgICB0b2tlblR5cGU6ICAgICAgaGVhZGVycy5nZXQoJ3Rva2VuLXR5cGUnKSxcbiAgICAgIHVpZDogICAgICAgICAgICBoZWFkZXJzLmdldCgndWlkJylcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRBdXRoRGF0YShhdXRoRGF0YSk7XG4gIH1cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSBwb3N0IG1lc3NhZ2VcbiAgcHJpdmF0ZSBnZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogICAgZGF0YVsnYXV0aF90b2tlbiddLFxuICAgICAgY2xpZW50OiAgICAgICAgIGRhdGFbJ2NsaWVudF9pZCddLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIGRhdGFbJ2V4cGlyeSddLFxuICAgICAgdG9rZW5UeXBlOiAgICAgICdCZWFyZXInLFxuICAgICAgdWlkOiAgICAgICAgICAgIGRhdGFbJ3VpZCddXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSBzdG9yYWdlLlxuICBwdWJsaWMgZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY2Nlc3NUb2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuVHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VpZCcpXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmNoZWNrQXV0aERhdGEoYXV0aERhdGEpKSB7XG4gICAgICB0aGlzLmF1dGhEYXRhID0gYXV0aERhdGE7XG4gICAgfVxuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSB1cmwgcGFyYW1ldGVycy5cbiAgcHJpdmF0ZSBnZXRBdXRoRGF0YUZyb21QYXJhbXMoKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmF0ZWRSb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUocXVlcnlQYXJhbXMgPT4ge1xuICAgICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgICBhY2Nlc3NUb2tlbjogICAgcXVlcnlQYXJhbXNbJ3Rva2VuJ10gfHwgcXVlcnlQYXJhbXNbJ2F1dGhfdG9rZW4nXSxcbiAgICAgICAgY2xpZW50OiAgICAgICAgIHF1ZXJ5UGFyYW1zWydjbGllbnRfaWQnXSxcbiAgICAgICAgZXhwaXJ5OiAgICAgICAgIHF1ZXJ5UGFyYW1zWydleHBpcnknXSxcbiAgICAgICAgdG9rZW5UeXBlOiAgICAgICdCZWFyZXInLFxuICAgICAgICB1aWQ6ICAgICAgICAgICAgcXVlcnlQYXJhbXNbJ3VpZCddXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgICB0aGlzLmF1dGhEYXRhID0gYXV0aERhdGE7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogU2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBXcml0ZSBhdXRoIGRhdGEgdG8gc3RvcmFnZVxuICBwcml2YXRlIHNldEF1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNoZWNrQXV0aERhdGEoYXV0aERhdGEpKSB7XG5cbiAgICAgIHRoaXMuYXV0aERhdGEgPSBhdXRoRGF0YTtcblxuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWNjZXNzVG9rZW4nLCBhdXRoRGF0YS5hY2Nlc3NUb2tlbik7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjbGllbnQnLCBhdXRoRGF0YS5jbGllbnQpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhwaXJ5JywgYXV0aERhdGEuZXhwaXJ5KTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuVHlwZScsIGF1dGhEYXRhLnRva2VuVHlwZSk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1aWQnLCBhdXRoRGF0YS51aWQpO1xuXG4gICAgICBpZiAodGhpcy51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJUeXBlJywgdGhpcy51c2VyVHlwZS5uYW1lKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFZhbGlkYXRlIEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBDaGVjayBpZiBhdXRoIGRhdGEgY29tcGxldGUgYW5kIGlmIHJlc3BvbnNlIHRva2VuIGlzIG5ld2VyXG4gIHByaXZhdGUgY2hlY2tBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiBib29sZWFuIHtcblxuICAgIGlmIChcbiAgICAgIGF1dGhEYXRhLmFjY2Vzc1Rva2VuICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmNsaWVudCAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS5leHBpcnkgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudG9rZW5UeXBlICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLnVpZCAhPSBudWxsXG4gICAgKSB7XG4gICAgICBpZiAodGhpcy5hdXRoRGF0YSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdXRoRGF0YS5leHBpcnkgPj0gdGhpcy5hdXRoRGF0YS5leHBpcnk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIE9BdXRoXG4gICAqXG4gICAqL1xuXG4gIHByaXZhdGUgcmVxdWVzdENyZWRlbnRpYWxzVmlhUG9zdE1lc3NhZ2UoYXV0aFdpbmRvdzogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBwb2xsZXJPYnNlcnYgPSBpbnRlcnZhbCg1MDApO1xuXG4gICAgY29uc3QgcmVzcG9uc2VPYnNlcnYgPSBmcm9tRXZlbnQodGhpcy5nbG9iYWwsICdtZXNzYWdlJykucGlwZShcbiAgICAgIHBsdWNrKCdkYXRhJyksXG4gICAgICBmaWx0ZXIodGhpcy5vQXV0aFdpbmRvd1Jlc3BvbnNlRmlsdGVyKVxuICAgICk7XG5cbiAgICBjb25zdCByZXNwb25zZVN1YnNjcmlwdGlvbiA9IHJlc3BvbnNlT2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICk7XG5cbiAgICBjb25zdCBwb2xsZXJTdWJzY3JpcHRpb24gPSBwb2xsZXJPYnNlcnYuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGlmIChhdXRoV2luZG93LmNsb3NlZCkge1xuICAgICAgICBwb2xsZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF1dGhXaW5kb3cucG9zdE1lc3NhZ2UoJ3JlcXVlc3RDcmVkZW50aWFscycsICcqJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2VPYnNlcnY7XG4gIH1cblxuICBwcml2YXRlIG9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIoZGF0YTogYW55KTogYW55IHtcbiAgICBpZiAoZGF0YS5tZXNzYWdlID09PSAnZGVsaXZlckNyZWRlbnRpYWxzJ1xuICAgICAgfHwgZGF0YS5tZXNzYWdlID09PSAnYXV0aEZhaWx1cmUnXG4gICAgICB8fCBkYXRhLm1lc3NhZ2UgPT09ICdkZWxpdmVyUHJvdmlkZXJBdXRoJykge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVXRpbGl0aWVzXG4gICAqXG4gICAqL1xuXG4gIC8vIE1hdGNoIHVzZXIgY29uZmlnIGJ5IHVzZXIgY29uZmlnIG5hbWVcbiAgcHJpdmF0ZSBnZXRVc2VyVHlwZUJ5TmFtZShuYW1lOiBzdHJpbmcpOiBVc2VyVHlwZSB7XG4gICAgaWYgKG5hbWUgPT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMudXNlclR5cGVzID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlclR5cGVzLmZpbmQoXG4gICAgICB1c2VyVHlwZSA9PiB1c2VyVHlwZS5uYW1lID09PSBuYW1lXG4gICAgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cEV2ZW50LCBIdHRwUmVxdWVzdCwgSHR0cEludGVyY2VwdG9yLCBIdHRwSGFuZGxlciwgSHR0cFJlc3BvbnNlLCBIdHRwRXJyb3JSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgQW5ndWxhclRva2VuT3B0aW9ucyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5tb2RlbCc7XG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLnNlcnZpY2UnO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG4gIHByaXZhdGUgYXRPcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCBwcml2YXRlIHRva2VuU2VydmljZTogQW5ndWxhclRva2VuU2VydmljZSApIHtcbiAgfVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuXG4gICAgLy8gR2V0IGF1dGggZGF0YSBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk7XG5cbiAgICAvLyBBZGQgdGhlIGhlYWRlcnMgaWYgdGhlIHJlcXVlc3QgaXMgZ29pbmcgdG8gdGhlIGNvbmZpZ3VyZWQgc2VydmVyXG4gICAgaWYgKHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YSAmJiAodGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSA9PT0gbnVsbCB8fCByZXEudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UpKSkge1xuXG4gICAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgICAnYWNjZXNzLXRva2VuJzogdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLmFjY2Vzc1Rva2VuLFxuICAgICAgICAnY2xpZW50JzogICAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLmNsaWVudCxcbiAgICAgICAgJ2V4cGlyeSc6ICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5leHBpcnksXG4gICAgICAgICd0b2tlbi10eXBlJzogICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEudG9rZW5UeXBlLFxuICAgICAgICAndWlkJzogICAgICAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnVpZFxuICAgICAgfTtcblxuICAgICAgLy8gQ3VzdG9tIGhlYWRlcnMgcGFzc2VkIGluIGZvciBlYWNoIHJlcXVlc3RcbiAgICAgIGNvbnN0IGdsb2JhbE9wdGlvbnMgPSB0aGlzLnRva2VuU2VydmljZS5nbG9iYWxPcHRpb25zO1xuICAgICAgaWYgKGdsb2JhbE9wdGlvbnMgJiYgZ2xvYmFsT3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBnbG9iYWxPcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICBoZWFkZXJzW2tleV0gPSBnbG9iYWxPcHRpb25zLmhlYWRlcnNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXEgPSByZXEuY2xvbmUoe1xuICAgICAgICBzZXRIZWFkZXJzOiBoZWFkZXJzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKS5waXBlKHRhcChcbiAgICAgICAgcmVzID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UocmVzKSxcbiAgICAgICAgZXJyID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UoZXJyKVxuICAgICkpO1xuICB9XG5cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSByZXNwb25zZVxuICBwcml2YXRlIGhhbmRsZVJlc3BvbnNlKHJlczogYW55KTogdm9pZCB7XG4gICAgaWYgKHJlcyBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSB8fCByZXMgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSkge1xuICAgICAgaWYgKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UgPT09IG51bGwgfHwgKHJlcy51cmwgJiYgcmVzLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlKSkpIHtcbiAgICAgICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aEhlYWRlcnNGcm9tUmVzcG9uc2UoPGFueT5yZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgTmdNb2R1bGUsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE9wdGlvbmFsLCBTa2lwU2VsZiwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEhUVFBfSU5URVJDRVBUT1JTIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5PcHRpb25zIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlblNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvciB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvcic7XG5pbXBvcnQgeyBBTkdVTEFSX1RPS0VOX09QVElPTlMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4udG9rZW4nO1xuXG5leHBvcnQgKiBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5cbkBOZ01vZHVsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuTW9kdWxlIHtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwYXJlbnRNb2R1bGU6IEFuZ3VsYXJUb2tlbk1vZHVsZSkge1xuICAgIGlmIChwYXJlbnRNb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQW5ndWxhclRva2VuIGlzIGFscmVhZHkgbG9hZGVkLiBJdCBzaG91bGQgb25seSBiZSBpbXBvcnRlZCBpbiB5b3VyIGFwcGxpY2F0aW9uXFwncyBtYWluIG1vZHVsZS4nKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIGZvclJvb3Qob3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucyk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQW5ndWxhclRva2VuTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogQW5ndWxhclRva2VuSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucy5hbmd1bGFyVG9rZW5PcHRpb25zUHJvdmlkZXIgfHxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyxcbiAgICAgICAgICB1c2VWYWx1ZTogb3B0aW9uc1xuICAgICAgICB9LFxuICAgICAgICBBbmd1bGFyVG9rZW5TZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFFQSxNQUFhLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUFDLHVCQUF1QixDQUFDOzs7Ozs7QUNGaEYsTUEyQmEsbUJBQW1COzs7Ozs7OztJQWtDOUIsWUFDVSxJQUFnQixFQUNPLE1BQVcsRUFDYixVQUFrQixFQUMzQixjQUE4QixFQUM5QixNQUFjO1FBSjFCLFNBQUksR0FBSixJQUFJLENBQVk7UUFFSyxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQzNCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBUDVCLGlCQUFZLEdBQWtCLEVBQUUsQ0FBQztRQVN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFNUQsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUNaLElBQUksRUFBRSxNQUFNLElBQUk7Z0JBQ2hCLFFBQVEsRUFBRTtvQkFDUixJQUFJLEVBQUUsR0FBRztvQkFDVCxNQUFNLEVBQUUsR0FBRztpQkFDWjthQUNGLENBQUM7WUFFRixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQztTQUMzQzthQUFNO1lBQ0wsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7U0FDbEM7O2NBRUssY0FBYyxHQUF3QjtZQUMxQyxPQUFPLEVBQXFCLElBQUk7WUFDaEMsT0FBTyxFQUFxQixJQUFJO1lBRWhDLFVBQVUsRUFBa0IsY0FBYztZQUMxQyxjQUFjLEVBQWMsSUFBSTtZQUNoQyx5QkFBeUIsRUFBRyxJQUFJO1lBRWhDLFdBQVcsRUFBaUIsZUFBZTtZQUMzQyxpQkFBaUIsRUFBVyxxQkFBcUI7WUFDakQscUJBQXFCLEVBQU8sS0FBSztZQUVqQyxtQkFBbUIsRUFBUyxNQUFNO1lBQ2xDLGlCQUFpQixFQUFXLE1BQU07WUFDbEMsdUJBQXVCLEVBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUVyRCxrQkFBa0IsRUFBVSxNQUFNO1lBRWxDLGlCQUFpQixFQUFXLGVBQWU7WUFDM0MscUJBQXFCLEVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUVyRCxTQUFTLEVBQW1CLElBQUk7WUFDaEMsVUFBVSxFQUFrQixPQUFPO1lBRW5DLFNBQVMsRUFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTTtZQUN2RCxVQUFVLEVBQUU7Z0JBQ1YsTUFBTSxFQUFvQixhQUFhO2FBQ3hDO1lBQ0QsaUJBQWlCLEVBQVcsZ0JBQWdCO1lBQzVDLGVBQWUsRUFBYSxXQUFXO1lBQ3ZDLGtCQUFrQixFQUFVLElBQUk7WUFFaEMsYUFBYSxFQUFFO2dCQUNiLE9BQU8sRUFBRSxFQUFFO2FBQ1o7U0FDRjs7Y0FFSyxhQUFhLEdBQUcsb0JBQU0sTUFBTSxJQUFFLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO1FBQ2xFLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDO1FBRTdCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEZBQTBGO2dCQUMxRixzRkFBc0YsQ0FBQyxDQUFDO1NBQ3RHO1FBRUQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3hCOzs7O0lBdkdELElBQUksZUFBZTtRQUNqQixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDM0I7YUFBTTtZQUNMLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO0tBQ0Y7Ozs7SUFFRCxJQUFJLGVBQWU7UUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3RCOzs7O0lBRUQsSUFBSSxlQUFlO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7OztJQUVELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7S0FDN0I7Ozs7SUFFRCxJQUFJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO0tBQ25DOzs7OztJQW1GRCxnQkFBZ0IsQ0FBQyxPQUFzQjtRQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7S0FDdEM7Ozs7SUFFRCxZQUFZO1FBQ1IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUMxQjs7Ozs7O0lBRUQsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLO1FBQ3RCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7YUFBTTs7WUFFTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUN0QyxLQUFLLENBQUMsR0FBRyxDQUNWLENBQUM7YUFDSDs7WUFHRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO1lBRUQsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGOzs7Ozs7Ozs7SUFVRCxlQUFlLENBQUMsWUFBMEI7UUFFeEMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRS9DLElBQUksWUFBWSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDdEI7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUM7U0FDOUI7UUFFRCxJQUNFLFlBQVksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJO1lBQzFDLFlBQVksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLEVBQ3pDO1lBQ0EsWUFBWSxDQUFDLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQztZQUN2RSxPQUFPLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQztTQUMxQzs7Y0FFSyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUs7UUFDaEMsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQzFCLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUU5QyxZQUFZLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztRQUV4RSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQzlGOzs7OztJQUdELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDaEY7Ozs7OztJQUdELE1BQU0sQ0FBQyxVQUFzQjtRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7O2NBRTdGLElBQUksR0FBRztZQUNYLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUs7WUFDM0MsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1NBQzlCOztjQUVLLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTFILE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTFELE9BQU8sTUFBTSxDQUFDO0tBQ2Y7Ozs7OztJQUVELFdBQVcsQ0FBQyxTQUFpQixFQUNqQixNQUFrQzs7Y0FFdEMsU0FBUyxHQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDOztjQUNoRCxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTs7Y0FDaEYsZUFBZSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZTs7Y0FDdEQsT0FBTyxHQUFXLElBQUksQ0FBQyxXQUFXLENBQ3RDLFNBQVMsRUFDVCxXQUFXLEVBQ1gsZUFBZSxFQUNmLE1BQU0sQ0FDUDtRQUVELElBQUksZUFBZSxLQUFLLFdBQVcsRUFBRTs7a0JBQzdCLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCOztnQkFDdEQsYUFBYSxHQUFHLEVBQUU7WUFFdEIsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxrQkFBa0IsRUFBRTtvQkFDcEMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3hDLGFBQWEsSUFBSSxJQUFJLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO3FCQUN6RDtpQkFDRjthQUNGOztrQkFFSyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FDckIsT0FBTyxFQUNQLFFBQVEsRUFDUiw0QkFBNEIsYUFBYSxFQUFFLENBQzlDO1lBQ0QsT0FBTyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckQ7YUFBTSxJQUFJLGVBQWUsS0FBSyxZQUFZLEVBQUU7WUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztTQUNyQzthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsZUFBZSxHQUFHLENBQUMsQ0FBQztTQUNyRTtLQUNGOzs7O0lBRUQsb0JBQW9CO1FBQ2xCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0tBQzlCOzs7OztJQUdELE9BQU87O2NBQ0MsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQzs7YUFFOUUsSUFBSSxDQUNILFFBQVEsQ0FBQztZQUNMLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ3RCLENBQ0YsQ0FDRjtRQUVQLE9BQU8sTUFBTSxDQUFDO0tBQ2Y7Ozs7O0lBR0QsYUFBYTs7Y0FDTCxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFakcsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFDcEMsQ0FBQyxLQUFLO1lBQ0osSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUM5RCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7U0FDSixDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQztLQUNmOzs7Ozs7SUFHRCxjQUFjLENBQUMsa0JBQXNDO1FBRW5ELElBQUksa0JBQWtCLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtZQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyRTs7WUFFRyxJQUFTO1FBRWIsSUFBSSxrQkFBa0IsQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFFO1lBQzlDLElBQUksR0FBRztnQkFDTCxRQUFRLEVBQWdCLGtCQUFrQixDQUFDLFFBQVE7Z0JBQ25ELHFCQUFxQixFQUFHLGtCQUFrQixDQUFDLG9CQUFvQjthQUNoRSxDQUFDO1NBQ0g7YUFBTTtZQUNMLElBQUksR0FBRztnQkFDTCxnQkFBZ0IsRUFBUSxrQkFBa0IsQ0FBQyxlQUFlO2dCQUMxRCxRQUFRLEVBQWdCLGtCQUFrQixDQUFDLFFBQVE7Z0JBQ25ELHFCQUFxQixFQUFHLGtCQUFrQixDQUFDLG9CQUFvQjthQUNoRSxDQUFDO1NBQ0g7UUFFRCxJQUFJLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFO1lBQ3pDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztTQUNuRTs7Y0FFSyxJQUFJLEdBQUcsSUFBSTtRQUNqQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3BGOzs7Ozs7SUFHRCxhQUFhLENBQUMsaUJBQW9DO1FBRWhELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7O2NBRTNHLElBQUksR0FBRztZQUNYLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsS0FBSztZQUNsRCxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUI7U0FDakQ7UUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3BGOzs7Ozs7O0lBU08sV0FBVztRQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUNoRTs7OztJQUVPLFVBQVU7O1lBQ1osZUFBZSxHQUFHLEVBQUU7UUFFeEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDaEMsZUFBZSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztTQUMvQztRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ2hDLGVBQWUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7U0FDL0M7UUFFRCxPQUFPLGVBQWUsQ0FBQztLQUN4Qjs7OztJQUVPLGFBQWE7UUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQy9DOzs7OztJQUVPLFlBQVksQ0FBQyxTQUFpQjs7WUFDaEMsU0FBaUI7UUFFckIsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9DLElBQUksU0FBUyxJQUFJLElBQUksRUFBRTtZQUNyQixTQUFTLEdBQUcsU0FBUyxTQUFTLEVBQUUsQ0FBQztTQUNsQztRQUVELE9BQU8sU0FBUyxDQUFDO0tBQ2xCOzs7Ozs7OztJQUVPLFdBQVcsQ0FBQyxTQUFpQixFQUNqQixXQUFtQixFQUNuQixVQUFrQixFQUNsQixNQUFrQzs7WUFDaEQsR0FBVztRQUVmLEdBQUcsR0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2pELEdBQUcsSUFBSyx5QkFBeUIsVUFBVSxFQUFFLENBQUM7UUFDOUMsR0FBRyxJQUFLLG9CQUFvQixrQkFBa0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBRTlELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDekIsR0FBRyxJQUFJLG1CQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2hEO1FBRUQsSUFBSSxNQUFNLEVBQUU7WUFDVixLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtnQkFDdEIsR0FBRyxJQUFJLElBQUksR0FBRyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDckQ7U0FDRjtRQUVELE9BQU8sR0FBRyxDQUFDO0tBQ1o7Ozs7Ozs7O0lBVU8sZUFBZTs7Y0FFZixRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTlFLElBQUksUUFBUSxFQUFFO1lBQ1osSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUU5QixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7U0FDOUI7Ozs7S0FLRjs7Ozs7O0lBR00sMEJBQTBCLENBQUMsSUFBUzs7Y0FDbkMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPOztjQUV0QixRQUFRLEdBQWE7WUFDekIsV0FBVyxFQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO1lBQzNDLE1BQU0sRUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxNQUFNLEVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDckMsU0FBUyxFQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1lBQ3pDLEdBQUcsRUFBYSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztTQUNuQztRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUI7Ozs7OztJQUdPLDBCQUEwQixDQUFDLElBQVM7O2NBQ3BDLFFBQVEsR0FBYTtZQUN6QixXQUFXLEVBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNsQyxNQUFNLEVBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNqQyxNQUFNLEVBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QixTQUFTLEVBQU8sUUFBUTtZQUN4QixHQUFHLEVBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUM1QjtRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUI7Ozs7O0lBR00sc0JBQXNCOztjQUVyQixRQUFRLEdBQWE7WUFDekIsV0FBVyxFQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUN4RCxNQUFNLEVBQVUsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ25ELE1BQU0sRUFBVSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDbkQsU0FBUyxFQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUN0RCxHQUFHLEVBQWEsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1NBQ2pEO1FBRUQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQzFCO0tBQ0Y7Ozs7O0lBR08scUJBQXFCO1FBQzNCLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXOztrQkFDN0MsUUFBUSxHQUFhO2dCQUN6QixXQUFXLEVBQUssV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUM7Z0JBQ2pFLE1BQU0sRUFBVSxXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUN4QyxNQUFNLEVBQVUsV0FBVyxDQUFDLFFBQVEsQ0FBQztnQkFDckMsU0FBUyxFQUFPLFFBQVE7Z0JBQ3hCLEdBQUcsRUFBYSxXQUFXLENBQUMsS0FBSyxDQUFDO2FBQ25DO1lBRUQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzthQUMxQjtTQUNGLENBQUMsQ0FBQztLQUNKOzs7Ozs7Ozs7SUFTTyxXQUFXLENBQUMsUUFBa0I7UUFDcEMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBRWhDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBRXpCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzRDtTQUVGO0tBQ0Y7Ozs7Ozs7OztJQVVPLGFBQWEsQ0FBQyxRQUFrQjtRQUV0QyxJQUNFLFFBQVEsQ0FBQyxXQUFXLElBQUksSUFBSTtZQUM1QixRQUFRLENBQUMsTUFBTSxJQUFJLElBQUk7WUFDdkIsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJO1lBQ3ZCLFFBQVEsQ0FBQyxTQUFTLElBQUksSUFBSTtZQUMxQixRQUFRLENBQUMsR0FBRyxJQUFJLElBQUksRUFDcEI7WUFDQSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUN6QixPQUFPLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO2FBQU07WUFDTCxPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7Ozs7Ozs7O0lBU08sZ0NBQWdDLENBQUMsVUFBZTs7Y0FDaEQsWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7O2NBRTVCLGNBQWMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQzNELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQ3ZDOztjQUVLLG9CQUFvQixHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQ25ELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQzNDOztjQUVLLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDaEQsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO2dCQUNyQixrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUNsQztpQkFBTTtnQkFDTCxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ25EO1NBQ0YsQ0FBQztRQUVGLE9BQU8sY0FBYyxDQUFDO0tBQ3ZCOzs7OztJQUVPLHlCQUF5QixDQUFDLElBQVM7UUFDekMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLG9CQUFvQjtlQUNwQyxJQUFJLENBQUMsT0FBTyxLQUFLLGFBQWE7ZUFDOUIsSUFBSSxDQUFDLE9BQU8sS0FBSyxxQkFBcUIsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7Ozs7Ozs7OztJQVVPLGlCQUFpQixDQUFDLElBQVk7UUFDcEMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksRUFBRTtZQUNsRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQ2hDLFFBQVEsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FDbkMsQ0FBQztLQUNIOzs7WUFoa0JGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7OztZQXhCUSxVQUFVOzRDQTZEZCxNQUFNLFNBQUMscUJBQXFCO1lBQ1ksTUFBTSx1QkFBOUMsTUFBTSxTQUFDLFdBQVc7WUEvRGQsY0FBYyx1QkFnRWxCLFFBQVE7WUFoRVksTUFBTSx1QkFpRTFCLFFBQVE7Ozs7Ozs7O0FDbEViLE1BVWEsdUJBQXVCOzs7O0lBR2xDLFlBQXFCLFlBQWlDO1FBQWpDLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtLQUNyRDs7Ozs7O0lBRUQsU0FBUyxDQUFDLEdBQXFCLEVBQUUsSUFBaUI7O1FBR2hELElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7UUFHM0MsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFOztrQkFFbkgsT0FBTyxHQUFHO2dCQUNkLGNBQWMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxXQUFXO2dCQUM3RCxRQUFRLEVBQVEsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBTTtnQkFDeEQsUUFBUSxFQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQU07Z0JBQ3hELFlBQVksRUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUFTO2dCQUMzRCxLQUFLLEVBQVcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBRzthQUN0RDs7O2tCQUdLLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWE7WUFDckQsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtnQkFDMUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO29CQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDM0M7YUFDRjtZQUVELEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUNkLFVBQVUsRUFBRSxPQUFPO2FBQ3BCLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQzVCLEdBQUcsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUMvQixHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FDbEMsQ0FBQyxDQUFDO0tBQ0o7Ozs7OztJQUlPLGNBQWMsQ0FBQyxHQUFRO1FBQzdCLElBQUksR0FBRyxZQUFZLFlBQVksSUFBSSxHQUFHLFlBQVksaUJBQWlCLEVBQUU7WUFDbkUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Z0JBQy9GLElBQUksQ0FBQyxZQUFZLENBQUMsMEJBQTBCLG9CQUFNLEdBQUcsR0FBQyxDQUFDO2FBQ3hEO1NBQ0Y7S0FDRjs7O1lBbERGLFVBQVU7Ozs7WUFMRixtQkFBbUI7Ozs7Ozs7QUNKNUIsTUFXYSxrQkFBa0I7Ozs7SUFFN0IsWUFBb0MsWUFBZ0M7UUFDbEUsSUFBSSxZQUFZLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnR0FBZ0csQ0FBQyxDQUFDO1NBQ25IO0tBQ0Y7Ozs7O0lBQ0QsT0FBTyxPQUFPLENBQUMsT0FBNEI7UUFDekMsT0FBTztZQUNMLFFBQVEsRUFBRSxrQkFBa0I7WUFDNUIsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE9BQU8sRUFBRSxpQkFBaUI7b0JBQzFCLFFBQVEsRUFBRSx1QkFBdUI7b0JBQ2pDLEtBQUssRUFBRSxJQUFJO2lCQUNaO2dCQUNELE9BQU8sQ0FBQywyQkFBMkI7b0JBQ25DO3dCQUNFLE9BQU8sRUFBRSxxQkFBcUI7d0JBQzlCLFFBQVEsRUFBRSxPQUFPO3FCQUNsQjtnQkFDRCxtQkFBbUI7YUFDcEI7U0FDRixDQUFDO0tBQ0g7OztZQXpCRixRQUFROzs7O1lBRzJDLGtCQUFrQix1QkFBdkQsUUFBUSxZQUFJLFFBQVE7Ozs7Ozs7Ozs7Ozs7OzsifQ==