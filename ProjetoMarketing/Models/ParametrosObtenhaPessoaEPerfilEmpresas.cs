﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoMarketing.Models
{
    public class ParametrosObtenhaPessoaEPerfilEmpresas : ParametrosRequestModel
    {
        public int IdPessoa { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}