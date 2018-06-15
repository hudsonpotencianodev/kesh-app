import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPessoaPage } from './login-pessoa';
import { PessoaProvider } from '../../../providers/pessoa/pessoa';

@NgModule({
  declarations: [
    LoginPessoaPage
  ],
  imports: [
    IonicPageModule.forChild(LoginPessoaPage)
  ],
  exports: [
    LoginPessoaPage
  ],
  providers:
    [
      PessoaProvider
    ]
})
export class LoginPessoaPageModule { }
