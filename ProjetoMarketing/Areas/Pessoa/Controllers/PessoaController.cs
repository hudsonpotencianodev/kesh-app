﻿using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProjetoMarketing.Autentication.Context;
using ProjetoMarketing.Areas.Pessoa.Persistencia;
using ProjetoMarketing.Models;
using ProjetoMarketing.Controllers;
using ProjetoMarketing.Areas.Pessoa.Models;
using ProjetoMarketing.Autentication;
using ProjetoMarketing.Data;
using System.Threading.Tasks;
using ProjetoMarketing.Contexts;

namespace ProjetoMarketing.Areas.Pessoa.Controllers
{
    [Produces("application/json")]
    [Route("api/Pessoa/Pessoa")]
    public class PessoaController : ControladorBase
    {
        private readonly PessoaEmpresaContext _context;
        private readonly UsuarioContext _contextUsuario;

        public PessoaController(PessoaEmpresaContext context, UsuarioContext contextUsuario)
        {
            _context = context;
            _contextUsuario = contextUsuario;
        }

        [AllowAnonymous]
        [HttpPost("CadastrePessoa")]
        public RetornoRequestModel CadastrePessoa([FromBody] ParametrosCadastroPessoa model,
                                                [FromServices]SigningConfigurations signingConfigurations,
                                                [FromServices]TokenConfigurations tokenConfigurations)
        {
            if (_context.Pessoa.Any(p => p.Email == model.Email))
            {
                return RetornoRequestModel.CrieFalhaDuplicidade();
            }

            var retorno = new RetornoRequestModel();

            var pessoa = new Entidade.Pessoa.Pessoa();

            new PessoaDAO(_context).AddPessoa(model, out pessoa);

            if (pessoa.IdPessoa != 0)
            {
                var usuario = new Entidade.Usuario()
                {
                    IdPessoa = pessoa.IdPessoa,
                    Login = model.Email,
                    Senha = model.Senha
                };

                new UsuarioDAO(_contextUsuario).Add(usuario);
                var user = new User(usuario.Login, usuario.Senha);

                retorno.Result = Projecoes.ProjecaoRetornoCadastroPessoaUsuario(usuario, GenerateAcessToken(user.Login, signingConfigurations, tokenConfigurations));

                return retorno;
            }

            return RetornoRequestModel.CrieFalha();
        }

        [Authorize("Bearer")]
        [HttpPost("ObtenhaDadosPessoa")]
        public async Task<RetornoRequestModel> ObtenhaDadosPessoa([FromBody]ParametrosObtenhaDadosPessoa parametros)
        {
            if (!EstaAutenticado(_contextUsuario, parametros.Token))
                return RetornoRequestModel.CrieFalhaLogin();

            var retorno = new RetornoRequestModel
            {
                Result = Projecoes.DadosPessoa(await new PessoaDAO(_context).Select(parametros.IdPessoa))
            };

            return retorno;
        }

        [Authorize("Bearer")]
        [HttpPost("ObtenhaPessoaEPerfilEmpresas")]
        public async Task<RetornoRequestModel> ObtenhaPessoaEPerfilEmpresas([FromBody]ParametrosObtenhaPessoaEPerfilEmpresas parametros)
        {
            if (!EstaAutenticado(_contextUsuario, parametros.Token))
                return RetornoRequestModel.CrieFalhaLogin();

            var retorno = new RetornoRequestModel
            {
                Result = Projecoes.PessoaEmpresas(await new PessoaDAO(_context).ObtenhaPessoaEmpresas(parametros))
            };

            return retorno;
        }

        [Authorize("Bearer")]
        [HttpPost("ObtenhaComentarioENotaPessoasEmpresas")]
        public async Task<RetornoRequestModel> ObtenhaComentarioENotaPessoasEmpresas([FromBody]ParametrosObtenhaNotasComentarios parametros)
        {
            if (!EstaAutenticado(_contextUsuario, parametros.Token))
                return RetornoRequestModel.CrieFalhaLogin();

            var pessoaEmpresas = await new PessoaDAO(_context).ObtenhaComentarioENotaPessoasEmpresas(parametros);

            var retorno = new RetornoRequestModel
            {
                Result = Projecoes.NotasEComentariosPessoasEmpresas(pessoaEmpresas)
            };

            return retorno;
        }

        [Authorize("Bearer")]
        [HttpPost("ObtenhaPessoaParaCompartilhamento")]
        public async Task<RetornoRequestModel> ObtenhaPessoaParaCompartilhamento([FromBody]ParametrosObtenhaPessoasCompartilhamento parametros)
        {
            if (!EstaAutenticado(_contextUsuario, parametros.Token))
                return RetornoRequestModel.CrieFalhaLogin();

            var pessoas = await new PessoaDAO(_context).ObtenhaPessoasCompartilhamento(parametros);

            var retorno = new RetornoRequestModel
            {
                Result = Projecoes.PessoasCompartilhamento(pessoas)
            };

            return retorno;
        }

        [Authorize("Bearer")]
        [HttpPost("AtualizeDadosPessoaEmpresa")]
        public RetornoRequestModel AtualizeDadosPessoaEmpresa([FromBody]ParametrosAtualizeDadosPessoaEmpresa parametros)
        {
            if (!EstaAutenticado(_contextUsuario, parametros.Token))
                return RetornoRequestModel.CrieFalhaLogin();

            try
            {
                new PessoaDAO(_context).AddOrUpdatePessoaEmpresa(parametros);
                return RetornoRequestModel.CrieSucesso();
            }
            catch
            {
                return RetornoRequestModel.CrieFalha();
            }
        }

        //[Authorize("Bearer")]
        //[HttpGet("AtualizeFotoPessoa")]
        //public async Task<RetornoRequestModel> AtualizeFotoPessoa([FromBody] ParametrosAtualizeFoto parametros)
        //{
        //    if (!EstaAutenticado(_contextUsuario, parametros.Token))
        //        return RetornoRequestModel.CrieFalhaLogin();

        //    await new PessoaDAO(_context).UpdateImagemPerfil(parametros);

        //    return RetornoRequestModel.CrieSucesso();
        //}

        [AllowAnonymous]
        [HttpGet("ObtenhaFotoPessoa")]
        public ActionResult ObtenhaFotoPessoa(int idPessoa)
        {
            var foto = _context.ImagemPerfil.First(p => p.IdPessoa == idPessoa)?.Imagem;

            if (foto == null) return null;

            return File(foto, "image/jpeg");
        }
    }
}