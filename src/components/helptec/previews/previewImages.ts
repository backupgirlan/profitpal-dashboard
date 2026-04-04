// Real preview images mapped by category and segment keywords
import siteSupermercado from "@/assets/previews/site-supermercado.jpg";
import siteBeleza from "@/assets/previews/site-beleza.jpg";
import siteRestaurante from "@/assets/previews/site-restaurante.jpg";
import siteImobiliaria from "@/assets/previews/site-imobiliaria.jpg";
import siteClinica from "@/assets/previews/site-clinica.jpg";
import siteEscritorio from "@/assets/previews/site-escritorio.jpg";
import siteAcademia from "@/assets/previews/site-academia.jpg";
import siteTurismo from "@/assets/previews/site-turismo.jpg";
import siteEnergiaSolar from "@/assets/previews/site-energia-solar.jpg";
import siteEscola from "@/assets/previews/site-escola.jpg";
import sitePetshop from "@/assets/previews/site-petshop.jpg";
import siteFarmacia from "@/assets/previews/site-farmacia.jpg";
import siteOficina from "@/assets/previews/site-oficina.jpg";
import siteIgreja from "@/assets/previews/site-igreja.jpg";
import siteFotografia from "@/assets/previews/site-fotografia.jpg";
import siteConstrucao from "@/assets/previews/site-construcao.jpg";
import siteMusica from "@/assets/previews/site-musica.jpg";

import sistemaGestao from "@/assets/previews/sistema-gestao.jpg";
import sistemaFinanceiro from "@/assets/previews/sistema-financeiro.jpg";
import sistemaCrm from "@/assets/previews/sistema-crm.jpg";
import sistemaEstoque from "@/assets/previews/sistema-estoque.jpg";
import sistemaPdv from "@/assets/previews/sistema-pdv.jpg";

import appDelivery from "@/assets/previews/app-delivery.jpg";
import appLoja from "@/assets/previews/app-loja.jpg";
import appAgendamento from "@/assets/previews/app-agendamento.jpg";
import appFood from "@/assets/previews/app-food.jpg";
import appFitness from "@/assets/previews/app-fitness.jpg";
import appPetshop from "@/assets/previews/app-petshop.jpg";

import iaChatbot from "@/assets/previews/ia-chatbot.jpg";
import iaAnalytics from "@/assets/previews/ia-analytics.jpg";
import iaAutomacao from "@/assets/previews/ia-automacao.jpg";

import landingCurso from "@/assets/previews/landing-curso.jpg";
import landingServicos from "@/assets/previews/landing-servicos.jpg";
import landingProduto from "@/assets/previews/landing-produto.jpg";
import landingSaas from "@/assets/previews/landing-saas.jpg";

import lojaRoupas from "@/assets/previews/loja-roupas.jpg";
import lojaEletronicos from "@/assets/previews/loja-eletronicos.jpg";
import lojaAlimentos from "@/assets/previews/loja-alimentos.jpg";
import lojaCosmeticos from "@/assets/previews/loja-cosmeticos.jpg";

type ImageMap = { keywords: string[]; src: string }[];

const siteImages: ImageMap = [
  { keywords: ["supermercado", "mercado", "agropecuária", "agropecuario"], src: siteSupermercado },
  { keywords: ["beleza", "salão", "salao", "barbearia", "cabeleireiro", "estética", "estetica"], src: siteBeleza },
  { keywords: ["restaurante", "hamburgueria", "pizzaria", "gastronomia", "lanchonete", "padaria", "confeitaria", "cafeteria"], src: siteRestaurante },
  { keywords: ["imobiliária", "imobiliaria", "imobiliário", "construtora", "hotel", "pousada", "aluguel"], src: siteImobiliaria },
  { keywords: ["clínica", "clinica", "dentista", "saúde", "saude", "médico", "medico", "hospital", "psicólogo", "psicologo", "nutricionista"], src: siteClinica },
  { keywords: ["advocacia", "contabilidade", "escritório", "escritorio", "consultoria", "advogado", "contador"], src: siteEscritorio },
  { keywords: ["academia", "fitness", "esporte", "gym", "crossfit", "pilates", "yoga"], src: siteAcademia },
  { keywords: ["turismo", "viagem", "agência de viagem", "agencia de viagem", "hotel", "pousada", "resort", "excursão", "excursao", "pacote"], src: siteTurismo },
  { keywords: ["energia solar", "solar", "fotovoltaica", "sustentável", "sustentavel", "energia limpa", "painéis", "paineis"], src: siteEnergiaSolar },
  { keywords: ["escola", "educação", "educacao", "colégio", "colegio", "curso", "faculdade", "universidade", "ensino", "creche", "infantil"], src: siteEscola },
  { keywords: ["pet", "petshop", "pet shop", "veterinário", "veterinario", "animal", "cachorro", "gato", "banho e tosa"], src: sitePetshop },
  { keywords: ["farmácia", "farmacia", "drogaria", "medicamento", "saúde", "saude"], src: siteFarmacia },
  { keywords: ["oficina", "mecânica", "mecanica", "auto", "carro", "moto", "funilaria", "elétrica", "eletrica", "autopeças", "autopecas"], src: siteOficina },
  { keywords: ["igreja", "religião", "religiao", "ministério", "ministerio", "pastoral", "evangélica", "evangelica", "católica", "catolica", "templo"], src: siteIgreja },
  { keywords: ["fotografia", "fotógrafo", "fotografo", "estúdio", "estudio", "foto", "ensaio", "casamento", "eventos"], src: siteFotografia },
  { keywords: ["construção", "construcao", "engenharia", "arquitetura", "arquiteto", "reforma", "obra", "pedreiro", "empreiteira"], src: siteConstrucao },
  { keywords: ["música", "musica", "escola de música", "instrumento", "banda", "estúdio musical", "aula de música", "violão", "piano", "guitarra"], src: siteMusica },
];

