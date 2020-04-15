"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var router_1 = require("@angular/router");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/share");
require("rxjs/add/observable/interval");
require("rxjs/add/observable/fromEvent");
require("rxjs/add/operator/pluck");
require("rxjs/add/operator/filter");
var Angular2TokenService = (function () {
    function Angular2TokenService(_http, _activatedRoute, _router) {
        this._http = _http;
        this._activatedRoute = _activatedRoute;
        this._router = _router;
    }
    Object.defineProperty(Angular2TokenService.prototype, "currentUserType", {
        get: function () {
            if (this._currentUserType != null)
                return this._currentUserType.name;
            else
                return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Angular2TokenService.prototype, "currentUserData", {
        get: function () {
            return this._currentUserData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Angular2TokenService.prototype, "currentAuthData", {
        get: function () {
            return this._currentAuthData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Angular2TokenService.prototype, "currentAuthHeaders", {
        get: function () {
            if (this._currentAuthData != null) {
                return new http_1.Headers({
                    'access-token': this._currentAuthData.accessToken,
                    'client': this._currentAuthData.client,
                    'expiry': this._currentAuthData.expiry,
                    'token-type': this._currentAuthData.tokenType,
                    'uid': this._currentAuthData.uid,
                    'provider': this._currentAuthData.provider
                });
            }
            return new http_1.Headers;
        },
        enumerable: true,
        configurable: true
    });
    Angular2TokenService.prototype.userSignedIn = function () {
        return !!this._currentAuthData;
    };
    Angular2TokenService.prototype.canActivate = function () {
        if (this.userSignedIn())
            return true;
        else {
            // Store current location in storage (usefull for redirection after signing in)
            if (this._options.signInStoredUrlStorageKey) {
                localStorage.setItem(this._options.signInStoredUrlStorageKey, window.location.pathname + window.location.search);
            }
            // Redirect user to sign in if signInRedirect is set
            if (this._options.signInRedirect)
                this._router.navigate([this._options.signInRedirect]);
            return false;
        }
    };
    // Inital configuration
    Angular2TokenService.prototype.init = function (options) {
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
            registerAccountCallback: window.location.href,
            updatePasswordPath: 'auth',
            resetPasswordPath: 'auth/password',
            resetPasswordCallback: window.location.href,
            userTypes: null,
            oAuthBase: window.location.origin,
            oAuthPaths: {
                github: 'auth/github'
            },
            oAuthCallbackPath: 'oauth_callback',
            oAuthWindowType: 'newWindow',
            oAuthWindowOptions: null,
            globalOptions: {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        };
        this._options = Object.assign(defaultOptions, options);
        this._tryLoadAuthData();
    };
    /**
     *
     * Actions
     *
     */
    // Register request
    Angular2TokenService.prototype.registerAccount = function (registerData) {
        if (registerData.userType == null)
            this._currentUserType = null;
        else
            this._currentUserType = this._getUserTypeByName(registerData.userType);
        var body = JSON.stringify({
            email: registerData.email,
            name: registerData.name,
            nickname: registerData.nickname,
            password: registerData.password,
            password_confirmation: registerData.passwordConfirmation,
            confirm_success_url: this._options.registerAccountCallback
        });
        return this.post(this._getUserPath() + this._options.registerAccountPath, body);
    };
    // Delete Account
    Angular2TokenService.prototype.deleteAccount = function () {
        return this.delete(this._getUserPath() + this._options.deleteAccountPath);
    };
    // Sign in request and set storage
    Angular2TokenService.prototype.signIn = function (signInData) {
        var _this = this;
        if (signInData.userType == null)
            this._currentUserType = null;
        else
            this._currentUserType = this._getUserTypeByName(signInData.userType);
        var body = JSON.stringify({
            email: signInData.email,
            password: signInData.password
        });
        var observ = this.post(this._getUserPath() + this._options.signInPath, body);
        observ.subscribe(function (res) { return _this._currentUserData = res.json().data; }, function (_error) { return null; });
        return observ;
    };
    Angular2TokenService.prototype.signInOAuth = function (oAuthType, params) {
        var oAuthPath = this._getOAuthPath(oAuthType);
        var callbackUrl = window.location.origin + "/" + this._options.oAuthCallbackPath;
        var oAuthWindowType = this._options.oAuthWindowType;
        var authUrl = this._getOAuthUrl(oAuthPath, callbackUrl, oAuthWindowType, params);
        if (oAuthWindowType == 'newWindow') {
            var oAuthWindowOptions = this._options.oAuthWindowOptions;
            var windowOptions = '';
            if (oAuthWindowOptions) {
                for (var key in oAuthWindowOptions) {
                    windowOptions += "," + key + "=" + oAuthWindowOptions[key];
                }
            }
            var popup = window.open(authUrl, '_blank', "closebuttoncaption=Cancel" + windowOptions);
            return this._requestCredentialsViaPostMessage(popup);
        }
        else if (oAuthWindowType == 'sameWindow') {
            window.location.href = authUrl;
        }
        else {
            throw "Unsupported oAuthWindowType \"" + oAuthWindowType + "\"";
        }
    };
    Angular2TokenService.prototype.processOAuthCallback = function () {
        this._getAuthDataFromParams();
    };
    // Sign out request and delete storage
    Angular2TokenService.prototype.signOut = function () {
        var observ = this.delete(this._getUserPath() + this._options.signOutPath);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('client');
        localStorage.removeItem('expiry');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('uid');
        localStorage.removeItem('provider');
        this._currentAuthData = null;
        this._currentUserType = null;
        this._currentUserData = null;
        return observ;
    };
    // Validate token request
    Angular2TokenService.prototype.validateToken = function () {
        var _this = this;
        var observ = this.get(this._getUserPath() + this._options.validateTokenPath);
        observ.subscribe(function (res) { return _this._currentUserData = res.json().data; }, function (error) {
            if (error.status === 401 && _this._options.signOutFailedValidate) {
                _this.signOut();
            }
        });
        return observ;
    };
    // Update password request
    Angular2TokenService.prototype.updatePassword = function (updatePasswordData) {
        if (updatePasswordData.userType != null)
            this._currentUserType = this._getUserTypeByName(updatePasswordData.userType);
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
        var body = JSON.stringify(args);
        return this.put(this._getUserPath() + this._options.updatePasswordPath, body);
    };
    // Reset password request
    Angular2TokenService.prototype.resetPassword = function (resetPasswordData) {
        if (resetPasswordData.userType == null)
            this._currentUserType = null;
        else
            this._currentUserType = this._getUserTypeByName(resetPasswordData.userType);
        var body = JSON.stringify({
            email: resetPasswordData.email,
            redirect_url: this._options.resetPasswordCallback
        });
        return this.post(this._getUserPath() + this._options.resetPasswordPath, body);
    };
    /**
     *
     * HTTP Wrappers
     *
     */
    Angular2TokenService.prototype.get = function (url, options) {
        return this.request(this._mergeRequestOptionsArgs({
            url: this._getApiPath() + url,
            method: http_1.RequestMethod.Get
        }, options));
    };
    Angular2TokenService.prototype.post = function (url, body, options) {
        return this.request(this._mergeRequestOptionsArgs({
            url: this._getApiPath() + url,
            method: http_1.RequestMethod.Post,
            body: body
        }, options));
    };
    Angular2TokenService.prototype.put = function (url, body, options) {
        return this.request(this._mergeRequestOptionsArgs({
            url: this._getApiPath() + url,
            method: http_1.RequestMethod.Put,
            body: body
        }, options));
    };
    Angular2TokenService.prototype.delete = function (url, options) {
        return this.request(this._mergeRequestOptionsArgs({
            url: this._getApiPath() + url,
            method: http_1.RequestMethod.Delete
        }, options));
    };
    Angular2TokenService.prototype.patch = function (url, body, options) {
        return this.request(this._mergeRequestOptionsArgs({
            url: this._getApiPath() + url,
            method: http_1.RequestMethod.Patch,
            body: body
        }, options));
    };
    Angular2TokenService.prototype.head = function (path, options) {
        return this.request({
            method: http_1.RequestMethod.Head,
            url: this._getApiPath() + path
        });
    };
    Angular2TokenService.prototype.options = function (url, options) {
        return this.request(this._mergeRequestOptionsArgs({
            url: this._getApiPath() + url,
            method: http_1.RequestMethod.Options
        }, options));
    };
    // Construct and send Http request
    Angular2TokenService.prototype.request = function (options) {
        var baseRequestOptions;
        var baseHeaders = this._options.globalOptions.headers;
        // Merge auth headers to request if set
        if (this._currentAuthData != null) {
            Object.assign(baseHeaders, {
                'access-token': this._currentAuthData.accessToken,
                'client': this._currentAuthData.client,
                'expiry': this._currentAuthData.expiry,
                'token-type': this._currentAuthData.tokenType,
                'uid': this._currentAuthData.uid,
                'provider': this._currentAuthData.provider
            });
        }
        baseRequestOptions = new http_1.RequestOptions({
            headers: new http_1.Headers(baseHeaders)
        });
        // Merge standard and custom RequestOptions
        baseRequestOptions = baseRequestOptions.merge(options);
        var response = this._http.request(new http_1.Request(baseRequestOptions)).share();
        this._handleResponse(response);
        return response;
    };
    Angular2TokenService.prototype._mergeRequestOptionsArgs = function (options, addOptions) {
        var returnOptions = options;
        if (options)
            Object.assign(returnOptions, addOptions);
        return returnOptions;
    };
    // Check if response is complete and newer, then update storage
    Angular2TokenService.prototype._handleResponse = function (response) {
        var _this = this;
        response.subscribe(function (res) {
            _this._getAuthHeadersFromResponse(res);
        }, function (error) {
            _this._getAuthHeadersFromResponse(error);
        });
    };
    /**
     *
     * Get Auth Data
     *
     */
    // Try to load auth data
    Angular2TokenService.prototype._tryLoadAuthData = function () {
        var userType = this._getUserTypeByName(localStorage.getItem('userType'));
        if (userType)
            this._currentUserType = userType;
        this._getAuthDataFromStorage();
        this._getAuthDataFromParams();
        if (this._currentAuthData != null)
            this.validateToken();
    };
    // Parse Auth data from response
    Angular2TokenService.prototype._getAuthHeadersFromResponse = function (data) {
        var headers = data.headers;
        var authData = {
            accessToken: headers.get('access-token'),
            client: headers.get('client'),
            expiry: headers.get('expiry'),
            tokenType: headers.get('token-type'),
            uid: headers.get('uid'),
            provider: headers.get('provider')
        };
        this._setAuthData(authData);
    };
    // Parse Auth data from post message
    Angular2TokenService.prototype._getAuthDataFromPostMessage = function (data) {
        var authData = {
            accessToken: data['auth_token'],
            client: data['client_id'],
            expiry: data['expiry'],
            tokenType: 'Bearer',
            uid: data['uid'],
            provider: data['provider']
        };
        this._setAuthData(authData);
    };
    // Try to get auth data from storage.
    Angular2TokenService.prototype._getAuthDataFromStorage = function () {
        var authData = {
            accessToken: localStorage.getItem('accessToken'),
            client: localStorage.getItem('client'),
            expiry: localStorage.getItem('expiry'),
            tokenType: localStorage.getItem('tokenType'),
            uid: localStorage.getItem('uid'),
            provider: localStorage.getItem('provider')
        };
        if (this._checkAuthData(authData))
            this._currentAuthData = authData;
    };
    // Try to get auth data from url parameters.
    Angular2TokenService.prototype._getAuthDataFromParams = function () {
        var _this = this;
        if (this._activatedRoute.queryParams)
            this._activatedRoute.queryParams.subscribe(function (queryParams) {
                var authData = {
                    accessToken: queryParams['token'] || queryParams['auth_token'],
                    client: queryParams['client_id'],
                    expiry: queryParams['expiry'],
                    tokenType: 'Bearer',
                    uid: queryParams['uid'],
                    provider: queryParams['provider']
                };
                if (_this._checkAuthData(authData))
                    _this._currentAuthData = authData;
            });
    };
    /**
     *
     * Set Auth Data
     *
     */
    // Write auth data to storage
    Angular2TokenService.prototype._setAuthData = function (authData) {
        if (this._checkAuthData(authData)) {
            this._currentAuthData = authData;
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('client', authData.client);
            localStorage.setItem('expiry', authData.expiry);
            localStorage.setItem('tokenType', authData.tokenType);
            localStorage.setItem('uid', authData.uid);
            localStorage.setItem('provider', authData.provider);
            if (this._currentUserType != null)
                localStorage.setItem('userType', this._currentUserType.name);
        }
    };
    /**
     *
     * Validate Auth Data
     *
     */
    // Check if auth data complete and if response token is newer
    Angular2TokenService.prototype._checkAuthData = function (authData) {
        if (authData.accessToken != null &&
            authData.client != null &&
            authData.expiry != null &&
            authData.tokenType != null &&
            authData.uid != null) {
            if (this._currentAuthData != null)
                return authData.expiry >= this._currentAuthData.expiry;
            else
                return true;
        }
        else {
            return false;
        }
    };
    /**
     *
     * Construct Paths / Urls
     *
     */
    Angular2TokenService.prototype._getUserPath = function () {
        if (this._currentUserType == null)
            return '';
        else
            return this._currentUserType.path + '/';
    };
    Angular2TokenService.prototype._getApiPath = function () {
        var constructedPath = '';
        if (this._options.apiBase != null)
            constructedPath += this._options.apiBase + '/';
        if (this._options.apiPath != null)
            constructedPath += this._options.apiPath + '/';
        return constructedPath;
    };
    Angular2TokenService.prototype._getOAuthPath = function (oAuthType) {
        var oAuthPath;
        oAuthPath = this._options.oAuthPaths[oAuthType];
        if (oAuthPath == null)
            oAuthPath = "/auth/" + oAuthType;
        return oAuthPath;
    };
    Angular2TokenService.prototype._getOAuthUrl = function (oAuthPath, callbackUrl, windowType, params) {
        var url;
        url = this._options.oAuthBase + "/" + oAuthPath;
        url += "?omniauth_window_type=" + windowType;
        url += "&auth_origin_url=" + encodeURIComponent(callbackUrl);
        if (this._currentUserType != null) {
            url += "&resource_class=" + this._currentUserType.name;
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
     * OAuth
     *
     */
    Angular2TokenService.prototype._requestCredentialsViaPostMessage = function (authWindow) {
        var pollerObserv = Observable_1.Observable.interval(500);
        var responseObserv = Observable_1.Observable.fromEvent(window, 'message').pluck('data')
            .filter(this._oAuthWindowResponseFilter);
        var responseSubscription = responseObserv.subscribe(this._getAuthDataFromPostMessage.bind(this));
        var pollerSubscription = pollerObserv.subscribe(function () {
            if (authWindow.closed)
                pollerSubscription.unsubscribe();
            else
                authWindow.postMessage('requestCredentials', '*');
        });
        return responseObserv;
    };
    Angular2TokenService.prototype._oAuthWindowResponseFilter = function (data) {
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
    Angular2TokenService.prototype._getUserTypeByName = function (name) {
        if (name == null || this._options.userTypes == null)
            return null;
        return this._options.userTypes.find(function (userType) { return userType.name === name; });
    };
    return Angular2TokenService;
}());
Angular2TokenService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http,
        router_1.ActivatedRoute,
        router_1.Router])
], Angular2TokenService);
exports.Angular2TokenService = Angular2TokenService;
//# sourceMappingURL=angular2-token.service.js.map