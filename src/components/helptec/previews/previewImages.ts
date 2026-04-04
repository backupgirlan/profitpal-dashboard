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
import siteHotel from "@/assets/previews/site-hotel.jpg";
import siteAutomoveis from "@/assets/previews/site-automoveis.jpg";
import siteLimpeza from "@/assets/previews/site-limpeza.jpg";
import siteTattoo from "@/assets/previews/site-tattoo.jpg";
import siteCreche from "@/assets/previews/site-creche.jpg";
import siteFloricultura from "@/assets/previews/site-floricultura.jpg";
import siteEventos from "@/assets/previews/site-eventos.jpg";
import siteLogistica from "@/assets/previews/site-logistica.jpg";
import siteDentista from "@/assets/previews/site-dentista.jpg";

import sistemaGestao from "@/assets/previews/sistema-gestao.jpg";
import sistemaFinanceiro from "@/assets/previews/sistema-financeiro.jpg";
import sistemaCrm from "@/assets/previews/sistema-crm.jpg";
import sistemaEstoque from "@/assets/previews/sistema-estoque.jpg";
import sistemaPdv from "@/assets/previews/sistema-pdv.jpg";
import sistemaRh from "@/assets/previews/sistema-rh.jpg";
import sistemaAgendamento from "@/assets/previews/sistema-agendamento.jpg";

import appDelivery from "@/assets/previews/app-delivery.jpg";
import appLoja from "@/assets/previews/app-loja.jpg";
import appAgendamento from "@/assets/previews/app-agendamento.jpg";
import appFood from "@/assets/previews/app-food.jpg";
import appFitness from "@/assets/previews/app-fitness.jpg";
import appPetshop from "@/assets/previews/app-petshop.jpg";
import appImoveis from "@/assets/previews/app-imoveis.jpg";
import appFinanceiro from "@/assets/previews/app-financeiro.jpg";
import appEventos from "@/assets/previews/app-eventos.jpg";
import appFidelidade from "@/assets/previews/app-fidelidade.jpg";
import appGestao from "@/assets/previews/app-gestao.jpg";
import appRastreamento from "@/assets/previews/app-rastreamento.jpg";
import appTurismo from "@/assets/previews/app-turismo.jpg";
import appEscola from "@/assets/previews/app-escola.jpg";
import appSupermercado from "@/assets/previews/app-supermercado.jpg";

import iaChatbot from "@/assets/previews/ia-chatbot.jpg";
import iaAnalytics from "@/assets/previews/ia-analytics.jpg";
import iaAutomacao from "@/assets/previews/ia-automacao.jpg";
import iaRecomendacao from "@/assets/previews/ia-recomendacao.jpg";
import iaVendas from "@/assets/previews/ia-vendas.jpg";
import iaSuporte from "@/assets/previews/ia-suporte.jpg";
import iaFinanceiro from "@/assets/previews/ia-financeiro.jpg";
import iaEstoque from "@/assets/previews/ia-estoque.jpg";
import iaCrm from "@/assets/previews/ia-crm.jpg";
import iaWhatsapp from "@/assets/previews/ia-whatsapp.jpg";
import iaAgendamento from "@/assets/previews/ia-agendamento.jpg";
import iaEcommerce from "@/assets/previews/ia-ecommerce.jpg";
import iaRestaurante from "@/assets/previews/ia-restaurante.jpg";
import iaRelatorios from "@/assets/previews/ia-relatorios.jpg";
import iaOrcamento from "@/assets/previews/ia-orcamento.jpg";

import landingCurso from "@/assets/previews/landing-curso.jpg";
import landingServicos from "@/assets/previews/landing-servicos.jpg";
import landingProduto from "@/assets/previews/landing-produto.jpg";
import landingSaas from "@/assets/previews/landing-saas.jpg";
import landingImovel from "@/assets/previews/landing-imovel.jpg";
import landingFitness from "@/assets/previews/landing-fitness.jpg";