const sistemaImages: ImageMap = [
  { keywords: ["financeiro", "financeira", "caixa", "vendas", "controle", "contabilidade", "fluxo de caixa"], src: sistemaFinanceiro },
  { keywords: ["crm", "cliente", "gestão de clientes", "erp", "contratos", "funil"], src: sistemaCrm },
  { keywords: ["gestão", "gestao", "supermercado", "loja", "roupas", "sapataria", "funcionários", "ordens", "rh", "recursos humanos"], src: sistemaGestao },
  { keywords: ["estoque", "inventário", "inventario", "armazém", "armazem", "produto", "mercadoria", "depósito", "deposito"], src: sistemaEstoque },
  { keywords: ["pdv", "ponto de venda", "caixa registradora", "terminal", "balcão", "balcao", "comanda", "frente de caixa"], src: sistemaPdv },
];

const appImages: ImageMap = [
  { keywords: ["delivery", "entrega", "compras", "ifood", "rappi"], src: appDelivery },
  { keywords: ["loja", "e-commerce", "ecommerce", "virtual", "marketplace"], src: appLoja },
  { keywords: ["agendamento", "salão", "salao", "barbearia", "clínica", "clinica", "beleza", "cabeleireiro", "consulta", "reserva"], src: appAgendamento },
  { keywords: ["restaurante", "food", "comida", "hamburgueria", "pizzaria", "cardápio", "cardapio", "supermercado", "farmácia", "farmacia"], src: appFood },
  { keywords: ["fitness", "academia", "treino", "exercício", "exercicio", "saúde", "saude", "corrida", "gym", "workout"], src: appFitness },
  { keywords: ["pet", "petshop", "veterinário", "veterinario", "animal", "cachorro", "gato", "banho"], src: appPetshop },
];

const iaImages: ImageMap = [
  { keywords: ["chatbot", "chat", "whatsapp", "atendimento", "suporte", "assistente", "bot"], src: iaChatbot },
  { keywords: ["análise", "analise", "analytics", "dashboard", "relatório", "relatorio", "dados", "monitoramento", "indicadores", "financeiro", "estoque", "recomendação", "recomendacao"], src: iaAnalytics },
  { keywords: ["automação", "automacao", "workflow", "fluxo", "integração", "integracao", "pipeline", "processo", "n8n", "zapier"], src: iaAutomacao },
];

const landingImages: ImageMap = [
  { keywords: ["curso", "educação", "educacao", "aula", "mentoria", "treinamento"], src: landingCurso },
  { keywords: ["consultoria", "serviço", "servico", "advogado", "dentista", "energia", "freelancer", "profissional"], src: landingServicos },
  { keywords: ["produto", "digital", "ebook", "infoproduto", "lançamento", "lancamento"], src: landingProduto },
  { keywords: ["saas", "software", "aplicativo", "plataforma", "startup", "tech", "tecnologia", "sistema"], src: landingSaas },
];

const lojaImages: ImageMap = [
  { keywords: ["roupas", "moda", "feminina", "masculina", "infantil", "calçados", "calcados", "joias", "relógios", "relogios", "esportes", "brinquedos", "acessórios", "acessorios"], src: lojaRoupas },
  { keywords: ["eletrônicos", "eletronicos", "celulares", "ferramentas", "autopeças", "autopecas", "móveis", "moveis", "informática", "informatica", "computador"], src: lojaEletronicos },
  { keywords: ["alimentos", "comida", "orgânico", "organico", "natural", "suplemento", "bebidas", "doces", "saudável", "saudavel", "mercearia"], src: lojaAlimentos },
  { keywords: ["cosméticos", "cosmeticos", "beleza", "perfume", "maquiagem", "skincare", "cuidados", "cabelo", "unha"], src: lojaCosmeticos },
];

const categoryDefaultImages: Record<string, string> = {
  site: siteSupermercado,
  sistema: sistemaGestao,
  aplicativo: appDelivery,
  ia: iaChatbot,
  landing: landingCurso,
  loja: lojaRoupas,
};

const categoryImageMaps: Record<string, ImageMap> = {
  site: siteImages,
  sistema: sistemaImages,
  aplicativo: appImages,
  ia: iaImages,
  landing: landingImages,
  loja: lojaImages,
};

export function getPreviewImage(category: string, name: string, segment?: string): string {
  const imageMap = categoryImageMaps[category];
  if (!imageMap) return categoryDefaultImages[category] || siteSupermercado;

  const searchText = `${name} ${segment || ""}`.toLowerCase();

  for (const entry of imageMap) {
    for (const keyword of entry.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return entry.src;
      }
    }
  }

  return categoryDefaultImages[category] || siteSupermercado;
}
