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
                        'uid': this.tokenService.currentAuthData.uid
                    };
                    /** @type {?} */
                    var provider = this.tokenService.currentAuthData.provider;
                    if (provider) {
                        headers['provider'] = provider;
                    }
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi51bWQuanMubWFwIiwic291cmNlcyI6WyJuZzovL2FuZ3VsYXItdG9rZW4vbGliL2FuZ3VsYXItdG9rZW4udG9rZW4udHMiLCJuZzovL2FuZ3VsYXItdG9rZW4vbGliL2FuZ3VsYXItdG9rZW4uc2VydmljZS50cyIsIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvci50cyIsIm5nOi8vYW5ndWxhci10b2tlbi9saWIvYW5ndWxhci10b2tlbi5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0aW9uVG9rZW4gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNvbnN0IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbignQU5HVUxBUl9UT0tFTl9PUFRJT05TJyk7XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCwgSW5qZWN0LCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciwgQ2FuQWN0aXZhdGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tRXZlbnQsIGludGVydmFsIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBwbHVjaywgZmlsdGVyLCBzaGFyZSwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmltcG9ydCB7XG4gIFNpZ25JbkRhdGEsXG4gIFJlZ2lzdGVyRGF0YSxcbiAgVXBkYXRlUGFzc3dvcmREYXRhLFxuICBSZXNldFBhc3N3b3JkRGF0YSxcblxuICBVc2VyVHlwZSxcbiAgVXNlckRhdGEsXG4gIEF1dGhEYXRhLFxuXG4gIEFuZ3VsYXJUb2tlbk9wdGlvbnMsXG4gIEdsb2JhbE9wdGlvbnNcbn0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlblNlcnZpY2UgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG5cbiAgZ2V0IGN1cnJlbnRVc2VyVHlwZSgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnVzZXJUeXBlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZXJUeXBlLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRVc2VyRGF0YSgpOiBVc2VyRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMudXNlckRhdGE7XG4gIH1cblxuICBnZXQgY3VycmVudEF1dGhEYXRhKCk6IEF1dGhEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5hdXRoRGF0YTtcbiAgfVxuXG4gIGdldCBhcGlCYXNlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hcGlCYXNlO1xuICB9XG5cbiAgZ2V0IGdsb2JhbE9wdGlvbnMoKTogR2xvYmFsT3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5nbG9iYWxPcHRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuICBwcml2YXRlIHVzZXJUeXBlOiBVc2VyVHlwZTtcbiAgcHJpdmF0ZSBhdXRoRGF0YTogQXV0aERhdGE7XG4gIHByaXZhdGUgdXNlckRhdGE6IFVzZXJEYXRhO1xuICBwcml2YXRlIGdsb2JhbDogV2luZG93IHwgYW55O1xuXG4gIHByaXZhdGUgbG9jYWxTdG9yYWdlOiBTdG9yYWdlIHwgYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoQU5HVUxBUl9UT0tFTl9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJvdXRlcjogUm91dGVyXG4gICkge1xuICAgIHRoaXMuZ2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIocGxhdGZvcm1JZCkpIHtcbiAgICAgIHRoaXMuZ2xvYmFsID0ge1xuICAgICAgICBvcGVuOiAoKSA9PiBudWxsLFxuICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgIGhyZWY6ICcvJyxcbiAgICAgICAgICBvcmlnaW46ICcvJ1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtID0gKCkgPT4gbnVsbDtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0gPSAoKSA9PiBudWxsO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSA9ICgpID0+IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zID0ge1xuICAgICAgYXBpUGF0aDogICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBhcGlCYXNlOiAgICAgICAgICAgICAgICAgICAgbnVsbCxcblxuICAgICAgc2lnbkluUGF0aDogICAgICAgICAgICAgICAgICdhdXRoL3NpZ25faW4nLFxuICAgICAgc2lnbkluUmVkaXJlY3Q6ICAgICAgICAgICAgIG51bGwsXG4gICAgICBzaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5OiAgbnVsbCxcblxuICAgICAgc2lnbk91dFBhdGg6ICAgICAgICAgICAgICAgICdhdXRoL3NpZ25fb3V0JyxcbiAgICAgIHZhbGlkYXRlVG9rZW5QYXRoOiAgICAgICAgICAnYXV0aC92YWxpZGF0ZV90b2tlbicsXG4gICAgICBzaWduT3V0RmFpbGVkVmFsaWRhdGU6ICAgICAgZmFsc2UsXG5cbiAgICAgIHJlZ2lzdGVyQWNjb3VudFBhdGg6ICAgICAgICAnYXV0aCcsXG4gICAgICBkZWxldGVBY2NvdW50UGF0aDogICAgICAgICAgJ2F1dGgnLFxuICAgICAgcmVnaXN0ZXJBY2NvdW50Q2FsbGJhY2s6ICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIHVwZGF0ZVBhc3N3b3JkUGF0aDogICAgICAgICAnYXV0aCcsXG5cbiAgICAgIHJlc2V0UGFzc3dvcmRQYXRoOiAgICAgICAgICAnYXV0aC9wYXNzd29yZCcsXG4gICAgICByZXNldFBhc3N3b3JkQ2FsbGJhY2s6ICAgICAgdGhpcy5nbG9iYWwubG9jYXRpb24uaHJlZixcblxuICAgICAgdXNlclR5cGVzOiAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBsb2dpbkZpZWxkOiAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcblxuICAgICAgb0F1dGhCYXNlOiAgICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLm9yaWdpbixcbiAgICAgIG9BdXRoUGF0aHM6IHtcbiAgICAgICAgZ2l0aHViOiAgICAgICAgICAgICAgICAgICAnYXV0aC9naXRodWInXG4gICAgICB9LFxuICAgICAgb0F1dGhDYWxsYmFja1BhdGg6ICAgICAgICAgICdvYXV0aF9jYWxsYmFjaycsXG4gICAgICBvQXV0aFdpbmRvd1R5cGU6ICAgICAgICAgICAgJ25ld1dpbmRvdycsXG4gICAgICBvQXV0aFdpbmRvd09wdGlvbnM6ICAgICAgICAgbnVsbCxcblxuICAgICAgZ2xvYmFsT3B0aW9uczoge1xuICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBtZXJnZWRPcHRpb25zID0gKDxhbnk+T2JqZWN0KS5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIGNvbmZpZyk7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VkT3B0aW9ucztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBpQmFzZSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS53YXJuKGBbYW5ndWxhci10b2tlbl0gWW91IGhhdmUgbm90IGNvbmZpZ3VyZWQgJ2FwaUJhc2UnLCB3aGljaCBtYXkgcmVzdWx0IGluIHNlY3VyaXR5IGlzc3Vlcy4gYCArXG4gICAgICAgICAgICAgICAgICAgYFBsZWFzZSByZWZlciB0byB0aGUgZG9jdW1lbnRhdGlvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vbmVyb25pYWt5L2FuZ3VsYXItdG9rZW4vd2lraWApO1xuICAgIH1cblxuICAgIHRoaXMudHJ5TG9hZEF1dGhEYXRhKCk7XG4gIH1cblxuICBzZXRHbG9iYWxPcHRpb25zKG9wdGlvbnM6IEdsb2JhbE9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMuZ2xvYmFsT3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICB1c2VyU2lnbmVkSW4oKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gISF0aGlzLmF1dGhEYXRhO1xuICB9XG5cbiAgY2FuQWN0aXZhdGUocm91dGUsIHN0YXRlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudXNlclNpZ25lZEluKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdG9yZSBjdXJyZW50IGxvY2F0aW9uIGluIHN0b3JhZ2UgKHVzZWZ1bGwgZm9yIHJlZGlyZWN0aW9uIGFmdGVyIHNpZ25pbmcgaW4pXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleSxcbiAgICAgICAgICBzdGF0ZS51cmxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdXNlciB0byBzaWduIGluIGlmIHNpZ25JblJlZGlyZWN0IGlzIHNldFxuICAgICAgaWYgKHRoaXMucm91dGVyICYmIHRoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5vcHRpb25zLnNpZ25JblJlZGlyZWN0XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBBY3Rpb25zXG4gICAqXG4gICAqL1xuXG4gIC8vIFJlZ2lzdGVyIHJlcXVlc3RcbiAgcmVnaXN0ZXJBY2NvdW50KHJlZ2lzdGVyRGF0YTogUmVnaXN0ZXJEYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHJlZ2lzdGVyRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHJlZ2lzdGVyRGF0YSk7XG5cbiAgICBpZiAocmVnaXN0ZXJEYXRhLnVzZXJUeXBlID09IG51bGwpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZWdpc3RlckRhdGEudXNlclR5cGUpO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS51c2VyVHlwZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID09IG51bGwgJiZcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbiAhPSBudWxsXG4gICAgKSB7XG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID0gcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dpbiA9IHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICBkZWxldGUgcmVnaXN0ZXJEYXRhLmxvZ2luO1xuICAgIHJlZ2lzdGVyRGF0YVt0aGlzLm9wdGlvbnMubG9naW5GaWVsZF0gPSBsb2dpbjtcblxuICAgIHJlZ2lzdGVyRGF0YS5jb25maXJtX3N1Y2Nlc3NfdXJsID0gdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudENhbGxiYWNrO1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlZ2lzdGVyQWNjb3VudFBhdGgsIHJlZ2lzdGVyRGF0YSk7XG4gIH1cblxuICAvLyBEZWxldGUgQWNjb3VudFxuICBkZWxldGVBY2NvdW50KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUodGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuZGVsZXRlQWNjb3VudFBhdGgpO1xuICB9XG5cbiAgLy8gU2lnbiBpbiByZXF1ZXN0IGFuZCBzZXQgc3RvcmFnZVxuICBzaWduSW4oc2lnbkluRGF0YTogU2lnbkluRGF0YSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgdGhpcy51c2VyVHlwZSA9IChzaWduSW5EYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUoc2lnbkluRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogc2lnbkluRGF0YS5sb2dpbixcbiAgICAgIHBhc3N3b3JkOiBzaWduSW5EYXRhLnBhc3N3b3JkXG4gICAgfTtcblxuICAgIGNvbnN0IG9ic2VydiA9IHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25JblBhdGgsIGJvZHksIHsgb2JzZXJ2ZTogJ3Jlc3BvbnNlJyB9KS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShyZXMgPT4gdGhpcy51c2VyRGF0YSA9IHJlcy5ib2R5WydkYXRhJ10pO1xuXG4gICAgcmV0dXJuIG9ic2VydjtcbiAgfVxuXG4gIHNpZ25Jbk9BdXRoKG9BdXRoVHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwYXJhbXM/OiB7IFtrZXk6c3RyaW5nXTogc3RyaW5nOyB9KSB7XG5cbiAgICBjb25zdCBvQXV0aFBhdGg6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhQYXRoKG9BdXRoVHlwZSk7XG4gICAgY29uc3QgY2FsbGJhY2tVcmwgPSBgJHt0aGlzLmdsb2JhbC5sb2NhdGlvbi5vcmlnaW59LyR7dGhpcy5vcHRpb25zLm9BdXRoQ2FsbGJhY2tQYXRofWA7XG4gICAgY29uc3Qgb0F1dGhXaW5kb3dUeXBlOiBzdHJpbmcgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dUeXBlO1xuICAgIGNvbnN0IGF1dGhVcmw6IHN0cmluZyA9IHRoaXMuZ2V0T0F1dGhVcmwoXG4gICAgICBvQXV0aFBhdGgsXG4gICAgICBjYWxsYmFja1VybCxcbiAgICAgIG9BdXRoV2luZG93VHlwZSxcbiAgICAgIHBhcmFtc1xuICAgICk7XG5cbiAgICBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnbmV3V2luZG93Jykge1xuICAgICAgY29uc3Qgb0F1dGhXaW5kb3dPcHRpb25zID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93T3B0aW9ucztcbiAgICAgIGxldCB3aW5kb3dPcHRpb25zID0gJyc7XG5cbiAgICAgIGlmIChvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb0F1dGhXaW5kb3dPcHRpb25zKSB7XG4gICAgICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIHdpbmRvd09wdGlvbnMgKz0gYCwke2tleX09JHtvQXV0aFdpbmRvd09wdGlvbnNba2V5XX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwb3B1cCA9IHdpbmRvdy5vcGVuKFxuICAgICAgICAgIGF1dGhVcmwsXG4gICAgICAgICAgJ19ibGFuaycsXG4gICAgICAgICAgYGNsb3NlYnV0dG9uY2FwdGlvbj1DYW5jZWwke3dpbmRvd09wdGlvbnN9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3RDcmVkZW50aWFsc1ZpYVBvc3RNZXNzYWdlKHBvcHVwKTtcbiAgICB9IGVsc2UgaWYgKG9BdXRoV2luZG93VHlwZSA9PT0gJ3NhbWVXaW5kb3cnKSB7XG4gICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmID0gYXV0aFVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvQXV0aFdpbmRvd1R5cGUgXCIke29BdXRoV2luZG93VHlwZX1cImApO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NPQXV0aENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gIH1cblxuICAvLyBTaWduIG91dCByZXF1ZXN0IGFuZCBkZWxldGUgc3RvcmFnZVxuICBzaWduT3V0KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmRlbGV0ZTxhbnk+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnNpZ25PdXRQYXRoKVxuXHQgIC8vIE9ubHkgcmVtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYW5kIGNsZWFyIHRoZSBkYXRhIGFmdGVyIHRoZSBjYWxsXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWNjZXNzVG9rZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjbGllbnQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdleHBpcnknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlblR5cGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1aWQnKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYXV0aERhdGEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlclR5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0b2tlbiByZXF1ZXN0XG4gIHZhbGlkYXRlVG9rZW4oKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAuZ2V0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnZhbGlkYXRlVG9rZW5QYXRoKS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIChyZXMpID0+IHRoaXMudXNlckRhdGEgPSByZXNbJ2RhdGEnXSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDEgJiYgdGhpcy5vcHRpb25zLnNpZ25PdXRGYWlsZWRWYWxpZGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbk91dCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgLy8gVXBkYXRlIHBhc3N3b3JkIHJlcXVlc3RcbiAgdXBkYXRlUGFzc3dvcmQodXBkYXRlUGFzc3dvcmREYXRhOiBVcGRhdGVQYXNzd29yZERhdGEpOiBPYnNlcnZhYmxlPGFueT4ge1xuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS51c2VyVHlwZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlID0gdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZSh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUpO1xuICAgIH1cblxuICAgIGxldCBhcmdzOiBhbnk7XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCA9PSBudWxsKSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncyA9IHtcbiAgICAgICAgY3VycmVudF9wYXNzd29yZDogICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ3VycmVudCxcbiAgICAgICAgcGFzc3dvcmQ6ICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkLFxuICAgICAgICBwYXNzd29yZF9jb25maXJtYXRpb246ICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDb25maXJtYXRpb25cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW4pIHtcbiAgICAgIGFyZ3MucmVzZXRfcGFzc3dvcmRfdG9rZW4gPSB1cGRhdGVQYXNzd29yZERhdGEucmVzZXRQYXNzd29yZFRva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSBhcmdzO1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnVwZGF0ZVBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuICAvLyBSZXNldCBwYXNzd29yZCByZXF1ZXN0XG4gIHJlc2V0UGFzc3dvcmQocmVzZXRQYXNzd29yZERhdGE6IFJlc2V0UGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxhbnk+IHtcblxuICAgIHRoaXMudXNlclR5cGUgPSAocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUgPT0gbnVsbCkgPyBudWxsIDogdGhpcy5nZXRVc2VyVHlwZUJ5TmFtZShyZXNldFBhc3N3b3JkRGF0YS51c2VyVHlwZSk7XG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgW3RoaXMub3B0aW9ucy5sb2dpbkZpZWxkXTogcmVzZXRQYXNzd29yZERhdGEubG9naW4sXG4gICAgICByZWRpcmVjdF91cmw6IHRoaXMub3B0aW9ucy5yZXNldFBhc3N3b3JkQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIENvbnN0cnVjdCBQYXRocyAvIFVybHNcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSBnZXRVc2VyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy51c2VyVHlwZSA9PSBudWxsKSA/ICcnIDogdGhpcy51c2VyVHlwZS5wYXRoICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBcGlQYXRoKCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbnN0cnVjdGVkUGF0aCA9ICcnO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpQmFzZSArICcvJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaVBhdGggIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlQYXRoICsgJy8nO1xuICAgIH1cblxuICAgIHJldHVybiBjb25zdHJ1Y3RlZFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBcGlQYXRoKCkgKyB0aGlzLmdldFVzZXJQYXRoKCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoUGF0aChvQXV0aFR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IG9BdXRoUGF0aDogc3RyaW5nO1xuXG4gICAgb0F1dGhQYXRoID0gdGhpcy5vcHRpb25zLm9BdXRoUGF0aHNbb0F1dGhUeXBlXTtcblxuICAgIGlmIChvQXV0aFBhdGggPT0gbnVsbCkge1xuICAgICAgb0F1dGhQYXRoID0gYC9hdXRoLyR7b0F1dGhUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9BdXRoUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhVcmwob0F1dGhQYXRoOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tVcmw6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzogeyBba2V5OnN0cmluZ106IHN0cmluZzsgfSk6IHN0cmluZyB7XG4gICAgbGV0IHVybDogc3RyaW5nO1xuXG4gICAgdXJsID0gICBgJHt0aGlzLm9wdGlvbnMub0F1dGhCYXNlfS8ke29BdXRoUGF0aH1gO1xuICAgIHVybCArPSAgYD9vbW5pYXV0aF93aW5kb3dfdHlwZT0ke3dpbmRvd1R5cGV9YDtcbiAgICB1cmwgKz0gIGAmYXV0aF9vcmlnaW5fdXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNhbGxiYWNrVXJsKX1gO1xuXG4gICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdXJsICs9IGAmcmVzb3VyY2VfY2xhc3M9JHt0aGlzLnVzZXJUeXBlLm5hbWV9YDtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgIHVybCArPSBgJiR7a2V5fT0ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXNba2V5XSl9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogR2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBUcnkgdG8gbG9hZCBhdXRoIGRhdGFcbiAgcHJpdmF0ZSB0cnlMb2FkQXV0aERhdGEoKTogdm9pZCB7XG5cbiAgICBjb25zdCB1c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlclR5cGUnKSk7XG5cbiAgICBpZiAodXNlclR5cGUpIHtcbiAgICAgIHRoaXMudXNlclR5cGUgPSB1c2VyVHlwZTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIGlmICh0aGlzLmFjdGl2YXRlZFJvdXRlKSB7XG4gICAgICB0aGlzLmdldEF1dGhEYXRhRnJvbVBhcmFtcygpO1xuICAgIH1cblxuICAgIC8vIGlmICh0aGlzLmF1dGhEYXRhKSB7XG4gICAgLy8gICAgIHRoaXMudmFsaWRhdGVUb2tlbigpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFBhcnNlIEF1dGggZGF0YSBmcm9tIHJlc3BvbnNlXG4gIHB1YmxpYyBnZXRBdXRoSGVhZGVyc0Zyb21SZXNwb25zZShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBoZWFkZXJzID0gZGF0YS5oZWFkZXJzO1xuXG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGhlYWRlcnMuZ2V0KCdhY2Nlc3MtdG9rZW4nKSxcbiAgICAgIGNsaWVudDogICAgICAgICBoZWFkZXJzLmdldCgnY2xpZW50JyksXG4gICAgICBleHBpcnk6ICAgICAgICAgaGVhZGVycy5nZXQoJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIGhlYWRlcnMuZ2V0KCd0b2tlbi10eXBlJyksXG4gICAgICB1aWQ6ICAgICAgICAgICAgaGVhZGVycy5nZXQoJ3VpZCcpLFxuICAgICAgcHJvdmlkZXI6ICAgICAgIGhlYWRlcnMuZ2V0KCdwcm92aWRlcicpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gUGFyc2UgQXV0aCBkYXRhIGZyb20gcG9zdCBtZXNzYWdlXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgYXV0aERhdGE6IEF1dGhEYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46ICAgIGRhdGFbJ2F1dGhfdG9rZW4nXSxcbiAgICAgIGNsaWVudDogICAgICAgICBkYXRhWydjbGllbnRfaWQnXSxcbiAgICAgIGV4cGlyeTogICAgICAgICBkYXRhWydleHBpcnknXSxcbiAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgIHVpZDogICAgICAgICAgICBkYXRhWyd1aWQnXSxcbiAgICAgIHByb3ZpZGVyOiAgICAgICBkYXRhWydwcm92aWRlciddXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSBzdG9yYWdlLlxuICBwdWJsaWMgZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY2Nlc3NUb2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuVHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VpZCcpLFxuICAgICAgcHJvdmlkZXI6ICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Byb3ZpZGVyJylcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgIHRoaXMuYXV0aERhdGEgPSBhdXRoRGF0YTtcbiAgICB9XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IGF1dGggZGF0YSBmcm9tIHVybCBwYXJhbWV0ZXJzLlxuICBwcml2YXRlIGdldEF1dGhEYXRhRnJvbVBhcmFtcygpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZShxdWVyeVBhcmFtcyA9PiB7XG4gICAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiAgICBxdWVyeVBhcmFtc1sndG9rZW4nXSB8fCBxdWVyeVBhcmFtc1snYXV0aF90b2tlbiddLFxuICAgICAgICBjbGllbnQ6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2NsaWVudF9pZCddLFxuICAgICAgICBleHBpcnk6ICAgICAgICAgcXVlcnlQYXJhbXNbJ2V4cGlyeSddLFxuICAgICAgICB0b2tlblR5cGU6ICAgICAgJ0JlYXJlcicsXG4gICAgICAgIHVpZDogICAgICAgICAgICBxdWVyeVBhcmFtc1sndWlkJ10sXG4gICAgICAgIHByb3ZpZGVyOiAgICAgICBxdWVyeVBhcmFtc1sncHJvdmlkZXInXVxuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNldCBBdXRoIERhdGFcbiAgICpcbiAgICovXG5cbiAgLy8gV3JpdGUgYXV0aCBkYXRhIHRvIHN0b3JhZ2VcbiAgcHJpdmF0ZSBzZXRBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jaGVja0F1dGhEYXRhKGF1dGhEYXRhKSkge1xuICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuXG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhY2Nlc3NUb2tlbicsIGF1dGhEYXRhLmFjY2Vzc1Rva2VuKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2NsaWVudCcsIGF1dGhEYXRhLmNsaWVudCk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleHBpcnknLCBhdXRoRGF0YS5leHBpcnkpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW5UeXBlJywgYXV0aERhdGEudG9rZW5UeXBlKTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VpZCcsIGF1dGhEYXRhLnVpZCk7XG5cbiAgICAgIGlmIChhdXRoRGF0YS5wcm92aWRlcikge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwcm92aWRlcicsIGF1dGhEYXRhLnByb3ZpZGVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyVHlwZScsIHRoaXMudXNlclR5cGUubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogVmFsaWRhdGUgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIENoZWNrIGlmIGF1dGggZGF0YSBjb21wbGV0ZSBhbmQgaWYgcmVzcG9uc2UgdG9rZW4gaXMgbmV3ZXJcbiAgcHJpdmF0ZSBjaGVja0F1dGhEYXRhKGF1dGhEYXRhOiBBdXRoRGF0YSk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKFxuICAgICAgYXV0aERhdGEuYWNjZXNzVG9rZW4gIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEuY2xpZW50ICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmV4cGlyeSAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS50b2tlblR5cGUgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudWlkICE9IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmF1dGhEYXRhICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF1dGhEYXRhLmV4cGlyeSA+PSB0aGlzLmF1dGhEYXRhLmV4cGlyeTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogT0F1dGhcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSByZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShhdXRoV2luZG93OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHBvbGxlck9ic2VydiA9IGludGVydmFsKDUwMCk7XG5cbiAgICBjb25zdCByZXNwb25zZU9ic2VydiA9IGZyb21FdmVudCh0aGlzLmdsb2JhbCwgJ21lc3NhZ2UnKS5waXBlKFxuICAgICAgcGx1Y2soJ2RhdGEnKSxcbiAgICAgIGZpbHRlcih0aGlzLm9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIpXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlU3Vic2NyaXB0aW9uID0gcmVzcG9uc2VPYnNlcnYuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKTtcblxuICAgIGNvbnN0IHBvbGxlclN1YnNjcmlwdGlvbiA9IHBvbGxlck9ic2Vydi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKGF1dGhXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgIHBvbGxlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXV0aFdpbmRvdy5wb3N0TWVzc2FnZSgncmVxdWVzdENyZWRlbnRpYWxzJywgJyonKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXNwb25zZU9ic2VydjtcbiAgfVxuXG4gIHByaXZhdGUgb0F1dGhXaW5kb3dSZXNwb25zZUZpbHRlcihkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmIChkYXRhLm1lc3NhZ2UgPT09ICdkZWxpdmVyQ3JlZGVudGlhbHMnXG4gICAgICB8fCBkYXRhLm1lc3NhZ2UgPT09ICdhdXRoRmFpbHVyZSdcbiAgICAgIHx8IGRhdGEubWVzc2FnZSA9PT0gJ2RlbGl2ZXJQcm92aWRlckF1dGgnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBVdGlsaXRpZXNcbiAgICpcbiAgICovXG5cbiAgLy8gTWF0Y2ggdXNlciBjb25maWcgYnkgdXNlciBjb25maWcgbmFtZVxuICBwcml2YXRlIGdldFVzZXJUeXBlQnlOYW1lKG5hbWU6IHN0cmluZyk6IFVzZXJUeXBlIHtcbiAgICBpZiAobmFtZSA9PSBudWxsIHx8IHRoaXMub3B0aW9ucy51c2VyVHlwZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VyVHlwZXMuZmluZChcbiAgICAgIHVzZXJUeXBlID0+IHVzZXJUeXBlLm5hbWUgPT09IG5hbWVcbiAgICApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwRXZlbnQsIEh0dHBSZXF1ZXN0LCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBIYW5kbGVyLCBIdHRwUmVzcG9uc2UsIEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5PcHRpb25zIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlblNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb2tlbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgcHJpdmF0ZSBhdE9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoIHByaXZhdGUgdG9rZW5TZXJ2aWNlOiBBbmd1bGFyVG9rZW5TZXJ2aWNlICkge1xuICB9XG5cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG5cbiAgICAvLyBHZXQgYXV0aCBkYXRhIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgIHRoaXMudG9rZW5TZXJ2aWNlLmdldEF1dGhEYXRhRnJvbVN0b3JhZ2UoKTtcblxuICAgIC8vIEFkZCB0aGUgaGVhZGVycyBpZiB0aGUgcmVxdWVzdCBpcyBnb2luZyB0byB0aGUgY29uZmlndXJlZCBzZXJ2ZXJcbiAgICBpZiAodGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhICYmICh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlID09PSBudWxsIHx8IHJlcS51cmwubWF0Y2godGhpcy50b2tlblNlcnZpY2UuYXBpQmFzZSkpKSB7XG5cblxuICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgJ2FjY2Vzcy10b2tlbic6IHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5hY2Nlc3NUb2tlbixcbiAgICAgICAgJ2NsaWVudCc6ICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS5jbGllbnQsXG4gICAgICAgICdleHBpcnknOiAgICAgICB0aGlzLnRva2VuU2VydmljZS5jdXJyZW50QXV0aERhdGEuZXhwaXJ5LFxuICAgICAgICAndG9rZW4tdHlwZSc6ICAgdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnRva2VuVHlwZSxcbiAgICAgICAgJ3VpZCc6ICAgICAgICAgIHRoaXMudG9rZW5TZXJ2aWNlLmN1cnJlbnRBdXRoRGF0YS51aWRcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy50b2tlblNlcnZpY2UuY3VycmVudEF1dGhEYXRhLnByb3ZpZGVyO1xuICAgICAgaWYgKHByb3ZpZGVyKSB7XG4gICAgICAgIGhlYWRlcnNbJ3Byb3ZpZGVyJ10gPSBwcm92aWRlcjtcbiAgICAgIH1cblxuICAgICAgLy8gQ3VzdG9tIGhlYWRlcnMgcGFzc2VkIGluIGZvciBlYWNoIHJlcXVlc3RcbiAgICAgIGNvbnN0IGdsb2JhbE9wdGlvbnMgPSB0aGlzLnRva2VuU2VydmljZS5nbG9iYWxPcHRpb25zO1xuICAgICAgaWYgKGdsb2JhbE9wdGlvbnMgJiYgZ2xvYmFsT3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBnbG9iYWxPcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICBoZWFkZXJzW2tleV0gPSBnbG9iYWxPcHRpb25zLmhlYWRlcnNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXEgPSByZXEuY2xvbmUoe1xuICAgICAgICBzZXRIZWFkZXJzOiBoZWFkZXJzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKS5waXBlKHRhcChcbiAgICAgICAgcmVzID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UocmVzKSxcbiAgICAgICAgZXJyID0+IHRoaXMuaGFuZGxlUmVzcG9uc2UoZXJyKVxuICAgICkpO1xuICB9XG5cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSByZXNwb25zZVxuICBwcml2YXRlIGhhbmRsZVJlc3BvbnNlKHJlczogYW55KTogdm9pZCB7XG4gICAgaWYgKHJlcyBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSB8fCByZXMgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSkge1xuICAgICAgaWYgKHRoaXMudG9rZW5TZXJ2aWNlLmFwaUJhc2UgPT09IG51bGwgfHwgKHJlcy51cmwgJiYgcmVzLnVybC5tYXRjaCh0aGlzLnRva2VuU2VydmljZS5hcGlCYXNlKSkpIHtcbiAgICAgICAgdGhpcy50b2tlblNlcnZpY2UuZ2V0QXV0aEhlYWRlcnNGcm9tUmVzcG9uc2UoPGFueT5yZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgTmdNb2R1bGUsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE9wdGlvbmFsLCBTa2lwU2VsZiwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEhUVFBfSU5URVJDRVBUT1JTIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5PcHRpb25zIH0gZnJvbSAnLi9hbmd1bGFyLXRva2VuLm1vZGVsJztcbmltcG9ydCB7IEFuZ3VsYXJUb2tlblNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5pbXBvcnQgeyBBbmd1bGFyVG9rZW5JbnRlcmNlcHRvciB9IGZyb20gJy4vYW5ndWxhci10b2tlbi5pbnRlcmNlcHRvcic7XG5pbXBvcnQgeyBBTkdVTEFSX1RPS0VOX09QVElPTlMgfSBmcm9tICcuL2FuZ3VsYXItdG9rZW4udG9rZW4nO1xuXG5leHBvcnQgKiBmcm9tICcuL2FuZ3VsYXItdG9rZW4uc2VydmljZSc7XG5cbkBOZ01vZHVsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhclRva2VuTW9kdWxlIHtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwYXJlbnRNb2R1bGU6IEFuZ3VsYXJUb2tlbk1vZHVsZSkge1xuICAgIGlmIChwYXJlbnRNb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQW5ndWxhclRva2VuIGlzIGFscmVhZHkgbG9hZGVkLiBJdCBzaG91bGQgb25seSBiZSBpbXBvcnRlZCBpbiB5b3VyIGFwcGxpY2F0aW9uXFwncyBtYWluIG1vZHVsZS4nKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIGZvclJvb3Qob3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucyk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQW5ndWxhclRva2VuTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogQW5ndWxhclRva2VuSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucy5hbmd1bGFyVG9rZW5PcHRpb25zUHJvdmlkZXIgfHxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyxcbiAgICAgICAgICB1c2VWYWx1ZTogb3B0aW9uc1xuICAgICAgICB9LFxuICAgICAgICBBbmd1bGFyVG9rZW5TZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIkluamVjdGlvblRva2VuIiwiaXNQbGF0Zm9ybVNlcnZlciIsInNoYXJlIiwiZmluYWxpemUiLCJpbnRlcnZhbCIsImZyb21FdmVudCIsInBsdWNrIiwiZmlsdGVyIiwiSW5qZWN0YWJsZSIsIkh0dHBDbGllbnQiLCJJbmplY3QiLCJQTEFURk9STV9JRCIsIkFjdGl2YXRlZFJvdXRlIiwiT3B0aW9uYWwiLCJSb3V0ZXIiLCJ0YXAiLCJIdHRwUmVzcG9uc2UiLCJIdHRwRXJyb3JSZXNwb25zZSIsIkhUVFBfSU5URVJDRVBUT1JTIiwiTmdNb2R1bGUiLCJTa2lwU2VsZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBRUEsUUFBYSxxQkFBcUIsR0FBRyxJQUFJQSxpQkFBYyxDQUFDLHVCQUF1QixDQUFDOzs7Ozs7QUNGaEY7UUE2REUsNkJBQ1UsSUFBZ0IsRUFDTyxNQUFXLEVBQ2IsVUFBa0IsRUFDM0IsY0FBOEIsRUFDOUIsTUFBYztZQUoxQixTQUFJLEdBQUosSUFBSSxDQUFZO1lBRUssZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUMzQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDOUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQVA1QixpQkFBWSxHQUFrQixFQUFFLENBQUM7WUFTdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBRTVELElBQUlDLHVCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHO29CQUNaLElBQUksRUFBRSxjQUFNLE9BQUEsSUFBSSxHQUFBO29CQUNoQixRQUFRLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLEdBQUc7d0JBQ1QsTUFBTSxFQUFFLEdBQUc7cUJBQ1o7aUJBQ0YsQ0FBQztnQkFFRixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxjQUFNLE9BQUEsSUFBSSxHQUFBLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FB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