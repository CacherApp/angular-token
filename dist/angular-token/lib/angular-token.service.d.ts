import { ActivatedRoute, Router, CanActivate } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignInData, RegisterData, UpdatePasswordData, ResetPasswordData, UserData, AuthData, GlobalOptions } from './angular-token.model';
export declare class AngularTokenService implements CanActivate {
    private http;
    private platformId;
    private activatedRoute;
    private router;
    readonly currentUserType: string;
    readonly currentUserData: UserData;
    readonly currentAuthData: AuthData;
    readonly apiBase: any;
    readonly globalOptions: GlobalOptions;
    private options;
    private userType;
    private authData;
    private userData;
    private global;
    private localStorage;
    constructor(http: HttpClient, config: any, platformId: Object, activatedRoute: ActivatedRoute, router: Router);
    setGlobalOptions(options: GlobalOptions): void;
    userSignedIn(): boolean;
    canActivate(route: any, state: any): boolean;
    /**
     *
     * Actions
     *
     */
    registerAccount(registerData: RegisterData): Observable<any>;
    deleteAccount(): Observable<any>;
    signIn(signInData: SignInData): Observable<any>;
    signInOAuth(oAuthType: string, params?: {
        [key: string]: string;
    }): Observable<any>;
    processOAuthCallback(): void;
    signOut(): Observable<any>;
    validateToken(): Observable<any>;
    updatePassword(updatePasswordData: UpdatePasswordData): Observable<any>;
    resetPassword(resetPasswordData: ResetPasswordData): Observable<any>;
    /**
     *
     * Construct Paths / Urls
     *
     */
    private getUserPath;
    private getApiPath;
    private getServerPath;
    private getOAuthPath;
    private getOAuthUrl;
    /**
     *
     * Get Auth Data
     *
     */
    private tryLoadAuthData;
    getAuthHeadersFromResponse(data: any): void;
    private getAuthDataFromPostMessage;
    getAuthDataFromStorage(): void;
    private getAuthDataFromParams;
    /**
     *
     * Set Auth Data
     *
     */
    private setAuthData;
    /**
     *
     * Validate Auth Data
     *
     */
    private checkAuthData;
    /**
     *
     * OAuth
     *
     */
    private requestCredentialsViaPostMessage;
    private oAuthWindowResponseFilter;
    /**
     *
     * Utilities
     *
     */
    private getUserTypeByName;
}
