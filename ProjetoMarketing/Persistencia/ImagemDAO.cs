﻿using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using ProjetoMarketing.Areas.Empresa.Models;
using ProjetoMarketing.Contexts;
using ProjetoMarketing.Entidade;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoMarketing.Persistencia
{
    public class ImagemDAO
    {
        private readonly CloudStorageAccount storageAccount =
        new CloudStorageAccount(new Microsoft.WindowsAzure.Storage.Auth.StorageCredentials("keshstorage", "uQ38I7/WISwdvlgg2JYztJjfzR1Yb5rfknp/DPYyi9W6Aa+fEZSaLecixteMDKR6zepty881+hNrqvpb9QSpfw=="), true);
        public const string imageType = ".jpg";
        private readonly PessoaEmpresaContext _context;
        public ImagemDAO(PessoaEmpresaContext contexto)
        {
            _context = contexto;
        }

        public void SaveImagemPerfilEmpresa(ImagemPerfil imagemPerfil, string container)
        {
            if (imagemPerfil.IdEmpresa == null || imagemPerfil.IdEmpresa == 0)
            {
                return;
            }

            SaveImagem(imagemPerfil.Imagem, imagemPerfil.IdEmpresa.ToString(), container);
        }

        public void SaveImagemPerfilPessoa(ImagemPerfil imagemPerfil, string container)
        {
            if (imagemPerfil.IdPessoa == null || imagemPerfil.IdPessoa == 0)
            {
                return;
            }

            SaveImagem(imagemPerfil.Imagem, imagemPerfil.IdPessoa.ToString(), container);
        }

        private void SaveImagemCatalogoContainer(byte[] imagem, string guidImagem, string container)
        {
            SaveImagem(imagem, guidImagem, container);
        }

        private void SaveImagem(byte[] imagem, string guidImagem, string containerName)
        {
            try
            {
                Task.Factory.StartNew(() =>
                {
                    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                    CloudBlobContainer container = blobClient.GetContainerReference(containerName);
                    CloudBlockBlob blockBlob = container.GetBlockBlobReference(guidImagem + imageType);
                    blockBlob.UploadFromByteArrayAsync(imagem, 0, imagem.Length);
                });
            }
            catch (System.Exception e)
            {
                throw e;
            }
        }

        private void DeleteImagemCatalogoContainer(string guidImagem, string nomeContainer)
        {
            try
            {
                Task.Factory.StartNew(() =>
                {
                    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                    CloudBlobContainer container = blobClient.GetContainerReference(nomeContainer);
                    CloudBlockBlob blockBlob = container.GetBlockBlobReference(guidImagem + imageType);
                    blockBlob.DeleteAsync();
                });
            }
            catch (System.Exception e)
            {
                throw e;
            }
        }

        public async Task<byte[]> ObtenhaImagem(long idImagem, string nomeContainer)
        {
            try
            {
                CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                CloudBlobContainer container = blobClient.GetContainerReference(nomeContainer);
                CloudBlockBlob blockBlob = container.GetBlockBlobReference(idImagem + imageType);

                MemoryStream memStream = new MemoryStream();

                await blockBlob.DownloadToStreamAsync(memStream);

                return memStream.ToArray();
            }
            catch (System.Exception e)
            {
                throw e;
            }
        }

        public Task AtualizeImagensCatalogo(List<ImagemCatalogoModel> Imagens, long idPerfilEmpresa, string container)
        {
            try
            {
                IQueryable<Entidade.Empresa.ImagemCatalogo> imagensSalvas = _context.ImagemCatalogo.Where(a => a.IdPerfilEmpresa == idPerfilEmpresa);

                foreach (ImagemCatalogoModel item in Imagens.Where(i => i.Imagem != null))
                {
                    Entidade.Empresa.ImagemCatalogo imagem = new Entidade.Empresa.ImagemCatalogo()
                    {
                        IdPerfilEmpresa = idPerfilEmpresa,
                        IdImagem = item.IdImagem
                    };

                    if (string.IsNullOrWhiteSpace(imagem.GuidImagem))
                    {
                        imagem.GuidImagem = Guid.NewGuid().ToString();
                        _context.ImagemCatalogo.Add(imagem);
                        item.IdImagem = imagem.IdImagem;
                        SaveImagemCatalogoContainer(item.Imagem, imagem.GuidImagem, container);
                    }
                    else
                    {
                        DeleteImagemCatalogoContainer(item.Guid, container);
                        SaveImagemCatalogoContainer(item.Imagem, imagem.GuidImagem, container);
                    }
                }

                foreach (string guid in imagensSalvas.Select(a => a.GuidImagem).Except(Imagens.Select(a => a.Guid)))
                {
                    DeleteImagemCatalogoContainer(guid, container);
                    _context.ImagemCatalogo.Remove(imagensSalvas.FirstOrDefault(a => a.GuidImagem == guid));
                }

               return _context.SaveChangesAsync();
            }
            catch (System.Exception e)
            {
                throw e;
            }
        }
    }
}
