import { CanActivate } from '@angular/router';
import { Http, Response, Headers, RequestOptionsArgs } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/filter';
import { SignInData, RegisterData, UpdatePasswordData, ResetPasswordData, UserData, AuthData, Angular2TokenOptions } from './angular2-token.model';
export declare class Angular2TokenService implements CanActivate {
    private _http;
    private _activatedRoute;
    private _router;
    readonly currentUserType: string;
    readonly currentUserData: UserData;
    readonly currentAuthData: AuthData;
    readonly currentAuthHeaders: Headers;
    private _options;
    private _currentUserType;
    private _currentAuthData;
    private _currentUserData;
    constructor(_http: Http, _activatedRoute: ActivatedRoute, _router: Router);
    userSignedIn(): boolean;
    canActivate(): boolean;
    init(options?: Angular2TokenOptions): void;
    /**
     *
     * Actions
     *
     */
    registerAccount(registerData: RegisterData): Observable<Response>;
    deleteAccount(): Observable<Response>;
    signIn(signInData: SignInData): Observable<Response>;
    signInOAuth(oAuthType: string, params?: {
        [key: string]: string;
    }): Observable<any>;
    processOAuthCallback(): void;
    signOut(): Observable<Response>;
    validateToken(): Observable<Response>;
    updatePassword(updatePasswordData: UpdatePasswordData): Observable<Response>;
    resetPassword(resetPasswordData: ResetPasswordData): Observable<Response>;
    /**
     *
     * HTTP Wrappers
     *
     */
    get(url: string, options?: RequestOptionsArgs): Observable<Response>;
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    delete(url: string, options?: RequestOptionsArgs): Observable<Response>;
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    head(path: string, options?: RequestOptionsArgs): Observable<Response>;
    options(url: string, options?: RequestOptionsArgs): Observable<Response>;
    request(options: RequestOptionsArgs): Observable<Response>;
    private _mergeRequestOptionsArgs(options, addOptions?);
    private _handleResponse(response);
    /**
     *
     * Get Auth Data
     *
     */
    private _tryLoadAuthData();
    private _getAuthHeadersFromResponse(data);
    private _getAuthDataFromPostMessage(data);
    private _getAuthDataFromStorage();
    private _getAuthDataFromParams();
    /**
     *
     * Set Auth Data
     *
     */
    private _setAuthData(authData);
    /**
     *
     * Validate Auth Data
     *
     */
    private _checkAuthData(authData);
    /**
     *
     * Construct Paths / Urls
     *
     */
    private _getUserPath();
    private _getApiPath();
    private _getOAuthPath(oAuthType);
    private _getOAuthUrl(oAuthPath, callbackUrl, windowType, params?);
    /**
     *
     * OAuth
     *
     */
    private _requestCredentialsViaPostMessage(authWindow);
    private _oAuthWindowResponseFilter(data);
    /**
     *
     * Utilities
     *
     */
    private _getUserTypeByName(name);
}