import lojaRoupas from "@/assets/previews/loja-roupas.jpg";
import lojaEletronicos from "@/assets/previews/loja-eletronicos.jpg";
import lojaAlimentos from "@/assets/previews/loja-alimentos.jpg";
import lojaCosmeticos from "@/assets/previews/loja-cosmeticos.jpg";
import lojaEsportes from "@/assets/previews/loja-esportes.jpg";
import lojaMoveis from "@/assets/previews/loja-moveis.jpg";

type ImageMap = { keywords: string[]; src: string }[];

const siteImages: ImageMap = [
  { keywords: ["supermercado", "mercado", "agropecuária", "agropecuario", "açougue", "acougue"], src: siteSupermercado },
  { keywords: ["beleza", "salão", "salao", "barbearia", "cabeleireiro", "estética", "estetica", "manicure", "spa"], src: siteBeleza },
  { keywords: ["restaurante", "hamburgueria", "pizzaria", "gastronomia", "lanchonete", "padaria", "confeitaria", "cafeteria", "bar", "sushi"], src: siteRestaurante },
  { keywords: ["imobiliária", "imobiliaria", "imobiliário", "construtora", "aluguel", "corretor"], src: siteImobiliaria },
  { keywords: ["clínica", "clinica", "saúde", "saude", "médico", "medico", "hospital", "psicólogo", "psicologo", "nutricionista", "fisioterapia", "terapia"], src: siteClinica },
  { keywords: ["dentista", "odontologia", "ortodontia", "odonto", "sorriso", "implante"], src: siteDentista },
  { keywords: ["advocacia", "contabilidade", "escritório", "escritorio", "consultoria", "advogado", "contador", "jurídico", "juridico"], src: siteEscritorio },
  { keywords: ["academia", "fitness", "esporte", "gym", "crossfit", "pilates", "yoga", "funcional"], src: siteAcademia },
  { keywords: ["turismo", "viagem", "agência de viagem", "agencia de viagem", "excursão", "excursao", "pacote", "cruzeiro"], src: siteTurismo },
  { keywords: ["hotel", "pousada", "resort", "hospedagem", "hostel", "airbnb", "chalé", "chale"], src: siteHotel },
  { keywords: ["energia solar", "solar", "fotovoltaica", "sustentável", "sustentavel", "energia limpa", "painéis", "paineis"], src: siteEnergiaSolar },
  { keywords: ["escola", "educação", "educacao", "colégio", "colegio", "faculdade", "universidade", "ensino", "cursinho"], src: siteEscola },
  { keywords: ["creche", "infantil", "berçário", "bercario", "maternal", "pré-escola", "pre-escola", "jardim"], src: siteCreche },
  { keywords: ["pet", "petshop", "pet shop", "veterinário", "veterinario", "animal", "cachorro", "gato", "banho e tosa"], src: sitePetshop },
  { keywords: ["farmácia", "farmacia", "drogaria", "medicamento"], src: siteFarmacia },
  { keywords: ["oficina", "mecânica", "mecanica", "auto center", "funilaria", "elétrica automotiva", "eletrica automotiva", "autopeças", "autopecas"], src: siteOficina },
  { keywords: ["automóvel", "automovel", "concessionária", "concessionaria", "carro", "veículo", "veiculo", "moto", "revenda", "seminovo"], src: siteAutomoveis },
  { keywords: ["igreja", "religião", "religiao", "ministério", "ministerio", "pastoral", "evangélica", "evangelica", "católica", "catolica", "templo"], src: siteIgreja },
  { keywords: ["fotografia", "fotógrafo", "fotografo", "estúdio foto", "estudio foto", "ensaio", "casamento foto"], src: siteFotografia },
  { keywords: ["construção", "construcao", "engenharia", "arquitetura", "arquiteto", "reforma", "obra", "pedreiro", "empreiteira"], src: siteConstrucao },
  { keywords: ["música", "musica", "escola de música", "instrumento", "banda", "estúdio musical", "violão", "piano", "guitarra", "DJ"], src: siteMusica },
  { keywords: ["limpeza", "higienização", "higienizacao", "lavanderia", "dedetização", "dedetizacao", "jardinagem", "manutenção", "manutencao", "zelador"], src: siteLimpeza },
  { keywords: ["tattoo", "tatuagem", "piercing", "body art", "estúdio tattoo", "estudio tattoo"], src: siteTattoo },
  { keywords: ["floricultura", "flores", "florista", "paisagismo", "buquê", "buque", "arranjo floral", "decoração floral"], src: siteFloricultura },
  { keywords: ["evento", "festa", "buffet", "casamento", "decoração", "decoracao", "cerimonial", "som", "iluminação", "iluminacao"], src: siteEventos },
  { keywords: ["logística", "logistica", "transporte", "frete", "mudança", "mudanca", "caminhão", "caminhao", "entrega", "distribuidora", "transportadora"], src: siteLogistica },
];

