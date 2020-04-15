(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/router'), require('@angular/common/http'), require('@angular/common'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('angular-token', ['exports', '@angular/core', '@angular/router', '@angular/common/http', '@angular/common', 'rxjs', 'rxjs/operators'], factory) :
    (factory((global['angular-token'] = {}),global.ng.core,global.ng.router,global.ng.common.http,global.ng.common,global.rxjs,global.rxjs.operators));
}(this, (function (exports,i0,i3,i1,common,rxjs,operators) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */
    /** @type {?} */
    var ANGULAR_TOKEN_OPTIONS = new i0.InjectionToken('ANGULAR_TOKEN_OPTIONS');

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */
    var AngularTokenService = /** @class */ (function () {
        function AngularTokenService(http, config, platformId, activatedRoute, router) {
            this.http = http;
            this.platformId = platformId;
            this.activatedRoute = activatedRoute;
            this.router = router;
            this.localStorage = {};
            this.global = (typeof window !== 'undefined') ? window : {};
            if (common.isPlatformServer(platformId)) {
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
                globalOptions: {
                    headers: {}
                }
            };
            /** @type {?} */
            var mergedOptions = (( /** @type {?} */(Object))).assign(defaultOptions, config);
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
             */ function () {
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
             */ function () {
                return this.userData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AngularTokenService.prototype, "currentAuthData", {
            get: /**
             * @return {?}
             */ function () {
                return this.authData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AngularTokenService.prototype, "apiBase", {
            get: /**
             * @return {?}
             */ function () {
                return this.options.apiBase;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AngularTokenService.prototype, "globalOptions", {
            get: /**
             * @return {?}
             */ function () {
                return this.options.globalOptions;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {?} options
         * @return {?}
         */
        AngularTokenService.prototype.setGlobalOptions = /**
         * @param {?} options
         * @return {?}
         */
            function (options) {
                this.options.globalOptions = options;
            };
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
                var observ = this.http.post(this.getServerPath() + this.options.signInPath, body, { observe: 'response' }).pipe(operators.share());
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
                    .pipe(operators.finalize(function () {
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
                var observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(operators.share());
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
                    uid: headers.get('uid'),
                    provider: headers.get('provider')
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
                    uid: data['uid'],
                    provider: data['provider']
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
                    uid: this.localStorage.getItem('uid'),
                    provider: this.localStorage.getItem('provider')
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
                        uid: queryParams['uid'],
                        provider: queryParams['provider']
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
                    if (authData.provider) {
                        this.localStorage.setItem('provider', authData.provider);
                    }
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
                var pollerObserv = rxjs.interval(500);
                /** @type {?} */
                var responseObserv = rxjs.fromEvent(this.global, 'message').pipe(operators.pluck('data'), operators.filter(this.oAuthWindowResponseFilter));
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
            { type: i0.Injectable, args: [{
                        providedIn: 'root',
                    },] }
        ];
        /** @nocollapse */
        AngularTokenService.ctorParameters = function () {
            return [
                { type: i1.HttpClient },
                { type: undefined, decorators: [{ type: i0.Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
                { type: Object, decorators: [{ type: i0.Inject, args: [i0.PLATFORM_ID,] }] },
                { type: i3.ActivatedRoute, decorators: [{ type: i0.Optional }] },
                { type: i3.Router, decorators: [{ type: i0.Optional }] }
            ];
        };
        /** @nocollapse */ AngularTokenService.ngInjectableDef = i0.defineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(i0.inject(i1.HttpClient), i0.inject(ANGULAR_TOKEN_OPTIONS), i0.inject(i0.PLATFORM_ID), i0.inject(i3.ActivatedRoute, 8), i0.inject(i3.Router, 8)); }, token: AngularTokenService, providedIn: "root" });
        return AngularTokenService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */
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
                return next.handle(req).pipe(operators.tap(function (res) { return _this.handleResponse(res); }, function (err) { return _this.handleResponse(err); }));
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
                if (res instanceof i1.HttpResponse || res instanceof i1.HttpErrorResponse) {
                    if (this.tokenService.apiBase === null || (res.url && res.url.match(this.tokenService.apiBase))) {
                        this.tokenService.getAuthHeadersFromResponse(( /** @type {?} */(res)));
                    }
                }
            };
        AngularTokenInterceptor.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AngularTokenInterceptor.ctorParameters = function () {
            return [
                { type: AngularTokenService }
            ];
        };
        return AngularTokenInterceptor;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */
    var AngularTokenModule = /** @class */ (function () {
        function AngularTokenModule(parentModule) {
            if (parentModule) {
                throw new Error('AngularToken is already loaded. It should only be imported in your application\'s main module.');
            }
        }
        /**
         * @param {?} options
         * @return {?}
         */
        AngularTokenModule.forRoot = /**
         * @param {?} options
         * @return {?}
         */
            function (options) {
                return {
                    ngModule: AngularTokenModule,
                    providers: [
                        {
                            provide: i1.HTTP_INTERCEPTORS,
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
            };
        AngularTokenModule.decorators = [
            { type: i0.NgModule }
        ];
        /** @nocollapse */
        AngularTokenModule.ctorParameters = function () {
            return [
                { type: AngularTokenModule, decorators: [{ type: i0.Optional }, { type: i0.SkipSelf }] }
            ];
        };
        return AngularTokenModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */

    exports.ANGULAR_TOKEN_OPTIONS = ANGULAR_TOKEN_OPTIONS;
    exports.AngularTokenService = AngularTokenService;
    exports.AngularTokenModule = AngularTokenModule;
    exports.ɵb = AngularTokenInterceptor;
    exports.ɵa = AngularTokenService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi51bWQuanMubWFwIiwic291cmNlcyI6WyJuZzovL2FuZ3VsYXItdG9rZW4vbGliL2FuZ3VsYXItdG9rZW4udG9rZW4udHMiLCJuZzovL2FuZ3VsYXItdG9rZW4vbGliL2FuZ3VsYXItdG9rZW4uc2VydmljZS50cyIsIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyIsIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0aW9uVG9rZW4gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNvbnN0IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbignQU5HVUxBUl9UT0tFTl9PUFRJT05TJyk7XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCwgSW5qZWN0LCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciwgQ2FuQWN0aXZhdGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tRXZlbnQsIGludGVydmFsIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBwbHVjaywgZmlsdGVyLCBzaGFyZSwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmltcG9ydCB7XG4gIFNpZ25JbkRhdGEsXG4gIFJlZ2lzdGVyRGF0YSxcbiAgVXBkYXRlUGFzc3dvcmREYXRhLFxuICBSZXNldFBhc3N3b3JkRGF0YSxcblxuICBVc2VyVHlwZSxcbiAgVXNlckRhdGEsXG4gIEF1dGhEYXRhLFxuXG4gIEFuZ3VsYXJUb2tlbk9wdGlvbnMsXG4gIEdsb2JhbE9wdGlvbnNcbn0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlblNlcnZpY2UgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG5cbiAgZ2V0IGN1cnJlbnRVc2VyVHlwZSgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZXJUeXBlLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRVc2VyRGF0YSgpOiBVc2VyRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMudXNlckRhdGE7XG4gIH1cblxuICBnZXQgY3VycmVudEF1dGhEYXRhKCk6IEF1dGhEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5hdXRoRGF0YTtcbiAgfVxuXG4gIGdldCBhcGlCYXNlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hcGlCYXNlO1xuICB9XG5cbiAgZ2V0IGdsb2JhbE9wdGlvbnMoKTogR2xvYmFsT3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5nbG9iYWxPcHRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuICBwcml2YXRlIHVzZXJUeXBlOiBVc2VyVHlwZTtcbiAgcHJpdmF0ZSBhdXRoRGF0YTogQXV0aERhdGE7XG4gIHByaXZhdGUgdXNlckRhdGE6IFVzZXJEYXRhO1xuICBwcml2YXRlIGdsb2JhbDogV2luZG93IHwgYW55O1xuXG4gIHByaXZhdGUgbG9jYWxTdG9yYWdlOiBTdG9yYWdlIHwgYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoQU5HVUxBUl9UT0tFTl9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJvdXRlcjogUm91dGVyXG4gICkge1xuICAgIHRoaXMuZ2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIocGxhdGZvcm1JZCkpIHtcbiAgICAgIHRoaXMuZ2xvYmFsID0ge1xuICAgICAgICBvcGVuOiAoKSA9PiBudWxsLFxuICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgIGhyZWY6ICcvJyxcbiAgICAgICAgICBvcmlnaW46ICcvJ1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtID0gKCkgPT4gbnVsbDtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0gPSAoKSA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSA9ICgpID0+IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zID0ge1xuICAgICAgYXBpUGF0aDogICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBhcGlCYXNlOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcblxuICAgICAgc2lnbkluUGF0aDogICAgICAgICAgICAgICAgICdhdXRoL3NpZ25faW4nLFxuICAgICAgc2lnbkluUmVkaXJlY3Q6ICAgICAgICAgICAgIG51bGwsXG4gICAgICBzaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5OiAgbnVsbCxcblxuICAgICAgc2lnbk91dFBhdGg6ICAgICAgICAgICAgICAgICdhdXRoL3NpZ25fb3V0JyxcbiAgICAgIHZhbGlkYXRlVG9rZW5QYXRoOiAgICAgICAgICAnYXV0aC92YWxpZGF0ZV90b2tlbicsXG4gICAgICBzaWduT3V0RmFpbGVkVmFsaWRhdGU6ICAgICAgZmFsc2UsXG5cbiAgICAgIHJlZ2lzdGVyQWNjb3VudFBhdGg6ICAgICAgICAnYXV0aCcsXG4gICAgICBkZWxldGVBY2NvdW50UGF0aDogICAgICAgICAgJ2F1dGgnLFxuICAgICAgcmVnaXN0ZXJBY2NvdW50Q2FsbGJhY2s6ICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIHVwZGF0ZVBhc3N3b3JkUGF0aDogICAgICAgICAnYXV0aCcsXG5cbiAgICAgIHJlc2V0UGFzc3dvcmRQYXRoOiAgICAgICAgICAnYXV0aC9wYXNzd29yZCcsXG4gICAgICByZXNldFBhc3N3b3JkQ2FsbGJhY2s6ICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXNlclR5cGVzOiAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBsb2dpbkZpZWxkOiAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcblxuICAgICAgb0F1dGhCYXNlOiAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLm9yaWdpbixcbiAgICAgIG9BdXRoUGF0aHM6IHtcbiAgICAgICAgZ2l0aHViOiAgICAgICAgICAgICAgICAgICAnYXV0aC9naXRodWInXG4gICAgICB9LFxuICAgICAgb0F1dGhDYWxsYmFja1BhdGg6ICAgICAgICAgICdvYXV0aF9jYWxsYmFjaycsXG4gICAgICBvQXV0aFdpbmRvd1R5cGU6ICAgICAgICAgICAgJ25ld1dpbmRvdycsXG4gICAgICBvQXV0aFdpbmRvd09wdGlvbnM6ICAgICAgICAgbnVsbCxcblxuICAgICAgZ2xvYmFsT3B0aW9uczoge1xuICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBtZXJnZWRPcHRpb25zID0gKDxhbnk+T2JqZWN0KS5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIGNvbmZpZyk7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VkT3B0aW9ucztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS53YXJuKGBbYW5ndWxhci10b2tlbl0gWW91IGhhdmUgbm90IGNvbmZpZ3VyZWQgJ2FwaUJhc2UnLCB3aGljaCBtYXkgcmVzdWx0IGluIHNlY3VyaXR5IGlzc3Vlcy4gYCArXG4gICAgICAgICAgICAgICAgICAgYFBsZWFzZSByZWZlciB0byB0aGUgZG9jdW1lbnRhdGlvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vbmVyb25pYWt5L2FuZ3VsYXItdG9rZW4vd2lraWApO1xuICAgIH1cblxuICAgIHRoaXMudHJ5TG9hZEF1dGhEYXRhKCk7XG4gIH1cblxuICBzZXRHbG9iYWxPcHRpb25zKG9wdGlvbnM6IEdsb2JhbE9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMuZ2xvYmFsT3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICB1c2VyU2lnbmVkSW4oKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gISF0aGlzLmF1dGhEYXRhO1xuICB9XG5cbiAgY2FuQWN0aXZhdGUocm91dGUsIHN0YXRlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudXNlclNpZ25lZEluKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdG9yZSBjdXJyZW50IGxvY2F0aW9uIGluIHN0b3JhZ2UgKHVzZWZ1bGwgZm9yIHJlZGlyZWN0aW9uIGFmdGVyIHNpZ25pbmcgaW4pXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSxcbiAgICAgICAgICBzdGF0ZS51cmxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdXNlciB0byBzaWduIGluIGlmIHNpZ25JblJlZGlyZWN0IGlzIHNldFxuICAgICAgaWYgKHRoaXMucm91dGVyICYmIHRoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBBY3Rpb25zXG4gICAqXG4gICAqL1xuXG4gIC8vIFJlZ2lzdGVyIHJlcXVlc3RcbiAgcmVnaXN0ZXJBY2NvdW50KHJlZ2lzdGVyRGF0YTogUmVnaXN0ZXJEYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHJlZ2lzdGVyRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHJlZ2lzdGVyRGF0YSk7XG5cbiAgICBpZiAocmVnaXN0ZXJEYXRhLnVzZXJUeXBlID09IG51bGwpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZWdpc3RlckRhdGEudXNlclR5cGUpO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS51c2VyVHlwZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID09IG51bGwgJiZcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbiAhPSBudWxsXG4gICAgKSB7XG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID0gcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dpbiA9IHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIHJlZ2lzdGVyRGF0YVt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF0gPSBsb2dpbjtcblxuICAgIHJlZ2lzdGVyRGF0YS5jb25maXJtX3N1Y2Nlc3NfdXJsID0gdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudENhbGxiYWNrO1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudFBhdGgsIHJlZ2lzdGVyRGF0YSk7XG4gIH1cblxuICAvLyBEZWxldGUgQWNjb3VudFxuICBkZWxldGVBY2NvdW50KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuZGVsZXRlQWNjb3VudFBhdGgpO1xuICB9XG5cbiAgLy8gU2lnbiBpbiByZXF1ZXN0IGFuZCBzZXQgc3RvcmFnZVxuICBzaWduSW4oc2lnbkluRGF0YTogU2lnbkluRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgdGhpcy51c2VyVHlwZSA9IChzaWduSW5EYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUoc2lnbkluRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogc2lnbkluRGF0YS5sb2dpbixcbiAgICAgIHBhc3N3b3JkOiBzaWduSW5EYXRhLnBhc3N3b3JkXG4gICAgfTtcblxuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25JblBhdGgsIGJvZHksIHsgb2JzZXJ2ZTogJ3Jlc3BvbnNlJyB9KS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShyZXMgPT4gdGhpcy51c2VyRGF0YSA9IHJlcy5ib2R5WydkYXRhJ10pO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIHNpZ25Jbk9BdXRoKG9BdXRoVHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwYXJhbXM/OiB7IFtrZXk6c3RyaW5nXTogc3RyaW5nOyB9KSB7XG5cbiAgICBjb25zdCBvQXV0aFBhdGg6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhQYXRoKG9BdXRoVHlwZSk7XG4gICAgY29uc3QgY2FsbGJhY2tVcmwgPSBgJHt0aGlzLmdsb2JhbC5sb2NhdGlvbi5vcmlnaW59LyR7dGhpcy5vcHRpb25zLm9BdXRoQ2FsbGJhY2tQYXRofWA7XG4gICAgY29uc3Qgb0F1dGhXaW5kb3dUeXBlOiBzdHJpbmcgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dUeXBlO1xuICAgIGNvbnN0IGF1dGhVcmw6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhVcmwoXG4gICAgICBvQXV0aFBhdGgsXG4gICAgICBjYWxsYmFja1VybCxcbiAgICAgIG9BdXRoV2luZG93VHlwZSxcbiAgICAgIHBhcmFtc1xuICAgICk7XG5cbiAgICBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnbmV3V2luZG93Jykge1xuICAgICAgY29uc3Qgb0F1dGhXaW5kb3dPcHRpb25zID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93T3B0aW9ucztcbiAgICAgIGxldCB3aW5kb3dPcHRpb25zID0gJyc7XG5cbiAgICAgIGlmIChvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIHdpbmRvd09wdGlvbnMgKz0gYCwke2tleX09JHtvQXV0aFdpbmRvd09wdGlvbnNba2V5XX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwb3B1cCA9IHdpbmRvdy5vcGVuKFxuICAgICAgICAgIGF1dGhVcmwsXG4gICAgICAgICAgJ19ibGFuaycsXG4gICAgICAgICAgYGNsb3NlYnV0dG9uY2FwdGlvbj1DYW5jZWwke3dpbmRvd09wdGlvbnN9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3RDcmVkZW50aWFsc1ZpYVBvc3RNZXNzYWdlKHBvcHVwKTtcbiAgICB9IGVsc2UgaWYgKG9BdXRoV2luZG93VHlwZSA9PT0gJ3NhbWVXaW5kb3cnKSB7XG4gICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmID0gYXV0aFVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvQXV0aFdpbmRvd1R5cGUgXCIke29BdXRoV2luZG93VHlwZX1cImApO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NPQXV0aENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gIH1cblxuICAvLyBTaWduIG91dCByZXF1ZXN0IGFuZCBkZWxldGUgc3RvcmFnZVxuICBzaWduT3V0KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmRlbGV0ZTxhbnk+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25PdXRQYXRoKVxuXHQgIC8vIE9ubHkgcmVtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYW5kIGNsZWFyIHRoZSBkYXRhIGFmdGVyIHRoZSBjYWxsXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWNjZXNzVG9rZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjbGllbnQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdleHBpcnknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlblR5cGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1aWQnKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYXV0aERhdGEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0b2tlbiByZXF1ZXN0XG4gIHZhbGlkYXRlVG9rZW4oKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAuZ2V0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnZhbGlkYXRlVG9rZW5QYXRoKS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIChyZXMpID0+IHRoaXMudXNlckRhdGEgPSByZXNbJ2RhdGEnXSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDEgJiYgdGhpcy5vcHRpb25zLnNpZ25PdXRGYWlsZWRWYWxpZGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbk91dCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgLy8gVXBkYXRlIHBhc3N3b3JkIHJlcXVlc3RcbiAgdXBkYXRlUGFzc3dvcmQodXBkYXRlUGFzc3dvcmREYXRhOiBVcGRhdGVQYXNzd29yZERhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUpO1xuICAgIH1cblxuICAgIGxldCBhcmdzOiBhbnk7XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCA9PSBudWxsKSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncyA9IHtcbiAgICAgICAgY3VycmVudF9wYXNzd29yZDogICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCxcbiAgICAgICAgcGFzc3dvcmQ6ICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkLFxuICAgICAgICBwYXNzd29yZF9jb25maXJtYXRpb246ICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDb25maXJtYXRpb25cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW4pIHtcbiAgICAgIGFyZ3MucmVzZXRfcGFzc3dvcmRfdG9rZW4gPSB1cGRhdGVQYXNzd29yZERhdGEucmVzZXRQYXNzd29yZFRva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSBhcmdzO1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnVwZGF0ZVBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuICAvLyBSZXNldCBwYXNzd29yZCByZXF1ZXN0XG4gIHJlc2V0UGFzc3dvcmQocmVzZXRQYXNzd29yZERhdGE6IFJlc2V0UGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHRoaXMudXNlclR5cGUgPSAocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogcmVzZXRQYXNzd29yZERhdGEubG9naW4sXG4gICAgICByZWRpcmVjdF91cmw6IHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIENvbnN0cnVjdCBQYXRocyAvIFVybHNcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSBnZXRVc2VyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy51c2VyVHlwZSA9PSBudWxsKSA/ICcnIDogdGhpcy51c2VyVHlwZS5wYXRoICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBcGlQYXRoKCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbnN0cnVjdGVkUGF0aCA9ICcnO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpQmFzZSArICcvJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaVBhdGggIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlQYXRoICsgJy8nO1xuICAgIH1cblxuICAgIHJldHVybiBjb25zdHJ1Y3RlZFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBcGlQYXRoKCkgKyB0aGlzLmdldFVzZXJQYXRoKCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoUGF0aChvQXV0aFR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IG9BdXRoUGF0aDogc3RyaW5nO1xuXG4gICAgb0F1dGhQYXRoID0gdGhpcy5vcHRpb25zLm9BdXRoUGF0aHNbb0F1dGhUeXBlXTtcblxuICAgIGlmIChvQXV0aFBhdGggPT0gbnVsbCkge1xuICAgICAgb0F1dGhQYXRoID0gYC9hdXRoLyR7b0F1dGhUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9BdXRoUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhVcmwob0F1dGhQYXRoOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tVcmw6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzogeyBba2V5OnN0cmluZ106IHN0cmluZzsgfSk6IHN0cmluZyB7XG4gICAgbGV0IHVybDogc3RyaW5nO1xuXG4gICAgdXJsID0gICBgJHt0aGlzLm9wdGlvbnMub0F1dGhCYXNlfS8ke29BdXRoUGF0aH1gO1xuICAgIHVybCArPSAgYD9vbW5pYXV0aF93aW5kb3dfdHlwZT0ke3dpbmRvd1R5cGV9YDtcbiAgICB1cmwgKz0gIGAmYXV0aF9vcmlnaW5fdXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNhbGxiYWNrVXJsKX1gO1xuXG4gICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdXJsICs9IGAmcmVzb3VyY2VfY2xhc3M9JHt0aGlzLnVzZXJUeXBlLm5hbWV9YDtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgIHVybCArPSBgJiR7a2V5fT0ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXNba2V5XSl9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogR2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBUcnkgdG8gbG9hZCBhdXRoIGRhdGFcbiAgcHJpdmF0ZSB0cnlMb2FkQXV0aERhdGEoKTogdm9pZCB7XG5cbiAgICBjb25zdCB1c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlclR5cGUnKSk7XG5cbiAgICBpZiAodXNlclR5cGUpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSB1c2VyVHlwZTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIGlmICh0aGlzLmFjdGl2YXRlZFJvdXRlKSB7XG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBhcmFtcygpO1xuICAgIH1cblxuICAgIC8vIGlmICh0aGlzLmF1dGhEYXRhKSB7XG4gICAgLy8gICAgIHRoaXMudmFsaWRhdGVUb2tlbigpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHB1YmxpYyBnZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBoZWFkZXJzID0gZGF0YS5oZWFkZXJzO1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGhlYWRlcnMuZ2V0KCdhY2Nlc3MtdG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICBoZWFkZXJzLmdldCgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgaGVhZGVycy5nZXQoJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIGhlYWRlcnMuZ2V0KCd0b2tlbi10eXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgaGVhZGVycy5nZXQoJ3VpZCcpLFxuICAgICAgcHJvdmlkZXI6ICAgICAgIGhlYWRlcnMuZ2V0KCdwcm92aWRlcicpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcG9zdCBtZXNzYWdlXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGRhdGFbJ2F1dGhfdG9rZW4nXSxcbiAgICAgIGNsaWVudDogICAgICAgICBkYXRhWydjbGllbnRfaWQnXSxcbiAgICAgIGV4cGlyeTogICAgICAgICBkYXRhWydleHBpcnknXSxcbiAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgIHVpZDogICAgICAgICAgICBkYXRhWyd1aWQnXSxcbiAgICAgIHByb3ZpZGVyOiAgICAgICBkYXRhWydwcm92aWRlciddXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSBzdG9yYWdlLlxuICBwdWJsaWMgZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY2Nlc3NUb2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuVHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VpZCcpLFxuICAgICAgcHJvdmlkZXI6ICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Byb3ZpZGVyJylcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgIHRoaXMuYXV0aERhdGEgPSBhdXRoRGF0YTtcbiAgICB9XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHVybCBwYXJhbWV0ZXJzLlxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBhcmFtcygpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZShxdWVyeVBhcmFtcyA9PiB7XG4gICAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiAgICBxdWVyeVBhcmFtc1sndG9rZW4nXSB8fCBxdWVyeVBhcmFtc1snYXV0aF90b2tlbiddLFxuICAgICAgICBjbGllbnQ6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2NsaWVudF9pZCddLFxuICAgICAgICBleHBpcnk6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2V4cGlyeSddLFxuICAgICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICAgIHVpZDogICAgICAgICAgICBxdWVyeVBhcmFtc1sndWlkJ10sXG4gICAgICAgIHByb3ZpZGVyOiAgICAgICBxdWVyeVBhcmFtc1sncHJvdmlkZXInXVxuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gV3JpdGUgYXV0aCBkYXRhIHRvIHN0b3JhZ2VcbiAgcHJpdmF0ZSBzZXRBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhY2Nlc3NUb2tlbicsIGF1dGhEYXRhLmFjY2Vzc1Rva2VuKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2NsaWVudCcsIGF1dGhEYXRhLmNsaWVudCk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleHBpcnknLCBhdXRoRGF0YS5leHBpcnkpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW5UeXBlJywgYXV0aERhdGEudG9rZW5UeXBlKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VpZCcsIGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgIGlmIChhdXRoRGF0YS5wcm92aWRlcikge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwcm92aWRlcicsIGF1dGhEYXRhLnByb3ZpZGVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyVHlwZScsIHRoaXMudXNlclR5cGUubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVmFsaWRhdGUgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIENoZWNrIGlmIGF1dGggZGF0YSBjb21wbGV0ZSBhbmQgaWYgcmVzcG9uc2UgdG9rZW4gaXMgbmV3ZXJcbiAgcHJpdmF0ZSBjaGVja0F1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKFxuICAgICAgYXV0aERhdGEuYWNjZXNzVG9rZW4gIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuY2xpZW50ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmV4cGlyeSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS50b2tlblR5cGUgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudWlkICE9IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmF1dGhEYXRhICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF1dGhEYXRhLmV4cGlyeSA+PSB0aGlzLmF1dGhEYXRhLmV4cGlyeTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogT0F1dGhcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSByZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShhdXRoV2luZG93OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHBvbGxlck9ic2VydiA9IGludGVydmFsKDUwMCk7XG5cbiAgICBjb25zdCByZXNwb25zZU9ic2VydiA9IGZyb21FdmVudCh0aGlzLmdsb2JhbCwgJ21lc3NhZ2UnKS5waXBlKFxuICAgICAgcGx1Y2soJ2RhdGEnKSxcbiAgICAgIGZpbHRlcih0aGlzLm9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIpXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlU3Vic2NyaXB0aW9uID0gcmVzcG9uc2VPYnNlcnYuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKTtcblxuICAgIGNvbnN0IHBvbGxlclN1YnNjcmlwdGlvbiA9IHBvbGxlck9ic2Vydi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKGF1dGhXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgIHBvbGxlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXV0aFdpbmRvdy5wb3N0TWVzc2FnZSgncmVxdWVzdENyZWRlbnRpYWxzJywgJyonKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXNwb25zZU9ic2VydjtcbiAgfVxuXG4gIHByaXZhdGUgb0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcihkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmIChkYXRhLm1lc3NhZ2UgPT09ICdkZWxpdmVyQ3JlZGVudGlhbHMnXG4gICAgICB8fCBkYXRhLm1lc3NhZ2UgPT09ICdhdXRoRmFpbHVyZSdcbiAgICAgIHx8IGRhdGEubWVzc2FnZSA9PT0gJ2RlbGl2ZXJQcm92aWRlckF1dGgnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBVdGlsaXRpZXNcbiAgICpcbiAgICovXG5cbiAgLy8gTWF0Y2ggdXNlciBjb25maWcgYnkgdXNlciBjb25maWcgbmFtZVxuICBwcml2YXRlIGdldFVzZXJUeXBlQnlOYW1lKG5hbWU6IHN0cmluZyk6IFVzZXJUeXBlIHtcbiAgICBpZiAobmFtZSA9PSBudWxsIHx8IHRoaXMub3B0aW9ucy51c2VyVHlwZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VyVHlwZXMuZmluZChcbiAgICAgIHVzZXJUeXBlID0+IHVzZXJUeXBlLm5hbWUgPT09IG5hbWVcbiAgICApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwRXZlbnQsIEh0dHBSZXF1ZXN0LCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBIYW5kbGVyLCBIdHRwUmVzcG9uc2UsIEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5PcHRpb25zIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlblNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgcHJpdmF0ZSBhdE9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoIHByaXZhdGUgdG9rZW5TZXJ2aWNlOiBBbmd1bGFyVG9rZW5TZXJ2aWNlICkge1xuICB9XG5cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG5cbiAgICAvLyBHZXQgYXV0aCBkYXRhIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgIHRoaXMudG9rZW5TZXJ2aWNlLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIC8vIEFkZCB0aGUgaGVhZGVycyBpZiB0aGUgcmVxdWVzdCBpcyBnb2luZyB0byB0aGUgY29uZmlndXJlZCBzZXJ2ZXJcbiAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhICYmICh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlID09PSBudWxsIHx8IHJlcS51cmwubWF0Y2godGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSkpKSB7XG5cbiAgICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAgICdhY2Nlc3MtdG9rZW4nOiB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuYWNjZXNzVG9rZW4sXG4gICAgICAgICdjbGllbnQnOiAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuY2xpZW50LFxuICAgICAgICAnZXhwaXJ5JzogICAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLmV4cGlyeSxcbiAgICAgICAgJ3Rva2VuLXR5cGUnOiAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS50b2tlblR5cGUsXG4gICAgICAgICd1aWQnOiAgICAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEudWlkLFxuICAgICAgICAncHJvdmlkZXInOiAgICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnByb3ZpZGVyXG4gICAgICB9O1xuXG4gICAgICAvLyBDdXN0b20gaGVhZGVycyBwYXNzZWQgaW4gZm9yIGVhY2ggcmVxdWVzdFxuICAgICAgY29uc3QgZ2xvYmFsT3B0aW9ucyA9IHRoaXMudG9rZW5TZXJ2aWNlLmdsb2JhbE9wdGlvbnM7XG4gICAgICBpZiAoZ2xvYmFsT3B0aW9ucyAmJiBnbG9iYWxPcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGdsb2JhbE9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgIGhlYWRlcnNba2V5XSA9IGdsb2JhbE9wdGlvbnMuaGVhZGVyc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlcSA9IHJlcS5jbG9uZSh7XG4gICAgICAgIHNldEhlYWRlcnM6IGhlYWRlcnNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpLnBpcGUodGFwKFxuICAgICAgICByZXMgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShyZXMpLFxuICAgICAgICBlcnIgPT4gdGhpcy5oYW5kbGVSZXNwb25zZShlcnIpXG4gICAgKSk7XG4gIH1cblxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHByaXZhdGUgaGFuZGxlUmVzcG9uc2UocmVzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAocmVzIGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlIHx8IHJlcyBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlKSB7XG4gICAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSA9PT0gbnVsbCB8fCAocmVzLnVybCAmJiByZXMudXJsLm1hdGNoKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UpKSkge1xuICAgICAgICB0aGlzLnRva2VuU2VydmljZS5nZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZSg8YW55PnJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycywgT3B0aW9uYWwsIFNraXBTZWxmLCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFuZ3VsYXJUb2tlbk9wdGlvbnMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4ubW9kZWwnO1xuaW1wb3J0IHsgQW5ndWxhclRva2VuU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLmludGVyY2VwdG9yJztcbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmV4cG9ydCAqIGZyb20gJy4vYW5ndWxhci10b2tlbi5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5Nb2R1bGUge1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHBhcmVudE1vZHVsZTogQW5ndWxhclRva2VuTW9kdWxlKSB7XG4gICAgaWYgKHBhcmVudE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyVG9rZW4gaXMgYWxyZWFkeSBsb2FkZWQuIEl0IHNob3VsZCBvbmx5IGJlIGltcG9ydGVkIGluIHlvdXIgYXBwbGljYXRpb25cXCdzIG1haW4gbW9kdWxlLicpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgZm9yUm9vdChvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBBbmd1bGFyVG9rZW5Nb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLFxuICAgICAgICAgIHVzZUNsYXNzOiBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvcixcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zLmFuZ3VsYXJUb2tlbk9wdGlvbnNQcm92aWRlciB8fFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogQU5HVUxBUl9UT0tFTl9PUFRJT05TLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRpb25zXG4gICAgICAgIH0sXG4gICAgICAgIEFuZ3VsYXJUb2tlblNlcnZpY2VcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXSwibmFtZXMiOlsiSW5qZWN0aW9uVG9rZW4iLCJpc1BsYXRmb3JtU2VydmVyIiwic2hhcmUiLCJmaW5hbGl6ZSIsImludGVydmFsIiwiZnJvbUV2ZW50IiwicGx1Y2siLCJmaWx0ZXIiLCJJbmplY3RhYmxlIiwiSHR0cENsaWVudCIsIkluamVjdCIsIlBMQVRGT1JNX0lEIiwiQWN0aXZhdGVkUm91dGUiLCJPcHRpb25hbCIsIlJvdXRlciIsInRhcCIsIkh0dHBSZXNwb25zZSIsIkh0dHBFcnJvclJlc3BvbnNlIiwiSFRUUF9JTlRFUkNFUFRPUlMiLCJOZ01vZHVsZSIsIlNraXBTZWxmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFFQSxRQUFhLHFCQUFxQixHQUFHLElBQUlBLGlCQUFjLENBQUMsdUJBQXVCLENBQUM7Ozs7OztBQ0ZoRjtRQTZERSw2QkFDVSxJQUFnQixFQUNPLE1BQVcsRUFDYixVQUFrQixFQUMzQixjQUE4QixFQUM5QixNQUFjO1lBSjFCLFNBQUksR0FBSixJQUFJLENBQVk7WUFFSyxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQzNCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBUDVCLGlCQUFZLEdBQWtCLEVBQUUsQ0FBQztZQVN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFFNUQsSUFBSUMsdUJBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUc7b0JBQ1osSUFBSSxFQUFFLGNBQU0sT0FBQSxJQUFJLEdBQUE7b0JBQ2hCLFFBQVEsRUFBRTt3QkFDUixJQUFJLEVBQUUsR0FBRzt3QkFDVCxNQUFNLEVBQUUsR0FBRztxQkFDWjtpQkFDRixDQUFDO2dCQUVGLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLGNBQU0sT0FBQSxJQUFJLEdBQUEsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsY0FBTSxPQUFBLElBQUksR0FBQSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxjQUFNLE9B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