/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { Injectable, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { fromEvent, interval } from 'rxjs';
import { pluck, filter, share, finalize } from 'rxjs/operators';
import { ANGULAR_TOKEN_OPTIONS } from './angular-token.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./angular-token.token";
import * as i3 from "@angular/router";
export class AngularTokenService {
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
            uid: headers.get('uid'),
            provider: headers.get('provider')
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
            uid: data['uid'],
            provider: data['provider']
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
            uid: this.localStorage.getItem('uid'),
            provider: this.localStorage.getItem('provider')
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
                uid: queryParams['uid'],
                provider: queryParams['provider']
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
            if (authData.provider) {
                this.localStorage.setItem('provider', authData.provider);
            }
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
/** @nocollapse */ AngularTokenService.ngInjectableDef = i0.defineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(i0.inject(i1.HttpClient), i0.inject(i2.ANGULAR_TOKEN_OPTIONS), i0.inject(i0.PLATFORM_ID), i0.inject(i3.ActivatedRoute, 8), i0.inject(i3.Router, 8)); }, token: AngularTokenService, providedIn: "root" });
if (false) {
    /** @type {?} */
    AngularTokenService.prototype.options;
    /** @type {?} */
    AngularTokenService.prototype.userType;
    /** @type {?} */
    AngularTokenService.prototype.authData;
    /** @type {?} */
    AngularTokenService.prototype.userData;
    /** @type {?} */
    AngularTokenService.prototype.global;
    /** @type {?} */
    AngularTokenService.prototype.localStorage;
    /** @type {?} */
    AngularTokenService.prototype.http;
    /** @type {?} */
    AngularTokenService.prototype.platformId;
    /** @type {?} */
    AngularTokenService.prototype.activatedRoute;
    /** @type {?} */
    AngularTokenService.prototype.router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci10b2tlbi8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQWUsTUFBTSxpQkFBaUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFbkQsT0FBTyxFQUFjLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWhFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7OztBQW1COUQsTUFBTSxPQUFPLG1CQUFtQjs7Ozs7Ozs7SUFrQzlCLFlBQ1UsSUFBZ0IsRUFDTyxNQUFXLEVBQ2IsVUFBa0IsRUFDM0IsY0FBOEIsRUFDOUIsTUFBYztRQUoxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBRUssZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUMzQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFDOUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQVA1QixpQkFBWSxHQUFrQixFQUFFLENBQUM7UUFTdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUU1RCxJQUFJLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFF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LG9CQUFvQjtlQUNwQyxJQUFJLENBQUMsT0FBTyxLQUFLLGFBQWE7ZUFDOUIsSUFBSSxDQUFDLE9BQU8sS0FBSyxxQkFBcUIsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQzs7Ozs7Ozs7O0lBVU8saUJBQWlCLENBQUMsSUFBWTtRQUNwQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO1lBQ2xELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FDaEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FDbkMsQ0FBQztJQUNKLENBQUM7OztZQXRrQkYsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25COzs7O1lBeEJRLFVBQVU7NENBNkRkLE1BQU0sU0FBQyxxQkFBcUI7WUFDWSxNQUFNLHVCQUE5QyxNQUFNLFNBQUMsV0FBVztZQS9EZCxjQUFjLHVCQWdFbEIsUUFBUTtZQWhFWSxNQUFNLHVCQWlFMUIsUUFBUTs7Ozs7SUFiWCxzQ0FBcUM7O0lBQ3JDLHVDQUEyQjs7SUFDM0IsdUNBQTJCOztJQUMzQix1Q0FBMkI7O0lBQzNCLHFDQUE2Qjs7SUFFN0IsMkNBQXlDOztJQUd2QyxtQ0FBd0I7O0lBRXhCLHlDQUErQzs7SUFDL0MsNkNBQWtEOztJQUNsRCxxQ0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCwgSW5qZWN0LCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciwgQ2FuQWN0aXZhdGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tRXZlbnQsIGludGVydmFsIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBwbHVjaywgZmlsdGVyLCBzaGFyZSwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmltcG9ydCB7XG4gIFNpZ25JbkRhdGEsXG4gIFJlZ2lzdGVyRGF0YSxcbiAgVXBkYXRlUGFzc3dvcmREYXRhLFxuICBSZXNldFBhc3N3b3JkRGF0YSxcblxuICBVc2VyVHlwZSxcbiAgVXNlckRhdGEsXG4gIEF1dGhEYXRhLFxuXG4gIEFuZ3VsYXJUb2tlbk9wdGlvbnMsXG4gIEdsb2JhbE9wdGlvbnNcbn0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlblNlcnZpY2UgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG5cbiAgZ2V0IGN1cnJlbnRVc2VyVHlwZSgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZXJUeXBlLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRVc2VyRGF0YSgpOiBVc2VyRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMudXNlckRhdGE7XG4gIH1cblxuICBnZXQgY3VycmVudEF1dGhEYXRhKCk6IEF1dGhEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5hdXRoRGF0YTtcbiAgfVxuXG4gIGdldCBhcGlCYXNlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hcGlCYXNlO1xuICB9XG5cbiAgZ2V0IGdsb2JhbE9wdGlvbnMoKTogR2xvYmFsT3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5nbG9iYWxPcHRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuICBwcml2YXRlIHVzZXJUeXBlOiBVc2VyVHlwZTtcbiAgcHJpdmF0ZSBhdXRoRGF0YTogQXV0aERhdGE7XG4gIHByaXZhdGUgdXNlckRhdGE6IFVzZXJEYXRhO1xuICBwcml2YXRlIGdsb2JhbDogV2luZG93IHwgYW55O1xuXG4gIHByaXZhdGUgbG9jYWxTdG9yYWdlOiBTdG9yYWdlIHwgYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoQU5HVUxBUl9UT0tFTl9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJvdXRlcjogUm91dGVyXG4gICkge1xuICAgIHRoaXMuZ2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIocGxhdGZvcm1JZCkpIHtcbiAgICAgIHRoaXMuZ2xvYmFsID0ge1xuICAgICAgICBvcGVuOiAoKSA9PiBudWxsLFxuICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgIGhyZWY6ICcvJyxcbiAgICAgICAgICBvcmlnaW46ICcvJ1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtID0gKCkgPT4gbnVsbDtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0gPSAoKSA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSA9ICgpID0+IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zID0ge1xuICAgICAgYXBpUGF0aDogICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBhcGlCYXNlOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcblxuICAgICAgc2lnbkluUGF0aDogICAgICAgICAgICAgICAgICdhdXRoL3NpZ25faW4nLFxuICAgICAgc2lnbkluUmVkaXJlY3Q6ICAgICAgICAgICAgIG51bGwsXG4gICAgICBzaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5OiAgbnVsbCxcblxuICAgICAgc2lnbk91dFBhdGg6ICAgICAgICAgICAgICAgICdhdXRoL3NpZ25fb3V0JyxcbiAgICAgIHZhbGlkYXRlVG9rZW5QYXRoOiAgICAgICAgICAnYXV0aC92YWxpZGF0ZV90b2tlbicsXG4gICAgICBzaWduT3V0RmFpbGVkVmFsaWRhdGU6ICAgICAgZmFsc2UsXG5cbiAgICAgIHJlZ2lzdGVyQWNjb3VudFBhdGg6ICAgICAgICAnYXV0aCcsXG4gICAgICBkZWxldGVBY2NvdW50UGF0aDogICAgICAgICAgJ2F1dGgnLFxuICAgICAgcmVnaXN0ZXJBY2NvdW50Q2FsbGJhY2s6ICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIHVwZGF0ZVBhc3N3b3JkUGF0aDogICAgICAgICAnYXV0aCcsXG5cbiAgICAgIHJlc2V0UGFzc3dvcmRQYXRoOiAgICAgICAgICAnYXV0aC9wYXNzd29yZCcsXG4gICAgICByZXNldFBhc3N3b3JkQ2FsbGJhY2s6ICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXNlclR5cGVzOiAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBsb2dpbkZpZWxkOiAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcblxuICAgICAgb0F1dGhCYXNlOiAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLm9yaWdpbixcbiAgICAgIG9BdXRoUGF0aHM6IHtcbiAgICAgICAgZ2l0aHViOiAgICAgICAgICAgICAgICAgICAnYXV0aC9naXRodWInXG4gICAgICB9LFxuICAgICAgb0F1dGhDYWxsYmFja1BhdGg6ICAgICAgICAgICdvYXV0aF9jYWxsYmFjaycsXG4gICAgICBvQXV0aFdpbmRvd1R5cGU6ICAgICAgICAgICAgJ25ld1dpbmRvdycsXG4gICAgICBvQXV0aFdpbmRvd09wdGlvbnM6ICAgICAgICAgbnVsbCxcblxuICAgICAgZ2xvYmFsT3B0aW9uczoge1xuICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBtZXJnZWRPcHRpb25zID0gKDxhbnk+T2JqZWN0KS5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIGNvbmZpZyk7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VkT3B0aW9ucztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS53YXJuKGBbYW5ndWxhci10b2tlbl0gWW91IGhhdmUgbm90IGNvbmZpZ3VyZWQgJ2FwaUJhc2UnLCB3aGljaCBtYXkgcmVzdWx0IGluIHNlY3VyaXR5IGlzc3Vlcy4gYCArXG4gICAgICAgICAgICAgICAgICAgYFBsZWFzZSByZWZlciB0byB0aGUgZG9jdW1lbnRhdGlvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vbmVyb25pYWt5L2FuZ3VsYXItdG9rZW4vd2lraWApO1xuICAgIH1cblxuICAgIHRoaXMudHJ5TG9hZEF1dGhEYXRhKCk7XG4gIH1cblxuICBzZXRHbG9iYWxPcHRpb25zKG9wdGlvbnM6IEdsb2JhbE9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMuZ2xvYmFsT3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICB1c2VyU2lnbmVkSW4oKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gISF0aGlzLmF1dGhEYXRhO1xuICB9XG5cbiAgY2FuQWN0aXZhdGUocm91dGUsIHN0YXRlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudXNlclNpZ25lZEluKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdG9yZSBjdXJyZW50IGxvY2F0aW9uIGluIHN0b3JhZ2UgKHVzZWZ1bGwgZm9yIHJlZGlyZWN0aW9uIGFmdGVyIHNpZ25pbmcgaW4pXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSxcbiAgICAgICAgICBzdGF0ZS51cmxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdXNlciB0byBzaWduIGluIGlmIHNpZ25JblJlZGlyZWN0IGlzIHNldFxuICAgICAgaWYgKHRoaXMucm91dGVyICYmIHRoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBBY3Rpb25zXG4gICAqXG4gICAqL1xuXG4gIC8vIFJlZ2lzdGVyIHJlcXVlc3RcbiAgcmVnaXN0ZXJBY2NvdW50KHJlZ2lzdGVyRGF0YTogUmVnaXN0ZXJEYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHJlZ2lzdGVyRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHJlZ2lzdGVyRGF0YSk7XG5cbiAgICBpZiAocmVnaXN0ZXJEYXRhLnVzZXJUeXBlID09IG51bGwpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZWdpc3RlckRhdGEudXNlclR5cGUpO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS51c2VyVHlwZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID09IG51bGwgJiZcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbiAhPSBudWxsXG4gICAgKSB7XG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID0gcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dpbiA9IHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIHJlZ2lzdGVyRGF0YVt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF0gPSBsb2dpbjtcblxuICAgIHJlZ2lzdGVyRGF0YS5jb25maXJtX3N1Y2Nlc3NfdXJsID0gdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudENhbGxiYWNrO1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudFBhdGgsIHJlZ2lzdGVyRGF0YSk7XG4gIH1cblxuICAvLyBEZWxldGUgQWNjb3VudFxuICBkZWxldGVBY2NvdW50KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuZGVsZXRlQWNjb3VudFBhdGgpO1xuICB9XG5cbiAgLy8gU2lnbiBpbiByZXF1ZXN0IGFuZCBzZXQgc3RvcmFnZVxuICBzaWduSW4oc2lnbkluRGF0YTogU2lnbkluRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgdGhpcy51c2VyVHlwZSA9IChzaWduSW5EYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUoc2lnbkluRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogc2lnbkluRGF0YS5sb2dpbixcbiAgICAgIHBhc3N3b3JkOiBzaWduSW5EYXRhLnBhc3N3b3JkXG4gICAgfTtcblxuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25JblBhdGgsIGJvZHksIHsgb2JzZXJ2ZTogJ3Jlc3BvbnNlJyB9KS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShyZXMgPT4gdGhpcy51c2VyRGF0YSA9IHJlcy5ib2R5WydkYXRhJ10pO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIHNpZ25Jbk9BdXRoKG9BdXRoVHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwYXJhbXM/OiB7IFtrZXk6c3RyaW5nXTogc3RyaW5nOyB9KSB7XG5cbiAgICBjb25zdCBvQXV0aFBhdGg6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhQYXRoKG9BdXRoVHlwZSk7XG4gICAgY29uc3QgY2FsbGJhY2tVcmwgPSBgJHt0aGlzLmdsb2JhbC5sb2NhdGlvbi5vcmlnaW59LyR7dGhpcy5vcHRpb25zLm9BdXRoQ2FsbGJhY2tQYXRofWA7XG4gICAgY29uc3Qgb0F1dGhXaW5kb3dUeXBlOiBzdHJpbmcgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dUeXBlO1xuICAgIGNvbnN0IGF1dGhVcmw6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhVcmwoXG4gICAgICBvQXV0aFBhdGgsXG4gICAgICBjYWxsYmFja1VybCxcbiAgICAgIG9BdXRoV2luZG93VHlwZSxcbiAgICAgIHBhcmFtc1xuICAgICk7XG5cbiAgICBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnbmV3V2luZG93Jykge1xuICAgICAgY29uc3Qgb0F1dGhXaW5kb3dPcHRpb25zID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93T3B0aW9ucztcbiAgICAgIGxldCB3aW5kb3dPcHRpb25zID0gJyc7XG5cbiAgICAgIGlmIChvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIHdpbmRvd09wdGlvbnMgKz0gYCwke2tleX09JHtvQXV0aFdpbmRvd09wdGlvbnNba2V5XX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwb3B1cCA9IHdpbmRvdy5vcGVuKFxuICAgICAgICAgIGF1dGhVcmwsXG4gICAgICAgICAgJ19ibGFuaycsXG4gICAgICAgICAgYGNsb3NlYnV0dG9uY2FwdGlvbj1DYW5jZWwke3dpbmRvd09wdGlvbnN9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3RDcmVkZW50aWFsc1ZpYVBvc3RNZXNzYWdlKHBvcHVwKTtcbiAgICB9IGVsc2UgaWYgKG9BdXRoV2luZG93VHlwZSA9PT0gJ3NhbWVXaW5kb3cnKSB7XG4gICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmID0gYXV0aFVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvQXV0aFdpbmRvd1R5cGUgXCIke29BdXRoV2luZG93VHlwZX1cImApO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NPQXV0aENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gIH1cblxuICAvLyBTaWduIG91dCByZXF1ZXN0IGFuZCBkZWxldGUgc3RvcmFnZVxuICBzaWduT3V0KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmRlbGV0ZTxhbnk+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25PdXRQYXRoKVxuXHQgIC8vIE9ubHkgcmVtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYW5kIGNsZWFyIHRoZSBkYXRhIGFmdGVyIHRoZSBjYWxsXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWNjZXNzVG9rZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjbGllbnQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdleHBpcnknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlblR5cGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1aWQnKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYXV0aERhdGEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0b2tlbiByZXF1ZXN0XG4gIHZhbGlkYXRlVG9rZW4oKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAuZ2V0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnZhbGlkYXRlVG9rZW5QYXRoKS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIChyZXMpID0+IHRoaXMudXNlckRhdGEgPSByZXNbJ2RhdGEnXSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDEgJiYgdGhpcy5vcHRpb25zLnNpZ25PdXRGYWlsZWRWYWxpZGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbk91dCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgLy8gVXBkYXRlIHBhc3N3b3JkIHJlcXVlc3RcbiAgdXBkYXRlUGFzc3dvcmQodXBkYXRlUGFzc3dvcmREYXRhOiBVcGRhdGVQYXNzd29yZERhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUpO1xuICAgIH1cblxuICAgIGxldCBhcmdzOiBhbnk7XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCA9PSBudWxsKSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncyA9IHtcbiAgICAgICAgY3VycmVudF9wYXNzd29yZDogICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCxcbiAgICAgICAgcGFzc3dvcmQ6ICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkLFxuICAgICAgICBwYXNzd29yZF9jb25maXJtYXRpb246ICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDb25maXJtYXRpb25cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW4pIHtcbiAgICAgIGFyZ3MucmVzZXRfcGFzc3dvcmRfdG9rZW4gPSB1cGRhdGVQYXNzd29yZERhdGEucmVzZXRQYXNzd29yZFRva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSBhcmdzO1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnVwZGF0ZVBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuICAvLyBSZXNldCBwYXNzd29yZCByZXF1ZXN0XG4gIHJlc2V0UGFzc3dvcmQocmVzZXRQYXNzd29yZERhdGE6IFJlc2V0UGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHRoaXMudXNlclR5cGUgPSAocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogcmVzZXRQYXNzd29yZERhdGEubG9naW4sXG4gICAgICByZWRpcmVjdF91cmw6IHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIENvbnN0cnVjdCBQYXRocyAvIFVybHNcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSBnZXRVc2VyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy51c2VyVHlwZSA9PSBudWxsKSA/ICcnIDogdGhpcy51c2VyVHlwZS5wYXRoICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBcGlQYXRoKCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbnN0cnVjdGVkUGF0aCA9ICcnO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpQmFzZSArICcvJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaVBhdGggIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlQYXRoICsgJy8nO1xuICAgIH1cblxuICAgIHJldHVybiBjb25zdHJ1Y3RlZFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBcGlQYXRoKCkgKyB0aGlzLmdldFVzZXJQYXRoKCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoUGF0aChvQXV0aFR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IG9BdXRoUGF0aDogc3RyaW5nO1xuXG4gICAgb0F1dGhQYXRoID0gdGhpcy5vcHRpb25zLm9BdXRoUGF0aHNbb0F1dGhUeXBlXTtcblxuICAgIGlmIChvQXV0aFBhdGggPT0gbnVsbCkge1xuICAgICAgb0F1dGhQYXRoID0gYC9hdXRoLyR7b0F1dGhUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9BdXRoUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhVcmwob0F1dGhQYXRoOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tVcmw6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzogeyBba2V5OnN0cmluZ106IHN0cmluZzsgfSk6IHN0cmluZyB7XG4gICAgbGV0IHVybDogc3RyaW5nO1xuXG4gICAgdXJsID0gICBgJHt0aGlzLm9wdGlvbnMub0F1dGhCYXNlfS8ke29BdXRoUGF0aH1gO1xuICAgIHVybCArPSAgYD9vbW5pYXV0aF93aW5kb3dfdHlwZT0ke3dpbmRvd1R5cGV9YDtcbiAgICB1cmwgKz0gIGAmYXV0aF9vcmlnaW5fdXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNhbGxiYWNrVXJsKX1gO1xuXG4gICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdXJsICs9IGAmcmVzb3VyY2VfY2xhc3M9JHt0aGlzLnVzZXJUeXBlLm5hbWV9YDtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgIHVybCArPSBgJiR7a2V5fT0ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXNba2V5XSl9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogR2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBUcnkgdG8gbG9hZCBhdXRoIGRhdGFcbiAgcHJpdmF0ZSB0cnlMb2FkQXV0aERhdGEoKTogdm9pZCB7XG5cbiAgICBjb25zdCB1c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlclR5cGUnKSk7XG5cbiAgICBpZiAodXNlclR5cGUpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSB1c2VyVHlwZTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIGlmICh0aGlzLmFjdGl2YXRlZFJvdXRlKSB7XG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBhcmFtcygpO1xuICAgIH1cblxuICAgIC8vIGlmICh0aGlzLmF1dGhEYXRhKSB7XG4gICAgLy8gICAgIHRoaXMudmFsaWRhdGVUb2tlbigpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHB1YmxpYyBnZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBoZWFkZXJzID0gZGF0YS5oZWFkZXJzO1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGhlYWRlcnMuZ2V0KCdhY2Nlc3MtdG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICBoZWFkZXJzLmdldCgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgaGVhZGVycy5nZXQoJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIGhlYWRlcnMuZ2V0KCd0b2tlbi10eXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgaGVhZGVycy5nZXQoJ3VpZCcpLFxuICAgICAgcHJvdmlkZXI6ICAgICAgIGhlYWRlcnMuZ2V0KCdwcm92aWRlcicpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcG9zdCBtZXNzYWdlXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGRhdGFbJ2F1dGhfdG9rZW4nXSxcbiAgICAgIGNsaWVudDogICAgICAgICBkYXRhWydjbGllbnRfaWQnXSxcbiAgICAgIGV4cGlyeTogICAgICAgICBkYXRhWydleHBpcnknXSxcbiAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgIHVpZDogICAgICAgICAgICBkYXRhWyd1aWQnXSxcbiAgICAgIHByb3ZpZGVyOiAgICAgICBkYXRhWydwcm92aWRlciddXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSBzdG9yYWdlLlxuICBwdWJsaWMgZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY2Nlc3NUb2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuVHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VpZCcpLFxuICAgICAgcHJvdmlkZXI6ICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Byb3ZpZGVyJylcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgIHRoaXMuYXV0aERhdGEgPSBhdXRoRGF0YTtcbiAgICB9XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHVybCBwYXJhbWV0ZXJzLlxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBhcmFtcygpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZShxdWVyeVBhcmFtcyA9PiB7XG4gICAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiAgICBxdWVyeVBhcmFtc1sndG9rZW4nXSB8fCBxdWVyeVBhcmFtc1snYXV0aF90b2tlbiddLFxuICAgICAgICBjbGllbnQ6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2NsaWVudF9pZCddLFxuICAgICAgICBleHBpcnk6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2V4cGlyeSddLFxuICAgICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICAgIHVpZDogICAgICAgICAgICBxdWVyeVBhcmFtc1sndWlkJ10sXG4gICAgICAgIHByb3ZpZGVyOiAgICAgICBxdWVyeVBhcmFtc1sncHJvdmlkZXInXVxuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gV3JpdGUgYXV0aCBkYXRhIHRvIHN0b3JhZ2VcbiAgcHJpdmF0ZSBzZXRBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhY2Nlc3NUb2tlbicsIGF1dGhEYXRhLmFjY2Vzc1Rva2VuKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2NsaWVudCcsIGF1dGhEYXRhLmNsaWVudCk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleHBpcnknLCBhdXRoRGF0YS5leHBpcnkpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW5UeXBlJywgYXV0aERhdGEudG9rZW5UeXBlKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VpZCcsIGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgIGlmIChhdXRoRGF0YS5wcm92aWRlcikge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwcm92aWRlcicsIGF1dGhEYXRhLnByb3ZpZGVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyVHlwZScsIHRoaXMudXNlclR5cGUubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVmFsaWRhdGUgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIENoZWNrIGlmIGF1dGggZGF0YSBjb21wbGV0ZSBhbmQgaWYgcmVzcG9uc2UgdG9rZW4gaXMgbmV3ZXJcbiAgcHJpdmF0ZSBjaGVja0F1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKFxuICAgICAgYXV0aERhdGEuYWNjZXNzVG9rZW4gIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuY2xpZW50ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmV4cGlyeSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS50b2tlblR5cGUgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudWlkICE9IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmF1dGhEYXRhICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF1dGhEYXRhLmV4cGlyeSA+PSB0aGlzLmF1dGhEYXRhLmV4cGlyeTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogT0F1dGhcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSByZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShhdXRoV2luZG93OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHBvbGxlck9ic2VydiA9IGludGVydmFsKDUwMCk7XG5cbiAgICBjb25zdCByZXNwb25zZU9ic2VydiA9IGZyb21FdmVudCh0aGlzLmdsb2JhbCwgJ21lc3NhZ2UnKS5waXBlKFxuICAgICAgcGx1Y2soJ2RhdGEnKSxcbiAgICAgIGZpbHRlcih0aGlzLm9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIpXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlU3Vic2NyaXB0aW9uID0gcmVzcG9uc2VPYnNlcnYuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKTtcblxuICAgIGNvbnN0IHBvbGxlclN1YnNjcmlwdGlvbiA9IHBvbGxlck9ic2Vydi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKGF1dGhXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgIHBvbGxlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXV0aFdpbmRvdy5wb3N0TWVzc2FnZSgncmVxdWVzdENyZWRlbnRpYWxzJywgJyonKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXNwb25zZU9ic2VydjtcbiAgfVxuXG4gIHByaXZhdGUgb0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcihkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmIChkYXRhLm1lc3NhZ2UgPT09ICdkZWxpdmVyQ3JlZGVudGlhbHMnXG4gICAgICB8fCBkYXRhLm1lc3NhZ2UgPT09ICdhdXRoRmFpbHVyZSdcbiAgICAgIHx8IGRhdGEubWVzc2FnZSA9PT0gJ2RlbGl2ZXJQcm92aWRlckF1dGgnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBVdGlsaXRpZXNcbiAgICpcbiAgICovXG5cbiAgLy8gTWF0Y2ggdXNlciBjb25maWcgYnkgdXNlciBjb25maWcgbmFtZVxuICBwcml2YXRlIGdldFVzZXJUeXBlQnlOYW1lKG5hbWU6IHN0cmluZyk6IFVzZXJUeXBlIHtcbiAgICBpZiAobmFtZSA9PSBudWxsIHx8IHRoaXMub3B0aW9ucy51c2VyVHlwZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VyVHlwZXMuZmluZChcbiAgICAgIHVzZXJUeXBlID0+IHVzZXJUeXBlLm5hbWUgPT09IG5hbWVcbiAgICApO1xuICB9XG59XG4iXX0=