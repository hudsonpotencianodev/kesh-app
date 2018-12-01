import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, InfiniteScroll, ModalController } from 'ionic-angular';
import { PessoaProvider } from '../../../providers/pessoa/pessoa';
import { EmpresaProvider } from '../../../providers/empresa/empresa';
import { DadosPessoaEmpresa, Pessoa, PessoaEmpresa } from '../../../models/pessoa.model';
import { EmpresaLojaProvider } from '../../../providers/empresa-loja/empresa-loja';
import { Localizacao, RetornoRequestModel } from '../../../models/models.model';
import { UtilitariosProvider } from '../../../providers/utilitarios/utilitarios';

const tamanhoPagina = 10;

@IonicPage()
@Component({
  selector: 'page-home-pessoa',
  templateUrl: 'home-pessoa.html',
})

export class HomePessoaPage {

  pessoaEmpresas: DadosPessoaEmpresa[] = [];
  pessoaEmpresasLimit: DadosPessoaEmpresa[] = [];
  pessoa: Pessoa;
  mostrarPesquisa: boolean = false;
  estaCarregando = true;
  pagina = 0;
  minhaLocalizacao: Localizacao;
  inputPesquisa: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private pessoaProvider: PessoaProvider,
    private empresaProvider: EmpresaProvider,
    private utilitarios: UtilitariosProvider,
    private empresaLojaProvider: EmpresaLojaProvider) {
    this.empresaProvider;
    this.empresaLojaProvider;
  }

  ionViewDidLoad() {
    document.getElementsByTagName("img")
    this.pessoaProvider.ObtenhaDadosPessoa()
      .then((pessoa: Pessoa) => {
        this.pessoa = pessoa;
        this.obtenhaEmpresas();
      });
  }

  obtenhaEmpresas() {
    this.utilitarios.obtenhaLocalizacao()
      .then((localizacao) => {
        this.minhaLocalizacao = localizacao;
        this.pessoaProvider.obtenhaPessoaEPerfilEmpresas(localizacao)
          .then((retorno: DadosPessoaEmpresa[]) => {
            this.pessoaEmpresas = retorno;
            this.pessoaEmpresasLimit = this.utilitarios.pagine(retorno, this.pagina, tamanhoPagina);
            this.pagina++;
            this.estaCarregando = false
          })
          .catch((retorno: RetornoRequestModel) => {
            retorno;
            this.estaCarregando = false;
          });
      })
      .catch(() => {
        debugger;
        //quer dizer que clicou em tentar novamente ou deu erro
        setTimeout(() => {
          this.obtenhaEmpresas();
        }, 1000);
      })
  }

  abraPerfilEmpresa(pessoaEmpresa: DadosPessoaEmpresa) {
    this.navCtrl.push("PerfilEmpresaPage", pessoaEmpresa);
  }

  mostrePerfilPessoaModal() {
    this.navCtrl.push("PerfilPessoaPage");
  }

  onInput($event) {
    $event;
    var filtrados = this.pessoaEmpresas
      .filter(a => a.Perfil.Descricao.includes(this.inputPesquisa) || a.Empresa.Nome.includes(this.inputPesquisa));
    this.pessoaEmpresasLimit = this.utilitarios.pagine(filtrados, 0, tamanhoPagina);
  }

  doInfinite(infinit: InfiniteScroll) {
    this.pessoaEmpresasLimit = this.pessoaEmpresasLimit
      .concat(this.utilitarios.pagine(this.pessoaEmpresas, this.pagina, tamanhoPagina));
    this.pagina++;
    infinit.complete();
    if (this.pessoaEmpresasLimit.length == this.pessoaEmpresas.length)
      infinit.enable(false);
  }

  abraPopoverCatalogo(pessoaEmpresa: PessoaEmpresa, evento) {
    let modal = this.modalCtrl.create("CatalogoComponentPage",
      { catalogo: pessoaEmpresa.Catalogo },
      { cssClass: "popover-catalogo" });

    modal.present({ ev: evento });
  }
}
