﻿using Microsoft.EntityFrameworkCore;

namespace ProjetoMarketing.Areas.Pessoa.Context
{
    public class EmpresaContext : DbContext
    {
        public EmpresaContext(DbContextOptions<EmpresaContext> options) : base(options) {}

        public DbSet<Entidade.Pessoa.Pessoa> Pessoa { get; set; }
        public DbSet<Entidade.Pessoa.Usuario> Usuario { get; set; }
        public DbSet<Entidade.Pessoa.PessoaEmpresa> PessoaEmpresa { get; set; }
        public DbSet<Entidade.Empresa.PerfilEmpresa> PerfilEmpresa { get; set; }

    }
}