const sistemaImages: ImageMap = [
  { keywords: ["financeiro", "financeira", "caixa", "contabilidade", "fluxo de caixa", "faturamento", "boleto", "nota fiscal"], src: sistemaFinanceiro },
  { keywords: ["crm", "cliente", "gestão de clientes", "erp", "contratos", "funil", "lead", "pipeline"], src: sistemaCrm },
  { keywords: ["gestão", "gestao", "administrativo", "loja", "roupas", "sapataria", "funcionários", "ordens"], src: sistemaGestao },
  { keywords: ["estoque", "inventário", "inventario", "armazém", "armazem", "produto", "mercadoria", "depósito", "deposito", "almoxarifado"], src: sistemaEstoque },
  { keywords: ["pdv", "ponto de venda", "caixa registradora", "terminal", "balcão", "balcao", "comanda", "frente de caixa", "vendas"], src: sistemaPdv },
  { keywords: ["rh", "recursos humanos", "funcionário", "funcionario", "folha de pagamento", "ponto", "férias", "ferias", "admissão", "admissao", "colaborador"], src: sistemaRh },
  { keywords: ["agendamento", "agenda", "calendário", "calendario", "reserva", "horário", "horario", "consulta", "marcação", "marcacao", "sessão", "sessao"], src: sistemaAgendamento },
];

const appImages: ImageMap = [
  { keywords: ["delivery", "entrega"], src: appDelivery },
  { keywords: ["loja", "e-commerce", "ecommerce", "virtual", "marketplace", "shopping"], src: appLoja },
  { keywords: ["agendamento", "salão", "salao", "barbearia", "beleza", "cabeleireiro"], src: appAgendamento },
  { keywords: ["restaurante", "food", "comida", "hamburgueria", "pizzaria", "cardápio", "cardapio"], src: appFood },
  { keywords: ["fitness", "academia", "treino", "exercício", "exercicio", "corrida", "gym", "workout"], src: appFitness },
  { keywords: ["pet", "petshop", "veterinário", "veterinario", "animal", "cachorro", "gato", "banho"], src: appPetshop },
  { keywords: ["imóvel", "imovel", "imobiliária", "imobiliaria", "casa", "apartamento", "terreno", "corretor"], src: appImoveis },
  { keywords: ["financeiro", "finança", "financa", "banco", "fintech", "pagamento", "investimento", "carteira", "pix", "cartão", "cartao"], src: appFinanceiro },
  { keywords: ["evento", "festa", "ingresso", "ticket", "show", "concert"], src: appEventos },
  { keywords: ["fidelidade", "loyalty", "pontos", "recompensa", "cashback", "cupom", "desconto"], src: appFidelidade },
  { keywords: ["gestão", "gestao", "cliente", "crm", "gerenciamento", "controle"], src: appGestao },
  { keywords: ["rastreamento", "rastreio", "tracking", "logística", "logistica", "localização", "localizacao", "encomenda"], src: appRastreamento },
  { keywords: ["turismo", "viagem", "travel", "passeio", "excursão", "excursao", "hotel", "voo"], src: appTurismo },
  { keywords: ["escola", "educação", "educacao", "aluno", "estudante", "aula", "nota", "professor"], src: appEscola },
  { keywords: ["supermercado", "mercado", "compras", "farmácia", "farmacia", "mercearia", "varejo"], src: appSupermercado },
  { keywords: ["clínica", "clinica", "saúde", "saude", "médico", "medico", "consulta"], src: appAgendamento },
];

