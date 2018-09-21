import { Injectable } from '@angular/core';
import { RetornoLogin } from '../../models/models.model';
import { UnidadeDeMedidaLocalizacao } from '../../models/pessoa.model';

@Injectable()
export class StorageProvider {

  DADOS_ACESSO = "DADOS_ACESSO";
  UNID_MEDIDA_LOCALIZACAO = "UNID_MEDIDA_LOCALIZACAO";
  CACHE_1DIA = "CACHE_1DIA";

  constructor() {
  }

  armazene(chave, valor) {
    if (typeof valor == 'object') {
      valor = JSON.stringify(valor);
    }
    localStorage.setItem(chave, valor);
  };

  recupere(chave) {

    var strArmazenado = localStorage.getItem(chave);
    var objArmazenado = null;
    if (strArmazenado != null) {
      try {
        objArmazenado = JSON.parse(strArmazenado);
      }
      catch (e) {
        objArmazenado = strArmazenado;
      }
    }
    return objArmazenado;
  };

  remova = function (chave) {
    localStorage.removeItem(chave);
  };

  //DADOS ACESSO
  armazeneUnidadeDeMedidaLocalizacao(value: UnidadeDeMedidaLocalizacao) {
    this.armazene(this.UNID_MEDIDA_LOCALIZACAO, value);
  }

  recupereUnidadeDeMedidaLocalizacao(): UnidadeDeMedidaLocalizacao {
    return this.recupere(this.UNID_MEDIDA_LOCALIZACAO);
  }

  //DADOS ACESSO
  armazeneDadosAcesso(value: any) {
    this.armazene(this.DADOS_ACESSO, value);
  }

  recupereDadosAcesso(): RetornoLogin {
    return this.recupere(this.DADOS_ACESSO);
  }

  removaDadosAcesso() {
    this.remova(this.DADOS_ACESSO);
  }
}
