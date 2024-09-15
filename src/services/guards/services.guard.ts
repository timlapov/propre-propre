import {CanActivateFn, Router } from '@angular/router';
import {AuthService} from "../auth.service";
import {inject} from "@angular/core";
import {ToastrService} from "ngx-toastr";

export const servicesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);


    if (authService.isLogged() && authService.hasRole('ROLE_EMPLOYEE')) {
      toastr.info('Pour passer une commande, créez un profil de client', 'Information',
        {
          timeOut: 3500,
          progressBar: true,
        }
        );
      return router.createUrlTree(['/employee/dashboard']);
    }

    return true;
};