const iaImages: ImageMap = [
  { keywords: ["whatsapp", "zap", "mensagem automática"], src: iaWhatsapp },
  { keywords: ["chatbot", "chat", "bot", "assistente virtual"], src: iaChatbot },
  { keywords: ["atendimento", "suporte", "técnico", "tecnico", "help desk", "ticket"], src: iaSuporte },
  { keywords: ["vendas", "venda", "comercial", "proposta", "lead", "conversão", "conversao"], src: iaVendas },
  { keywords: ["crm", "cliente", "gestão de clientes", "relacionamento", "segmentação", "segmentacao"], src: iaCrm },
  { keywords: ["financeiro", "financeira", "contábil", "contabil", "caixa", "cobrança", "cobranca"], src: iaFinanceiro },
  { keywords: ["estoque", "inventário", "inventario", "armazém", "armazem", "logística", "logistica", "supply"], src: iaEstoque },
  { keywords: ["e-commerce", "ecommerce", "loja virtual", "produto", "carrinho", "checkout"], src: iaEcommerce },
  { keywords: ["restaurante", "gastronomia", "cardápio", "cardapio", "cozinha", "mesa", "supermercado"], src: iaRestaurante },
  { keywords: ["agendamento", "salão", "salao", "beleza", "agenda", "clínica", "clinica", "estética", "estetica"], src: iaAgendamento },
  { keywords: ["relatório", "relatorio", "geração", "geracao", "report", "documento"], src: iaRelatorios },
  { keywords: ["orçamento", "orcamento", "precificação", "precificacao", "cotação", "cotacao", "proposta", "custo"], src: iaOrcamento },
  { keywords: ["recomendação", "recomendacao", "personalização", "personalizacao", "machine learning"], src: iaRecomendacao },
  { keywords: ["análise", "analise", "analytics", "dashboard", "dados", "monitoramento", "indicadores", "kpi"], src: iaAnalytics },
  { keywords: ["automação", "automacao", "workflow", "fluxo", "integração", "integracao", "pipeline", "processo", "n8n", "zapier", "make"], src: iaAutomacao },
];

const landingImages: ImageMap = [
  { keywords: ["curso", "aula", "mentoria", "treinamento", "workshop", "educação", "educacao"], src: landingCurso },
  { keywords: ["consultoria", "serviço", "servico", "advogado", "dentista", "energia", "freelancer", "profissional", "agência", "agencia"], src: landingServicos },
  { keywords: ["produto", "digital", "ebook", "infoproduto", "lançamento", "lancamento", "oferta"], src: landingProduto },
  { keywords: ["saas", "software", "plataforma", "startup", "tech", "tecnologia", "sistema", "app"], src: landingSaas },
  { keywords: ["imóvel", "imovel", "apartamento", "condomínio", "condominio", "casa", "empreendimento", "construtora"], src: landingImovel },
  { keywords: ["fitness", "academia", "personal", "treino", "emagrecimento", "dieta", "nutrição", "nutricao", "saúde", "saude"], src: landingFitness },
];

const lojaImages: ImageMap = [
  { keywords: ["roupas", "moda", "feminina", "masculina", "infantil", "calçados", "calcados", "joias", "relógios", "relogios", "brinquedos", "acessórios", "acessorios", "bolsas"], src: lojaRoupas },
  { keywords: ["eletrônicos", "eletronicos", "celulares", "ferramentas", "autopeças", "autopecas", "informática", "informatica", "computador", "notebook", "tablet", "games"], src: lojaEletronicos },
  { keywords: ["alimentos", "comida", "orgânico", "organico", "natural", "suplemento", "bebidas", "doces", "saudável", "saudavel", "mercearia", "cesta"], src: lojaAlimentos },
  { keywords: ["cosméticos", "cosmeticos", "beleza", "perfume", "maquiagem", "skincare", "cuidados", "cabelo", "unha", "hidratante"], src: lojaCosmeticos },
  { keywords: ["esportes", "esportivo", "tênis", "tenis", "bike", "bicicleta", "camping", "pesca", "surf", "skate"], src: lojaEsportes },
  { keywords: ["móveis", "moveis", "decoração", "decoracao", "casa", "cozinha", "quarto", "sala", "colchão", "colchao", "sofá", "sofa", "mesa", "cadeira"], src: lojaMoveis },
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
