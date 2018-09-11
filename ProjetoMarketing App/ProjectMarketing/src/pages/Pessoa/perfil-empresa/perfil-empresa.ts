import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular';
import { NotaComentarioPessoaEmpresa } from '../../../models/empresa.model';
import { PessoaProvider } from '../../../providers/pessoa/pessoa';
import { Cupom } from '../../../models/models.model';
import { EmpresaProvider } from '../../../providers/empresa/empresa';
import { TransacaoProvider } from '../../../providers/transacao/transacao';
import { StorageTransacaoProvider } from '../../../providers/storage/storage-transacao';
import { StoragePessoaProvider } from '../../../providers/storage/storage-pessoa';
import { SocialSharing } from '../../../../node_modules/@ionic-native/social-sharing';
import { Pessoa, DadosPessoaEmpresa } from '../../../models/pessoa.model';
import { EmpresaLojaProvider } from '../../../providers/empresa-loja/empresa-loja';
import { PhotoViewer } from '@ionic-native/photo-viewer';

@IonicPage()
@Component({
  selector: 'page-perfil-empresa',
  templateUrl: 'perfil-empresa.html',
})
export class PerfilEmpresaPage {

  dadosPessoaEmpresa: DadosPessoaEmpresa = new DadosPessoaEmpresa();
  podeCompartilhar = false;
  notasComentariosPessoasEmpresas: NotaComentarioPessoaEmpresa[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public empresaProvider: EmpresaProvider,
    public pessoaProvider: PessoaProvider,
    public storageTransacaoProvider: StorageTransacaoProvider,
    private transacaoProvider: TransacaoProvider,
    private storagePessoaProvider: StoragePessoaProvider,
    private platform: Platform,
    private socialSharing: SocialSharing,
    private modalCtrl: ModalController,
    private empresaLojaProvider: EmpresaLojaProvider,
    private photoViewer: PhotoViewer) {
    this.empresaLojaProvider;
    this.empresaProvider;
    this.socialSharing;
    this.dadosPessoaEmpresa = this.navParams.data;
  }

  ionViewDidLoad() {

    this.transacaoProvider.PessoaPodeCompartilhar(this.dadosPessoaEmpresa.Perfil.IdPerfilEmpresa, this.pessoaProvider.dadosAcesso.IdPessoa)
      .then((podeCompartilhar: boolean) => {
        this.podeCompartilhar = podeCompartilhar;
      });

    this.pessoaProvider.ObtenhaComentarioENotaPessoasEmpresas(this.dadosPessoaEmpresa.Perfil.IdPerfilEmpresa)
      .then((notasComentariosPessoasEmpresas: NotaComentarioPessoaEmpresa[]) => {
        debugger;
        this.notasComentariosPessoasEmpresas = notasComentariosPessoasEmpresas;
      });
  }

  atualizeDadosPessoaEmpresa() {

    this.pessoaProvider.atualizeDadosPessoaEmpresa(this.dadosPessoaEmpresa.Perfil.IdPerfilEmpresa,
      this.dadosPessoaEmpresa.PessoaEmpresa.Comentario,
      this.dadosPessoaEmpresa.PessoaEmpresa.Nota)
      .then(() => {

        this.storagePessoaProvider.atualizeDadosPessoaEmpresa(this.dadosPessoaEmpresa);
      });
  }

  compartilhe() {

    let profileModal = this.modalCtrl.create("SelecaoPessoaCompartilhamentoPage", { idPerfilEmpresa: this.dadosPessoaEmpresa.Perfil.IdPerfilEmpresa });
    profileModal.onDidDismiss(data => {
      console.log(data);
    });
    profileModal.present();

    profileModal.onDidDismiss((pessoas: Pessoa[]) => {

      if (!pessoas) return;

      let idsPessoas = pessoas.map(p => p.IdPessoa);

      this.transacaoProvider
        .GereCupomCompartilhamento(this.dadosPessoaEmpresa.Perfil.IdPerfilEmpresa,
          this.dadosPessoaEmpresa.Empresa.IdEmpresa,
          this.pessoaProvider.dadosAcesso.IdPessoa,
          idsPessoas)
        .then(() => {
          this.podeCompartilhar = false;
        });
    })
  }

  maps() {

    this.navCtrl.push("MapsPage", { latitude: this.dadosPessoaEmpresa.Perfil.Latitude, longitude: this.dadosPessoaEmpresa.Perfil.Longitude });
  }

  rota() {

    let destination = this.dadosPessoaEmpresa.Perfil.Latitude + ',' + this.dadosPessoaEmpresa.Perfil.Longitude;

    if (this.platform.is('ios')) {
      window.open('maps://?q=' + destination, '_system');
    }
    else if (this.platform.is('android')) {
      let label = encodeURI(this.dadosPessoaEmpresa.Perfil.Descricao);
      window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }
  }

  abraCupom(cupom: Cupom) {
    this.navCtrl.push("CupomPage", cupom);
  }

  mostreNaoPodeCompartilhar() {

  }

  obtenhaArrayNota(nota) {
    if (!nota) return [];
    return Array(nota);
  }

  abraImagem(idImagem) {
    if (!idImagem) return;
    var url = this.empresaLojaProvider.obtenhaImagemCatalogo(idImagem);
    this.photoViewer.show(url, "");
  }
}