import { Injectable } from '@angular/core';
import { ComunicacaoProvider } from '../comunicacao/comunicacao';
import { StorageProvider } from '../storage/storage';
import { User, RetornoRequestModel, RetornoLogin } from '../../models/models.model';
import { CadastroEmpresaModel, Perfil, DadosEmpresaAdmin, AtualizeContaModel } from '../../models/empresa.model';
import { StorageEmpresaProvider } from '../storage/storage-empresa';
import { EnumeradorDeCacheStorageEmpresa, Enumerador } from '../../models/enumeradores.model';

@Injectable()
export class EmpresaProvider {

  dadosAcesso: RetornoLogin;

  constructor(private storage: StorageProvider,
    private storageEmpresa: StorageEmpresaProvider,
    private comunicacao: ComunicacaoProvider) {
    this.dadosAcesso = this.storage.recupereDadosAcesso();
  }

  realizeLogin(usuario: User): Promise<RetornoLogin> {
    return new Promise<RetornoLogin>((resolve, reject) => {
      this.comunicacao.post("empresa/login/realizelogin", usuario)
        .then((resposta: RetornoRequestModel) => {
          let result: RetornoLogin = resposta.Result;
          this.dadosAcesso = result;
          this.addIdNotificacaoEmpresa();
          resolve(result);
          //Salva apenas o AccessToken. Os dados sao salvos após escolher entre admin e loja
          this.storage.armazeneDadosAcesso({ AccessToken: result.AccessToken } as RetornoLogin);
        })
        .catch((retorno) => {
          reject(retorno);
        });
    });
  }

  realizeLoginAdmin(usuario: User): Promise<RetornoRequestModel> {

    return new Promise<RetornoRequestModel>((resolve, reject) => {
      this.comunicacao.post("empresa/login/realizeLoginAdmin", usuario)
        .then((resposta: RetornoRequestModel) => {
          resolve(resposta);
          //Os dados são salvos na pagina de login, após escolher entre admin e loja
        })
        .catch((retorno) => {
          reject(retorno);
        });
    });
  }

  obtenhaDadosEmpresaAdmin() {

    var enumeradorDeCache = new EnumeradorDeCacheStorageEmpresa().obtenhaDadosEmpresaAdmin;
    if (this.estaEmCach(enumeradorDeCache)) {
      return new Promise<DadosEmpresaAdmin>(resolve => {
        var dados = this.storageEmpresa.recupereDadosEmpresaAdmin();
        resolve(dados);
      });
    }
    else {
      return new Promise<DadosEmpresaAdmin>(resolve => {
        this.comunicacao.post("empresa/empresa/ObtenhaDadosEmpresaAdmin", { IdEmpresa: this.dadosAcesso.IdEmpresa })
          .then((resposta: RetornoRequestModel) => {
            resolve(resposta.Result);
            this.storageEmpresa.armazeneDadosEmpresaAdmin(resposta.Result);
            this.storage.armazene(enumeradorDeCache.Descricao, new Date().getTime());
          })
          .catch(() => {

          });
      });
    }
  }

  obtenhaPerfisEmpresa() {

    var enumeradorDeCache = new EnumeradorDeCacheStorageEmpresa().obtenhaDadosEmpresaAdmin;
    if (this.estaEmCach(enumeradorDeCache)) {
      return new Promise<Perfil[]>(resolve => {
        var dados = this.storageEmpresa.recupereDadosPerfilsEmpresa();
        resolve(dados);
      });
    }
    else {
      return new Promise<Perfil[]>(resolve => {
        this.comunicacao.post("empresa/empresa/ObtenhaPerfisDaEmpresaParaSelecao", { IdEmpresa: this.dadosAcesso.IdEmpresa })
          .then((resposta: RetornoRequestModel) => {
            this.storageEmpresa.armazeneDadosPerfilsEmpresa(resposta.Result);
            this.storage.armazene(enumeradorDeCache.Descricao, new Date().getTime());
            resolve(resposta.Result);
          })
          .catch(() => {

          });
      });
    }
  }

  atualizeConta(conta: AtualizeContaModel) {
    return this.comunicacao.post("Empresa/Empresa/AtualizeContaEmpresa", conta);
  }

  cadastreEmpresa(empresa: CadastroEmpresaModel) {

    return new Promise<RetornoRequestModel>((resolve, reject) => {
      this.comunicacao.post("Empresa/Empresa/CadastreEmpresa", empresa)
        .then((resposta: RetornoRequestModel) => {
          this.storage.armazeneDadosAcesso(resposta.Result);
          resolve(resposta);
        })
        .catch((retorno) => {
          if (retorno && retorno.Erro == 2) {
            alert("Este email já existe");
          };
          reject(retorno);
        })
    });
  }

  private addIdNotificacaoEmpresa() {

    var tokenNotificacao = this.storage.recupereIdNotificacao();
    var idPerfilEmpresa = this.storageEmpresa.recupereIdPerfilEmpresa();

    if (!tokenNotificacao || !idPerfilEmpresa) {
      //SALVAR ARQUIVO DE LOG
      return;
    }

    return this.comunicacao.post("Empresa/Empresa/AddIdNotificacaoEmpresa",
      {
        IdPerfilEmpresa: idPerfilEmpresa,
        TokenNotificacao: tokenNotificacao
      });
  }

  obtenhaLogoEmpresa(idEmpresa: number) {
    return "https://keshstorage.blob.core.windows.net/perfilempresa/" + idEmpresa + ".jpg";
    //return ComunicacaoSettings.UrlApiBase + "Empresa/Imagem/ObtenhaLogoEmpresa?idEmpresa=" + idEmpresa;
  }

  estaEmCach(enumerador: Enumerador) {
    var cache = this.storage.recupere(enumerador.Descricao);
    if (cache && cache != undefined) {
      return !navigator.onLine || (cache > (new Date().getTime() - ((24 * 60 * 60 * 1000) * 1)))
    }
    return false;
  }
}