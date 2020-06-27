import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class NoCacheHeadersInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const authReq = req.clone({
            setHeaders: {
                Pragma: 'no-cache',
                'Cache-Control': 'no-cache',

            }
        });
        return next.handle(authReq);
    }
}
