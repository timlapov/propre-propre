import {Component, inject} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ICredentials, IToken} from "../../services/auth";
import {Observable} from "rxjs";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  service = inject(AuthService);
  router = inject(Router);

  public form: FormGroup = new FormGroup( {
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required)
    }
  )

  login() {
    const credentials: ICredentials = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value
    }
    const token: Observable<IToken> = this.service.login(credentials);
    console.log(token);
    // this.service.saveToken(token);
  }

  logout() {

  }
}
