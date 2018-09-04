import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarteiraPessoaPage } from './carteira-pessoa';
import { TransacaoProvider } from '../../../providers/transacao/transacao';
import { PessoaProvider } from '../../../providers/pessoa/pessoa';
import { EmpresaProvider } from '../../../providers/empresa/empresa';

@NgModule({
  declarations: [
    CarteiraPessoaPage,
  ],
  imports: [
    IonicPageModule.forChild(CarteiraPessoaPage),
  ],
  providers:
  [
    TransacaoProvider,
    PessoaProvider,
    EmpresaProvider
  ]
})
export class CarteiraPessoaPageModule {}
