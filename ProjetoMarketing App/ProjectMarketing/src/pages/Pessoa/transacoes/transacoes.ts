import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EmpresaProvider } from '../../../providers/empresa/empresa';
import { PessoaProvider } from '../../../providers/pessoa/pessoa';
import { TransacaoProvider } from '../../../providers/transacao/transacao';
import { DTOCupomVenda } from '../../../models/models.model';

@IonicPage()
@Component({
  selector: 'page-transacoes',
  templateUrl: 'transacoes.html',
})
export class TransacoesPage {
  
  cuponsVendas: DTOCupomVenda[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private transacaoProvider: TransacaoProvider,
    private pessoaProvider: PessoaProvider,
    private empresaProvider: EmpresaProvider) {
      
  }

  ionViewDidLoad() {
    this.transacaoProvider.ObtenhaCuponsEVendasPessoa(this.pessoaProvider.dadosAcesso.IdPessoa)
      .then((resultado: DTOCupomVenda[]) => {
        this.cuponsVendas = resultado;
      })
  }

  abraQrCode(cupomVenda: DTOCupomVenda) {
    this.navCtrl.push("CupomPage", cupomVenda.Cupom);
  }

  obtenhaLogoEmpresa(idEmpresa: number) {

    return this.empresaProvider.obtenhaLogoEmpresa(idEmpresa);
  }

}
