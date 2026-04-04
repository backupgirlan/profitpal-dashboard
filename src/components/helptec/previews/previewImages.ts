// Real preview images mapped by category and segment keywords
import siteSupermercado from "@/assets/previews/site-supermercado.jpg";
import siteBeleza from "@/assets/previews/site-beleza.jpg";
import siteRestaurante from "@/assets/previews/site-restaurante.jpg";
import siteImobiliaria from "@/assets/previews/site-imobiliaria.jpg";
import siteClinica from "@/assets/previews/site-clinica.jpg";
import siteEscritorio from "@/assets/previews/site-escritorio.jpg";
import siteAcademia from "@/assets/previews/site-academia.jpg";

import sistemaGestao from "@/assets/previews/sistema-gestao.jpg";
import sistemaFinanceiro from "@/assets/previews/sistema-financeiro.jpg";
import sistemaCrm from "@/assets/previews/sistema-crm.jpg";

import appDelivery from "@/assets/previews/app-delivery.jpg";
import appLoja from "@/assets/previews/app-loja.jpg";
import appAgendamento from "@/assets/previews/app-agendamento.jpg";

import iaChatbot from "@/assets/previews/ia-chatbot.jpg";
import iaAnalytics from "@/assets/previews/ia-analytics.jpg";

import landingCurso from "@/assets/previews/landing-curso.jpg";
import landingServicos from "@/assets/previews/landing-servicos.jpg";

import lojaRoupas from "@/assets/previews/loja-roupas.jpg";
import lojaEletronicos from "@/assets/previews/loja-eletronicos.jpg";

type ImageMap = { keywords: string[]; src: string }[];

const siteImages: ImageMap = [
  { keywords: ["supermercado", "mercado", "agropecuária", "agropecuario"], src: siteSupermercado },
  { keywords: ["beleza", "salão", "salao", "barbearia", "cabeleireiro", "estética", "estetica"], src: siteBeleza },
  { keywords: ["restaurante", "hamburgueria", "pizzaria", "gastronomia", "lanchonete"], src: siteRestaurante },
  { keywords: ["imobiliária", "imobiliaria", "imobiliário", "construtora", "hotel"], src: siteImobiliaria },
  { keywords: ["clínica", "clinica", "dentista", "saúde", "saude", "médico", "medico", "hospital"], src: siteClinica },
  { keywords: ["advocacia", "contabilidade", "escritório", "escritorio", "consultoria"], src: siteEscritorio },
  { keywords: ["academia", "fitness", "esporte", "gym"], src: siteAcademia },
];

const sistemaImages: ImageMap = [
  { keywords: ["financeiro", "financeira", "caixa", "vendas", "controle"], src: sistemaFinanceiro },
  { keywords: ["crm", "cliente", "gestão de clientes", "erp", "contratos"], src: sistemaCrm },
  { keywords: ["gestão", "gestao", "estoque", "supermercado", "loja", "roupas", "sapataria", "funcionários", "ordens"], src: sistemaGestao },
];

const appImages: ImageMap = [
  { keywords: ["delivery", "restaurante", "supermercado", "farmácia", "farmacia", "compras"], src: appDelivery },
  { keywords: ["loja", "e-commerce", "ecommerce", "virtual"], src: appLoja },
  { keywords: ["agendamento", "salão", "salao", "barbearia", "clínica", "clinica", "academia", "beleza", "cabeleireiro"], src: appAgendamento },
];

const iaImages: ImageMap = [
  { keywords: ["chatbot", "chat", "whatsapp", "atendimento", "suporte", "assistente"], src: iaChatbot },
  { keywords: ["análise", "analise", "analytics", "dashboard", "relatório", "relatorio", "dados", "monitoramento", "indicadores", "financeiro", "estoque", "recomendação", "recomendacao"], src: iaAnalytics },
];

const landingImages: ImageMap = [
  { keywords: ["curso", "educação", "educacao", "produto digital", "software", "aplicativo"], src: landingCurso },
  { keywords: ["consultoria", "serviço", "servico", "advogado", "dentista", "energia"], src: landingServicos },
];

const lojaImages: ImageMap = [
  { keywords: ["roupas", "moda", "feminina", "masculina", "infantil", "calçados", "calcados", "joias", "relógios", "relogios", "esportes", "brinquedos"], src: lojaRoupas },
  { keywords: ["eletrônicos", "eletronicos", "celulares", "ferramentas", "autopeças", "autopecas", "móveis", "moveis"], src: lojaEletronicos },
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
