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

  public form: FormGroup = new FormGroup(
    {
      email: new FormControl("admin@admin.ru", Validators.required),
      password: new FormControl("password", Validators.required)
    }
  )

  login() {
    const credentials: ICredentials = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value
    }
    this.service.login(credentials).subscribe( token => {
      console.log(token);
      this.service.saveToken(token.token);
    });
  }

}
