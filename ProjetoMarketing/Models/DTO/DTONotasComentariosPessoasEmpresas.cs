﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoMarketing.DTO
{
    public class DTONotasComentariosPessoasEmpresas
    {
        public string Nome { get; set; }
        public int IdPessoa { get; set; }
        public string Comentario { get; set; }
        public decimal? Nota { get; set; }
        public DateTime? DataAvaliacao { get; set; }
    }
}