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
var AngularTokenService = /** @class */ (function () {
    function AngularTokenService(http, config, platformId, activatedRoute, router) {
        this.http = http;
        this.platformId = platformId;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.localStorage = {};
        this.global = (typeof window !== 'undefined') ? window : {};
        if (isPlatformServer(platformId)) {
            this.global = {
                open: function () { return null; },
                location: {
                    href: '/',
                    origin: '/'
                }
            };
            this.localStorage.setItem = function () { return null; };
            this.localStorage.getItem = function () { return null; };
            this.localStorage.removeItem = function () { return null; };
        }
        else {
            this.localStorage = localStorage;
        }
        /** @type {?} */
        var defaultOptions = {
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
        var mergedOptions = ((/** @type {?} */ (Object))).assign(defaultOptions, config);
        this.options = mergedOptions;
        if (this.options.apiBase === null) {
            console.warn("[angular-token] You have not configured 'apiBase', which may result in security issues. " +
                "Please refer to the documentation at https://github.com/neroniaky/angular-token/wiki");
        }
        this.tryLoadAuthData();
    }
    Object.defineProperty(AngularTokenService.prototype, "currentUserType", {
        get: /**
         * @return {?}
         */
        function () {
            if (this.userType != null) {
                return this.userType.name;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "currentUserData", {
        get: /**
         * @return {?}
         */
        function () {
            return this.userData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "currentAuthData", {
        get: /**
         * @return {?}
         */
        function () {
            return this.authData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "apiBase", {
        get: /**
         * @return {?}
         */
        function () {
            return this.options.apiBase;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    AngularTokenService.prototype.userSignedIn = /**
     * @return {?}
     */
    function () {
        return !!this.authData;
    };
    /**
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    AngularTokenService.prototype.canActivate = /**
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    function (route, state) {
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
    };
    /**
     *
     * Actions
     *
     */
    // Register request
    /**
     *
     * Actions
     *
     * @param {?} registerData
     * @return {?}
     */
    // Register request
    AngularTokenService.prototype.registerAccount = /**
     *
     * Actions
     *
     * @param {?} registerData
     * @return {?}
     */
    // Register request
    function (registerData) {
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
        var login = registerData.login;
        delete registerData.login;
        registerData[this.options.loginField] = login;
        registerData.confirm_success_url = this.options.registerAccountCallback;
        return this.http.post(this.getServerPath() + this.options.registerAccountPath, registerData);
    };
    // Delete Account
    // Delete Account
    /**
     * @return {?}
     */
    AngularTokenService.prototype.deleteAccount = 
    // Delete Account
    /**
     * @return {?}
     */
    function () {
        return this.http.delete(this.getServerPath() + this.options.deleteAccountPath);
    };
    // Sign in request and set storage
    // Sign in request and set storage
    /**
     * @param {?} signInData
     * @return {?}
     */
    AngularTokenService.prototype.signIn = 
    // Sign in request and set storage
    /**
     * @param {?} signInData
     * @return {?}
     */
    function (signInData) {
        var _this = this;
        var _a;
        this.userType = (signInData.userType == null) ? null : this.getUserTypeByName(signInData.userType);
        /** @type {?} */
        var body = (_a = {},
            _a[this.options.loginField] = signInData.login,
            _a.password = signInData.password,
            _a);
        /** @type {?} */
        var observ = this.http.post(this.getServerPath() + this.options.signInPath, body, { observe: 'response' }).pipe(share());
        observ.subscribe(function (res) { return _this.userData = res.body['data']; });
        return observ;
    };
    /**
     * @param {?} oAuthType
     * @param {?=} params
     * @return {?}
     */
    AngularTokenService.prototype.signInOAuth = /**
     * @param {?} oAuthType
     * @param {?=} params
     * @return {?}
     */
    function (oAuthType, params) {
        /** @type {?} */
        var oAuthPath = this.getOAuthPath(oAuthType);
        /** @type {?} */
        var callbackUrl = this.global.location.origin + "/" + this.options.oAuthCallbackPath;
        /** @type {?} */
        var oAuthWindowType = this.options.oAuthWindowType;
        /** @type {?} */
        var authUrl = this.getOAuthUrl(oAuthPath, callbackUrl, oAuthWindowType, params);
        if (oAuthWindowType === 'newWindow') {
            /** @type {?} */
            var oAuthWindowOptions = this.options.oAuthWindowOptions;
            /** @type {?} */
            var windowOptions = '';
            if (oAuthWindowOptions) {
                for (var key in oAuthWindowOptions) {
                    if (oAuthWindowOptions.hasOwnProperty(key)) {
                        windowOptions += "," + key + "=" + oAuthWindowOptions[key];
                    }
                }
            }
            /** @type {?} */
            var popup = window.open(authUrl, '_blank', "closebuttoncaption=Cancel" + windowOptions);
            return this.requestCredentialsViaPostMessage(popup);
        }
        else if (oAuthWindowType === 'sameWindow') {
            this.global.location.href = authUrl;
        }
        else {
            throw new Error("Unsupported oAuthWindowType \"" + oAuthWindowType + "\"");
        }
    };
    /**
     * @return {?}
     */
    AngularTokenService.prototype.processOAuthCallback = /**
     * @return {?}
     */
    function () {
        this.getAuthDataFromParams();
    };
    // Sign out request and delete storage
    // Sign out request and delete storage
    /**
     * @return {?}
     */
    AngularTokenService.prototype.signOut = 
    // Sign out request and delete storage
    /**
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var observ = this.http.delete(this.getServerPath() + this.options.signOutPath)
            // Only remove the localStorage and clear the data after the call
            .pipe(finalize(function () {
            _this.localStorage.removeItem('accessToken');
            _this.localStorage.removeItem('client');
            _this.localStorage.removeItem('expiry');
            _this.localStorage.removeItem('tokenType');
            _this.localStorage.removeItem('uid');
            _this.authData = null;
            _this.userType = null;
            _this.userData = null;
        }));
        return observ;
    };
    // Validate token request
    // Validate token request
    /**
     * @return {?}
     */
    AngularTokenService.prototype.validateToken = 
    // Validate token request
    /**
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(share());
        observ.subscribe(function (res) { return _this.userData = res['data']; }, function (error) {
            if (error.status === 401 && _this.options.signOutFailedValidate) {
                _this.signOut();
            }
        });
        return observ;
    };
    // Update password request
    // Update password request
    /**
     * @param {?} updatePasswordData
     * @return {?}
     */
    AngularTokenService.prototype.updatePassword = 
    // Update password request
    /**
     * @param {?} updatePasswordData
     * @return {?}
     */
    function (updatePasswordData) {
        if (updatePasswordData.userType != null) {
            this.userType = this.getUserTypeByName(updatePasswordData.userType);
        }
        /** @type {?} */
        var args;
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
        var body = args;
        return this.http.put(this.getServerPath() + this.options.updatePasswordPath, body);
    };
    // Reset password request
    // Reset password request
    /**
     * @param {?} resetPasswordData
     * @return {?}
     */
    AngularTokenService.prototype.resetPassword = 
    // Reset password request
    /**
     * @param {?} resetPasswordData
     * @return {?}
     */
    function (resetPasswordData) {
        var _a;
        this.userType = (resetPasswordData.userType == null) ? null : this.getUserTypeByName(resetPasswordData.userType);
        /** @type {?} */
        var body = (_a = {},
            _a[this.options.loginField] = resetPasswordData.login,
            _a.redirect_url = this.options.resetPasswordCallback,
            _a);
        return this.http.post(this.getServerPath() + this.options.resetPasswordPath, body);
    };
    /**
     *
     * Construct Paths / Urls
     *
     */
    /**
     *
     * Construct Paths / Urls
     *
     * @return {?}
     */
    AngularTokenService.prototype.getUserPath = /**
     *
     * Construct Paths / Urls
     *
     * @return {?}
     */
    function () {
        return (this.userType == null) ? '' : this.userType.path + '/';
    };
    /**
     * @return {?}
     */
    AngularTokenService.prototype.getApiPath = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var constructedPath = '';
        if (this.options.apiBase != null) {
            constructedPath += this.options.apiBase + '/';
        }
        if (this.options.apiPath != null) {
            constructedPath += this.options.apiPath + '/';
        }
        return constructedPath;
    };
    /**
     * @return {?}
     */
    AngularTokenService.prototype.getServerPath = /**
     * @return {?}
     */
    function () {
        return this.getApiPath() + this.getUserPath();
    };
    /**
     * @param {?} oAuthType
     * @return {?}
     */
    AngularTokenService.prototype.getOAuthPath = /**
     * @param {?} oAuthType
     * @return {?}
     */
    function (oAuthType) {
        /** @type {?} */
        var oAuthPath;
        oAuthPath = this.options.oAuthPaths[oAuthType];
        if (oAuthPath == null) {
            oAuthPath = "/auth/" + oAuthType;
        }
        return oAuthPath;
    };
    /**
     * @param {?} oAuthPath
     * @param {?} callbackUrl
     * @param {?} windowType
     * @param {?=} params
     * @return {?}
     */
    AngularTokenService.prototype.getOAuthUrl = /**
     * @param {?} oAuthPath
     * @param {?} callbackUrl
     * @param {?} windowType
     * @param {?=} params
     * @return {?}
     */
    function (oAuthPath, callbackUrl, windowType, params) {
        /** @type {?} */
        var url;
        url = this.options.oAuthBase + "/" + oAuthPath;
        url += "?omniauth_window_type=" + windowType;
        url += "&auth_origin_url=" + encodeURIComponent(callbackUrl);
        if (this.userType != null) {
            url += "&resource_class=" + this.userType.name;
        }
        if (params) {
            for (var key in params) {
                url += "&" + key + "=" + encodeURIComponent(params[key]);
            }
        }
        return url;
    };
    /**
     *
     * Get Auth Data
     *
     */
    // Try to load auth data
    /**
     *
     * Get Auth Data
     *
     * @return {?}
     */
    // Try to load auth data
    AngularTokenService.prototype.tryLoadAuthData = /**
     *
     * Get Auth Data
     *
     * @return {?}
     */
    // Try to load auth data
    function () {
        /** @type {?} */
        var userType = this.getUserTypeByName(this.localStorage.getItem('userType'));
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
    };
    // Parse Auth data from response
    // Parse Auth data from response
    /**
     * @param {?} data
     * @return {?}
     */
    AngularTokenService.prototype.getAuthHeadersFromResponse = 
    // Parse Auth data from response
    /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        /** @type {?} */
        var headers = data.headers;
        /** @type {?} */
        var authData = {
            accessToken: headers.get('access-token'),
            client: headers.get('client'),
            expiry: headers.get('expiry'),
            tokenType: headers.get('token-type'),
            uid: headers.get('uid')
        };
        this.setAuthData(authData);
    };
    // Parse Auth data from post message
    // Parse Auth data from post message
    /**
     * @param {?} data
     * @return {?}
     */
    AngularTokenService.prototype.getAuthDataFromPostMessage = 
    // Parse Auth data from post message
    /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        /** @type {?} */
        var authData = {
            accessToken: data['auth_token'],
            client: data['client_id'],
            expiry: data['expiry'],
            tokenType: 'Bearer',
            uid: data['uid']
        };
        this.setAuthData(authData);
    };
    // Try to get auth data from storage.
    // Try to get auth data from storage.
    /**
     * @return {?}
     */
    AngularTokenService.prototype.getAuthDataFromStorage = 
    // Try to get auth data from storage.
    /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var authData = {
            accessToken: this.localStorage.getItem('accessToken'),
            client: this.localStorage.getItem('client'),
            expiry: this.localStorage.getItem('expiry'),
            tokenType: this.localStorage.getItem('tokenType'),
            uid: this.localStorage.getItem('uid')
        };
        if (this.checkAuthData(authData)) {
            this.authData = authData;
        }
    };
    // Try to get auth data from url parameters.
    // Try to get auth data from url parameters.
    /**
     * @return {?}
     */
    AngularTokenService.prototype.getAuthDataFromParams = 
    // Try to get auth data from url parameters.
    /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.activatedRoute.queryParams.subscribe(function (queryParams) {
            /** @type {?} */
            var authData = {
                accessToken: queryParams['token'] || queryParams['auth_token'],
                client: queryParams['client_id'],
                expiry: queryParams['expiry'],
                tokenType: 'Bearer',
                uid: queryParams['uid']
            };
            if (_this.checkAuthData(authData)) {
                _this.authData = authData;
            }
        });
    };
    /**
     *
     * Set Auth Data
     *
     */
    // Write auth data to storage
    /**
     *
     * Set Auth Data
     *
     * @param {?} authData
     * @return {?}
     */
    // Write auth data to storage
    AngularTokenService.prototype.setAuthData = /**
     *
     * Set Auth Data
     *
     * @param {?} authData
     * @return {?}
     */
    // Write auth data to storage
    function (authData) {
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
    };
    /**
     *
     * Validate Auth Data
     *
     */
    // Check if auth data complete and if response token is newer
    /**
     *
     * Validate Auth Data
     *
     * @param {?} authData
     * @return {?}
     */
    // Check if auth data complete and if response token is newer
    AngularTokenService.prototype.checkAuthData = /**
     *
     * Validate Auth Data
     *
     * @param {?} authData
     * @return {?}
     */
    // Check if auth data complete and if response token is newer
    function (authData) {
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
    };
    /**
     *
     * OAuth
     *
     */
    /**
     *
     * OAuth
     *
     * @param {?} authWindow
     * @return {?}
     */
    AngularTokenService.prototype.requestCredentialsViaPostMessage = /**
     *
     * OAuth
     *
     * @param {?} authWindow
     * @return {?}
     */
    function (authWindow) {
        /** @type {?} */
        var pollerObserv = interval(500);
        /** @type {?} */
        var responseObserv = fromEvent(this.global, 'message').pipe(pluck('data'), filter(this.oAuthWindowResponseFilter));
        /** @type {?} */
        var responseSubscription = responseObserv.subscribe(this.getAuthDataFromPostMessage.bind(this));
        /** @type {?} */
        var pollerSubscription = pollerObserv.subscribe(function () {
            if (authWindow.closed) {
                pollerSubscription.unsubscribe();
            }
            else {
                authWindow.postMessage('requestCredentials', '*');
            }
        });
        return responseObserv;
    };
    /**
     * @param {?} data
     * @return {?}
     */
    AngularTokenService.prototype.oAuthWindowResponseFilter = /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        if (data.message === 'deliverCredentials'
            || data.message === 'authFailure'
            || data.message === 'deliverProviderAuth') {
            return data;
        }
    };
    /**
     *
     * Utilities
     *
     */
    // Match user config by user config name
    /**
     *
     * Utilities
     *
     * @param {?} name
     * @return {?}
     */
    // Match user config by user config name
    AngularTokenService.prototype.getUserTypeByName = /**
     *
     * Utilities
     *
     * @param {?} name
     * @return {?}
     */
    // Match user config by user config name
    function (name) {
        if (name == null || this.options.userTypes == null) {
            return null;
        }
        return this.options.userTypes.find(function (userType) { return userType.name === name; });
    };
    AngularTokenService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root',
                },] }
    ];
    /** @nocollapse */
    AngularTokenService.ctorParameters = function () { return [
        { type: HttpClient },
        { type: undefined, decorators: [{ type: Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
        { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
        { type: ActivatedRoute, decorators: [{ type: Optional }] },
        { type: Router, decorators: [{ type: Optional }] }
    ]; };
    /** @nocollapse */ AngularTokenService.ngInjectableDef = i0.defineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(i0.inject(i1.HttpClient), i0.inject(i2.ANGULAR_TOKEN_OPTIONS), i0.inject(i0.PLATFORM_ID), i0.inject(i3.ActivatedRoute, 8), i0.inject(i3.Router, 8)); }, token: AngularTokenService, providedIn: "root" });
    return AngularTokenService;
}());
export { AngularTokenService };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci10b2tlbi8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQWUsTUFBTSxpQkFBaUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFbkQsT0FBTyxFQUFjLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWhFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7OztBQWU5RDtJQWlDRSw2QkFDVSxJQUFnQixFQUNPLE1BQVcsRUFDYixVQUFrQixFQUMzQixjQUE4QixFQUM5QixNQUFjO1FBSjFCLFNBQUksR0FBSixJQUFJLENBQVk7UUFFSyxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQzNCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBUDVCLGlCQUFZLEdBQWtCLEVBQUUsQ0FBQztRQVN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRTVELElBQUksZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FB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Ozs7OztJQUVPLHVEQUF5Qjs7OztJQUFqQyxVQUFrQyxJQUFTO1FBQ3pDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxvQkFBb0I7ZUFDcEMsSUFBSSxDQUFDLE9BQU8sS0FBSyxhQUFhO2VBQzlCLElBQUksQ0FBQyxPQUFPLEtBQUsscUJBQXFCLEVBQUU7WUFDM0MsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFHRDs7OztPQUlHO0lBRUgsd0NBQXdDOzs7Ozs7Ozs7SUFDaEMsK0NBQWlCOzs7Ozs7OztJQUF6QixVQUEwQixJQUFZO1FBQ3BDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDbEQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNoQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUF0QixDQUFzQixDQUNuQyxDQUFDO0lBQ0osQ0FBQzs7Z0JBcGpCRixVQUFVLFNBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25COzs7O2dCQXZCUSxVQUFVO2dEQXdEZCxNQUFNLFNBQUMscUJBQXFCO2dCQUNZLE1BQU0sdUJBQTlDLE1BQU0sU0FBQyxXQUFXO2dCQTFEZCxjQUFjLHVCQTJEbEIsUUFBUTtnQkEzRFksTUFBTSx1QkE0RDFCLFFBQVE7Ozs4QkE3RGI7Q0E0a0JDLEFBcmpCRCxJQXFqQkM7U0FsakJZLG1CQUFtQjs7O0lBc0I5QixzQ0FBcUM7O0lBQ3JDLHVDQUEyQjs7SUFDM0IsdUNBQTJCOztJQUMzQix1Q0FBMkI7O0lBQzNCLHFDQUE2Qjs7SUFFN0IsMkNBQXlDOztJQUd2QyxtQ0FBd0I7O0lBRXhCLHlDQUErQzs7SUFDL0MsNkNBQWtEOztJQUNsRCxxQ0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCwgSW5qZWN0LCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciwgQ2FuQWN0aXZhdGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tRXZlbnQsIGludGVydmFsIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBwbHVjaywgZmlsdGVyLCBzaGFyZSwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmltcG9ydCB7XG4gIFNpZ25JbkRhdGEsXG4gIFJlZ2lzdGVyRGF0YSxcbiAgVXBkYXRlUGFzc3dvcmREYXRhLFxuICBSZXNldFBhc3N3b3JkRGF0YSxcblxuICBVc2VyVHlwZSxcbiAgVXNlckRhdGEsXG4gIEF1dGhEYXRhLFxuXG4gIEFuZ3VsYXJUb2tlbk9wdGlvbnNcbn0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlblNlcnZpY2UgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG5cbiAgZ2V0IGN1cnJlbnRVc2VyVHlwZSgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZXJUeXBlLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRVc2VyRGF0YSgpOiBVc2VyRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMudXNlckRhdGE7XG4gIH1cblxuICBnZXQgY3VycmVudEF1dGhEYXRhKCk6IEF1dGhEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5hdXRoRGF0YTtcbiAgfVxuXG4gIGdldCBhcGlCYXNlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hcGlCYXNlO1xuICB9XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuICBwcml2YXRlIHVzZXJUeXBlOiBVc2VyVHlwZTtcbiAgcHJpdmF0ZSBhdXRoRGF0YTogQXV0aERhdGE7XG4gIHByaXZhdGUgdXNlckRhdGE6IFVzZXJEYXRhO1xuICBwcml2YXRlIGdsb2JhbDogV2luZG93IHwgYW55O1xuXG4gIHByaXZhdGUgbG9jYWxTdG9yYWdlOiBTdG9yYWdlIHwgYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoQU5HVUxBUl9UT0tFTl9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJvdXRlcjogUm91dGVyXG4gICkge1xuICAgIHRoaXMuZ2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIocGxhdGZvcm1JZCkpIHtcbiAgICAgIHRoaXMuZ2xvYmFsID0ge1xuICAgICAgICBvcGVuOiAoKSA9PiBudWxsLFxuICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgIGhyZWY6ICcvJyxcbiAgICAgICAgICBvcmlnaW46ICcvJ1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtID0gKCkgPT4gbnVsbDtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0gPSAoKSA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSA9ICgpID0+IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zID0ge1xuICAgICAgYXBpUGF0aDogICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBhcGlCYXNlOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcblxuICAgICAgc2lnbkluUGF0aDogICAgICAgICAgICAgICAgICdhdXRoL3NpZ25faW4nLFxuICAgICAgc2lnbkluUmVkaXJlY3Q6ICAgICAgICAgICAgIG51bGwsXG4gICAgICBzaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5OiAgbnVsbCxcblxuICAgICAgc2lnbk91dFBhdGg6ICAgICAgICAgICAgICAgICdhdXRoL3NpZ25fb3V0JyxcbiAgICAgIHZhbGlkYXRlVG9rZW5QYXRoOiAgICAgICAgICAnYXV0aC92YWxpZGF0ZV90b2tlbicsXG4gICAgICBzaWduT3V0RmFpbGVkVmFsaWRhdGU6ICAgICAgZmFsc2UsXG5cbiAgICAgIHJlZ2lzdGVyQWNjb3VudFBhdGg6ICAgICAgICAnYXV0aCcsXG4gICAgICBkZWxldGVBY2NvdW50UGF0aDogICAgICAgICAgJ2F1dGgnLFxuICAgICAgcmVnaXN0ZXJBY2NvdW50Q2FsbGJhY2s6ICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIHVwZGF0ZVBhc3N3b3JkUGF0aDogICAgICAgICAnYXV0aCcsXG5cbiAgICAgIHJlc2V0UGFzc3dvcmRQYXRoOiAgICAgICAgICAnYXV0aC9wYXNzd29yZCcsXG4gICAgICByZXNldFBhc3N3b3JkQ2FsbGJhY2s6ICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXNlclR5cGVzOiAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBsb2dpbkZpZWxkOiAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcblxuICAgICAgb0F1dGhCYXNlOiAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLm9yaWdpbixcbiAgICAgIG9BdXRoUGF0aHM6IHtcbiAgICAgICAgZ2l0aHViOiAgICAgICAgICAgICAgICAgICAnYXV0aC9naXRodWInXG4gICAgICB9LFxuICAgICAgb0F1dGhDYWxsYmFja1BhdGg6ICAgICAgICAgICdvYXV0aF9jYWxsYmFjaycsXG4gICAgICBvQXV0aFdpbmRvd1R5cGU6ICAgICAgICAgICAgJ25ld1dpbmRvdycsXG4gICAgICBvQXV0aFdpbmRvd09wdGlvbnM6ICAgICAgICAgbnVsbCxcbiAgICB9O1xuXG4gICAgY29uc3QgbWVyZ2VkT3B0aW9ucyA9ICg8YW55Pk9iamVjdCkuYXNzaWduKGRlZmF1bHRPcHRpb25zLCBjb25maWcpO1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlZE9wdGlvbnM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaUJhc2UgPT09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW2FuZ3VsYXItdG9rZW5dIFlvdSBoYXZlIG5vdCBjb25maWd1cmVkICdhcGlCYXNlJywgd2hpY2ggbWF5IHJlc3VsdCBpbiBzZWN1cml0eSBpc3N1ZXMuIGAgK1xuICAgICAgICAgICAgICAgICAgIGBQbGVhc2UgcmVmZXIgdG8gdGhlIGRvY3VtZW50YXRpb24gYXQgaHR0cHM6Ly9naXRodWIuY29tL25lcm9uaWFreS9hbmd1bGFyLXRva2VuL3dpa2lgKTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUxvYWRBdXRoRGF0YSgpO1xuICB9XG5cbiAgdXNlclNpZ25lZEluKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICEhdGhpcy5hdXRoRGF0YTtcbiAgfVxuXG4gIGNhbkFjdGl2YXRlKHJvdXRlLCBzdGF0ZSk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnVzZXJTaWduZWRJbigpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RvcmUgY3VycmVudCBsb2NhdGlvbiBpbiBzdG9yYWdlICh1c2VmdWxsIGZvciByZWRpcmVjdGlvbiBhZnRlciBzaWduaW5nIGluKVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5KSB7XG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgdGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXksXG4gICAgICAgICAgc3RhdGUudXJsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZGlyZWN0IHVzZXIgdG8gc2lnbiBpbiBpZiBzaWduSW5SZWRpcmVjdCBpcyBzZXRcbiAgICAgIGlmICh0aGlzLnJvdXRlciAmJiB0aGlzLm9wdGlvbnMuc2lnbkluUmVkaXJlY3QpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdF0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogQWN0aW9uc1xuICAgKlxuICAgKi9cblxuICAvLyBSZWdpc3RlciByZXF1ZXN0XG4gIHJlZ2lzdGVyQWNjb3VudChyZWdpc3RlckRhdGE6IFJlZ2lzdGVyRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG5cbiAgICByZWdpc3RlckRhdGEgPSBPYmplY3QuYXNzaWduKHt9LCByZWdpc3RlckRhdGEpO1xuXG4gICAgaWYgKHJlZ2lzdGVyRGF0YS51c2VyVHlwZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUocmVnaXN0ZXJEYXRhLnVzZXJUeXBlKTtcbiAgICAgIGRlbGV0ZSByZWdpc3RlckRhdGEudXNlclR5cGU7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkX2NvbmZpcm1hdGlvbiA9PSBudWxsICYmXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRDb25maXJtYXRpb24gIT0gbnVsbFxuICAgICkge1xuICAgICAgcmVnaXN0ZXJEYXRhLnBhc3N3b3JkX2NvbmZpcm1hdGlvbiA9IHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICAgIGRlbGV0ZSByZWdpc3RlckRhdGEucGFzc3dvcmRDb25maXJtYXRpb247XG4gICAgfVxuXG4gICAgY29uc3QgbG9naW4gPSByZWdpc3RlckRhdGEubG9naW47XG4gICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICByZWdpc3RlckRhdGFbdGhpcy5vcHRpb25zLmxvZ2luRmllbGRdID0gbG9naW47XG5cbiAgICByZWdpc3RlckRhdGEuY29uZmlybV9zdWNjZXNzX3VybCA9IHRoaXMub3B0aW9ucy5yZWdpc3RlckFjY291bnRDYWxsYmFjaztcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5yZWdpc3RlckFjY291bnRQYXRoLCByZWdpc3RlckRhdGEpO1xuICB9XG5cbiAgLy8gRGVsZXRlIEFjY291bnRcbiAgZGVsZXRlQWNjb3VudCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZGVsZXRlKHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLmRlbGV0ZUFjY291bnRQYXRoKTtcbiAgfVxuXG4gIC8vIFNpZ24gaW4gcmVxdWVzdCBhbmQgc2V0IHN0b3JhZ2VcbiAgc2lnbkluKHNpZ25JbkRhdGE6IFNpZ25JbkRhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHRoaXMudXNlclR5cGUgPSAoc2lnbkluRGF0YS51c2VyVHlwZSA9PSBudWxsKSA/IG51bGwgOiB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHNpZ25JbkRhdGEudXNlclR5cGUpO1xuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIFt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF06IHNpZ25JbkRhdGEubG9naW4sXG4gICAgICBwYXNzd29yZDogc2lnbkluRGF0YS5wYXNzd29yZFxuICAgIH07XG5cbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAucG9zdCh0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5zaWduSW5QYXRoLCBib2R5LCB7IG9ic2VydmU6ICdyZXNwb25zZScgfSkucGlwZShzaGFyZSgpKTtcblxuICAgIG9ic2Vydi5zdWJzY3JpYmUocmVzID0+IHRoaXMudXNlckRhdGEgPSByZXMuYm9keVsnZGF0YSddKTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICBzaWduSW5PQXV0aChvQXV0aFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcGFyYW1zPzogeyBba2V5OnN0cmluZ106IHN0cmluZzsgfSkge1xuXG4gICAgY29uc3Qgb0F1dGhQYXRoOiBzdHJpbmcgPSB0aGlzLmdldE9BdXRoUGF0aChvQXV0aFR5cGUpO1xuICAgIGNvbnN0IGNhbGxiYWNrVXJsID0gYCR7dGhpcy5nbG9iYWwubG9jYXRpb24ub3JpZ2lufS8ke3RoaXMub3B0aW9ucy5vQXV0aENhbGxiYWNrUGF0aH1gO1xuICAgIGNvbnN0IG9BdXRoV2luZG93VHlwZTogc3RyaW5nID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93VHlwZTtcbiAgICBjb25zdCBhdXRoVXJsOiBzdHJpbmcgPSB0aGlzLmdldE9BdXRoVXJsKFxuICAgICAgb0F1dGhQYXRoLFxuICAgICAgY2FsbGJhY2tVcmwsXG4gICAgICBvQXV0aFdpbmRvd1R5cGUsXG4gICAgICBwYXJhbXNcbiAgICApO1xuXG4gICAgaWYgKG9BdXRoV2luZG93VHlwZSA9PT0gJ25ld1dpbmRvdycpIHtcbiAgICAgIGNvbnN0IG9BdXRoV2luZG93T3B0aW9ucyA9IHRoaXMub3B0aW9ucy5vQXV0aFdpbmRvd09wdGlvbnM7XG4gICAgICBsZXQgd2luZG93T3B0aW9ucyA9ICcnO1xuXG4gICAgICBpZiAob0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9BdXRoV2luZG93T3B0aW9ucykge1xuICAgICAgICAgIGlmIChvQXV0aFdpbmRvd09wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICB3aW5kb3dPcHRpb25zICs9IGAsJHtrZXl9PSR7b0F1dGhXaW5kb3dPcHRpb25zW2tleV19YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9wdXAgPSB3aW5kb3cub3BlbihcbiAgICAgICAgICBhdXRoVXJsLFxuICAgICAgICAgICdfYmxhbmsnLFxuICAgICAgICAgIGBjbG9zZWJ1dHRvbmNhcHRpb249Q2FuY2VsJHt3aW5kb3dPcHRpb25zfWBcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShwb3B1cCk7XG4gICAgfSBlbHNlIGlmIChvQXV0aFdpbmRvd1R5cGUgPT09ICdzYW1lV2luZG93Jykge1xuICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZiA9IGF1dGhVcmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgb0F1dGhXaW5kb3dUeXBlIFwiJHtvQXV0aFdpbmRvd1R5cGV9XCJgKTtcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzT0F1dGhDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBhcmFtcygpO1xuICB9XG5cbiAgLy8gU2lnbiBvdXQgcmVxdWVzdCBhbmQgZGVsZXRlIHN0b3JhZ2VcbiAgc2lnbk91dCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5kZWxldGU8YW55Pih0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5zaWduT3V0UGF0aClcblx0ICAvLyBPbmx5IHJlbW92ZSB0aGUgbG9jYWxTdG9yYWdlIGFuZCBjbGVhciB0aGUgZGF0YSBhZnRlciB0aGUgY2FsbFxuICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgZmluYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FjY2Vzc1Rva2VuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY2xpZW50Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZXhwaXJ5Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW5UeXBlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndWlkJyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmF1dGhEYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJUeXBlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJEYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgdG9rZW4gcmVxdWVzdFxuICB2YWxpZGF0ZVRva2VuKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmdldCh0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy52YWxpZGF0ZVRva2VuUGF0aCkucGlwZShzaGFyZSgpKTtcblxuICAgIG9ic2Vydi5zdWJzY3JpYmUoXG4gICAgICAocmVzKSA9PiB0aGlzLnVzZXJEYXRhID0gcmVzWydkYXRhJ10sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PT0gNDAxICYmIHRoaXMub3B0aW9ucy5zaWduT3V0RmFpbGVkVmFsaWRhdGUpIHtcbiAgICAgICAgICB0aGlzLnNpZ25PdXQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIC8vIFVwZGF0ZSBwYXNzd29yZCByZXF1ZXN0XG4gIHVwZGF0ZVBhc3N3b3JkKHVwZGF0ZVBhc3N3b3JkRGF0YTogVXBkYXRlUGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy51c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodXBkYXRlUGFzc3dvcmREYXRhLnVzZXJUeXBlKTtcbiAgICB9XG5cbiAgICBsZXQgYXJnczogYW55O1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZEN1cnJlbnQgPT0gbnVsbCkge1xuICAgICAgYXJncyA9IHtcbiAgICAgICAgcGFzc3dvcmQ6ICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkLFxuICAgICAgICBwYXNzd29yZF9jb25maXJtYXRpb246ICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDb25maXJtYXRpb25cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3MgPSB7XG4gICAgICAgIGN1cnJlbnRfcGFzc3dvcmQ6ICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZEN1cnJlbnQsXG4gICAgICAgIHBhc3N3b3JkOiAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZCxcbiAgICAgICAgcGFzc3dvcmRfY29uZmlybWF0aW9uOiAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEucmVzZXRQYXNzd29yZFRva2VuKSB7XG4gICAgICBhcmdzLnJlc2V0X3Bhc3N3b3JkX3Rva2VuID0gdXBkYXRlUGFzc3dvcmREYXRhLnJlc2V0UGFzc3dvcmRUb2tlbjtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gYXJncztcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dCh0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy51cGRhdGVQYXNzd29yZFBhdGgsIGJvZHkpO1xuICB9XG5cbiAgLy8gUmVzZXQgcGFzc3dvcmQgcmVxdWVzdFxuICByZXNldFBhc3N3b3JkKHJlc2V0UGFzc3dvcmREYXRhOiBSZXNldFBhc3N3b3JkRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG5cbiAgICB0aGlzLnVzZXJUeXBlID0gKHJlc2V0UGFzc3dvcmREYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUpO1xuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIFt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF06IHJlc2V0UGFzc3dvcmREYXRhLmxvZ2luLFxuICAgICAgcmVkaXJlY3RfdXJsOiB0aGlzLm9wdGlvbnMucmVzZXRQYXNzd29yZENhbGxiYWNrXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBDb25zdHJ1Y3QgUGF0aHMgLyBVcmxzXG4gICAqXG4gICAqL1xuXG4gIHByaXZhdGUgZ2V0VXNlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMudXNlclR5cGUgPT0gbnVsbCkgPyAnJyA6IHRoaXMudXNlclR5cGUucGF0aCArICcvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXBpUGF0aCgpOiBzdHJpbmcge1xuICAgIGxldCBjb25zdHJ1Y3RlZFBhdGggPSAnJztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSAhPSBudWxsKSB7XG4gICAgICBjb25zdHJ1Y3RlZFBhdGggKz0gdGhpcy5vcHRpb25zLmFwaUJhc2UgKyAnLyc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlQYXRoICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpUGF0aCArICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gY29uc3RydWN0ZWRQYXRoO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXJ2ZXJQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXBpUGF0aCgpICsgdGhpcy5nZXRVc2VyUGF0aCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPQXV0aFBhdGgob0F1dGhUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBvQXV0aFBhdGg6IHN0cmluZztcblxuICAgIG9BdXRoUGF0aCA9IHRoaXMub3B0aW9ucy5vQXV0aFBhdGhzW29BdXRoVHlwZV07XG5cbiAgICBpZiAob0F1dGhQYXRoID09IG51bGwpIHtcbiAgICAgIG9BdXRoUGF0aCA9IGAvYXV0aC8ke29BdXRoVHlwZX1gO1xuICAgIH1cblxuICAgIHJldHVybiBvQXV0aFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoVXJsKG9BdXRoUGF0aDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrVXJsOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93VHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcz86IHsgW2tleTpzdHJpbmddOiBzdHJpbmc7IH0pOiBzdHJpbmcge1xuICAgIGxldCB1cmw6IHN0cmluZztcblxuICAgIHVybCA9ICAgYCR7dGhpcy5vcHRpb25zLm9BdXRoQmFzZX0vJHtvQXV0aFBhdGh9YDtcbiAgICB1cmwgKz0gIGA/b21uaWF1dGhfd2luZG93X3R5cGU9JHt3aW5kb3dUeXBlfWA7XG4gICAgdXJsICs9ICBgJmF1dGhfb3JpZ2luX3VybD0ke2VuY29kZVVSSUNvbXBvbmVudChjYWxsYmFja1VybCl9YDtcblxuICAgIGlmICh0aGlzLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgIHVybCArPSBgJnJlc291cmNlX2NsYXNzPSR7dGhpcy51c2VyVHlwZS5uYW1lfWA7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgZm9yIChsZXQga2V5IGluIHBhcmFtcykge1xuICAgICAgICB1cmwgKz0gYCYke2tleX09JHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zW2tleV0pfWA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIEdldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gVHJ5IHRvIGxvYWQgYXV0aCBkYXRhXG4gIHByaXZhdGUgdHJ5TG9hZEF1dGhEYXRhKCk6IHZvaWQge1xuXG4gICAgY29uc3QgdXNlclR5cGUgPSB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJUeXBlJykpO1xuXG4gICAgaWYgKHVzZXJUeXBlKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdXNlclR5cGU7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk7XG5cbiAgICBpZiAodGhpcy5hY3RpdmF0ZWRSb3V0ZSkge1xuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21QYXJhbXMoKTtcbiAgICB9XG5cbiAgICAvLyBpZiAodGhpcy5hdXRoRGF0YSkge1xuICAgIC8vICAgICB0aGlzLnZhbGlkYXRlVG9rZW4oKTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSByZXNwb25zZVxuICBwdWJsaWMgZ2V0QXV0aEhlYWRlcnNGcm9tUmVzcG9uc2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgaGVhZGVycyA9IGRhdGEuaGVhZGVycztcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICBoZWFkZXJzLmdldCgnYWNjZXNzLXRva2VuJyksXG4gICAgICBjbGllbnQ6ICAgICAgICAgaGVhZGVycy5nZXQoJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIGhlYWRlcnMuZ2V0KCdleHBpcnknKSxcbiAgICAgIHRva2VuVHlwZTogICAgICBoZWFkZXJzLmdldCgndG9rZW4tdHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIGhlYWRlcnMuZ2V0KCd1aWQnKVxuICAgIH07XG5cbiAgICB0aGlzLnNldEF1dGhEYXRhKGF1dGhEYXRhKTtcbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHBvc3QgbWVzc2FnZVxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBvc3RNZXNzYWdlKGRhdGE6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICBkYXRhWydhdXRoX3Rva2VuJ10sXG4gICAgICBjbGllbnQ6ICAgICAgICAgZGF0YVsnY2xpZW50X2lkJ10sXG4gICAgICBleHBpcnk6ICAgICAgICAgZGF0YVsnZXhwaXJ5J10sXG4gICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICB1aWQ6ICAgICAgICAgICAgZGF0YVsndWlkJ11cbiAgICB9O1xuXG4gICAgdGhpcy5zZXRBdXRoRGF0YShhdXRoRGF0YSk7XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHN0b3JhZ2UuXG4gIHB1YmxpYyBnZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk6IHZvaWQge1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FjY2Vzc1Rva2VuJyksXG4gICAgICBjbGllbnQ6ICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhwaXJ5JyksXG4gICAgICB0b2tlblR5cGU6ICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW5UeXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndWlkJylcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgIHRoaXMuYXV0aERhdGEgPSBhdXRoRGF0YTtcbiAgICB9XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHVybCBwYXJhbWV0ZXJzLlxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBhcmFtcygpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZShxdWVyeVBhcmFtcyA9PiB7XG4gICAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiAgICBxdWVyeVBhcmFtc1sndG9rZW4nXSB8fCBxdWVyeVBhcmFtc1snYXV0aF90b2tlbiddLFxuICAgICAgICBjbGllbnQ6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2NsaWVudF9pZCddLFxuICAgICAgICBleHBpcnk6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2V4cGlyeSddLFxuICAgICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICAgIHVpZDogICAgICAgICAgICBxdWVyeVBhcmFtc1sndWlkJ11cbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmNoZWNrQXV0aERhdGEoYXV0aERhdGEpKSB7XG4gICAgICAgIHRoaXMuYXV0aERhdGEgPSBhdXRoRGF0YTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBTZXQgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIFdyaXRlIGF1dGggZGF0YSB0byBzdG9yYWdlXG4gIHByaXZhdGUgc2V0QXV0aERhdGEoYXV0aERhdGE6IEF1dGhEYXRhKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcblxuICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhY2Nlc3NUb2tlbicsIGF1dGhEYXRhLmFjY2Vzc1Rva2VuKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2NsaWVudCcsIGF1dGhEYXRhLmNsaWVudCk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleHBpcnknLCBhdXRoRGF0YS5leHBpcnkpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW5UeXBlJywgYXV0aERhdGEudG9rZW5UeXBlKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VpZCcsIGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgIGlmICh0aGlzLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlclR5cGUnLCB0aGlzLnVzZXJUeXBlLm5hbWUpO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVmFsaWRhdGUgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIENoZWNrIGlmIGF1dGggZGF0YSBjb21wbGV0ZSBhbmQgaWYgcmVzcG9uc2UgdG9rZW4gaXMgbmV3ZXJcbiAgcHJpdmF0ZSBjaGVja0F1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKFxuICAgICAgYXV0aERhdGEuYWNjZXNzVG9rZW4gIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuY2xpZW50ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmV4cGlyeSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS50b2tlblR5cGUgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudWlkICE9IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmF1dGhEYXRhICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF1dGhEYXRhLmV4cGlyeSA+PSB0aGlzLmF1dGhEYXRhLmV4cGlyeTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogT0F1dGhcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSByZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShhdXRoV2luZG93OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHBvbGxlck9ic2VydiA9IGludGVydmFsKDUwMCk7XG5cbiAgICBjb25zdCByZXNwb25zZU9ic2VydiA9IGZyb21FdmVudCh0aGlzLmdsb2JhbCwgJ21lc3NhZ2UnKS5waXBlKFxuICAgICAgcGx1Y2soJ2RhdGEnKSxcbiAgICAgIGZpbHRlcih0aGlzLm9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIpXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlU3Vic2NyaXB0aW9uID0gcmVzcG9uc2VPYnNlcnYuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKTtcblxuICAgIGNvbnN0IHBvbGxlclN1YnNjcmlwdGlvbiA9IHBvbGxlck9ic2Vydi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKGF1dGhXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgIHBvbGxlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXV0aFdpbmRvdy5wb3N0TWVzc2FnZSgncmVxdWVzdENyZWRlbnRpYWxzJywgJyonKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXNwb25zZU9ic2VydjtcbiAgfVxuXG4gIHByaXZhdGUgb0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcihkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmIChkYXRhLm1lc3NhZ2UgPT09ICdkZWxpdmVyQ3JlZGVudGlhbHMnXG4gICAgICB8fCBkYXRhLm1lc3NhZ2UgPT09ICdhdXRoRmFpbHVyZSdcbiAgICAgIHx8IGRhdGEubWVzc2FnZSA9PT0gJ2RlbGl2ZXJQcm92aWRlckF1dGgnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBVdGlsaXRpZXNcbiAgICpcbiAgICovXG5cbiAgLy8gTWF0Y2ggdXNlciBjb25maWcgYnkgdXNlciBjb25maWcgbmFtZVxuICBwcml2YXRlIGdldFVzZXJUeXBlQnlOYW1lKG5hbWU6IHN0cmluZyk6IFVzZXJUeXBlIHtcbiAgICBpZiAobmFtZSA9PSBudWxsIHx8IHRoaXMub3B0aW9ucy51c2VyVHlwZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VyVHlwZXMuZmluZChcbiAgICAgIHVzZXJUeXBlID0+IHVzZXJUeXBlLm5hbWUgPT09IG5hbWVcbiAgICApO1xuICB9XG59XG4iXX0=