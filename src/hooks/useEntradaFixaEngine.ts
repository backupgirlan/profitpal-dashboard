import { useState, useEffect, useCallback } from 'react';

export interface EntradaFixaEntry {
  numero: number;
  entrada: number;
  resultado: 'win' | 'loss';
  lucro: number;
  prejuizo: number;
  bancaAtual: number;
  timestamp: number;
}

export interface EntradaFixaState {
  bancaInicial: number;
  bancaAtual: number;
  entradaFixa: number;
  maxEntradas: number;
  entradasRealizadas: number;
  winsTotal: number;
  lossesTotal: number;
  perdaSequencial: number;
  lucroSessao: number;
  encerrado: boolean;
  mensagem: string;
  historico: EntradaFixaEntry[];
  ativo: boolean;
  payout: number; // decimal e.g. 0.80
}

const STORAGE_KEY = 'entrada_fixa_engine_state';

const defaultState: EntradaFixaState = {
  bancaInicial: 0,
  bancaAtual: 0,
  entradaFixa: 0,
  maxEntradas: 2,
  entradasRealizadas: 0,
  winsTotal: 0,
  lossesTotal: 0,
  perdaSequencial: 0,
  lucroSessao: 0,
  encerrado: false,
  mensagem: '',
  historico: [],
  ativo: false,
  payout: 0.80,
};

export function useEntradaFixaEngine() {
  const [state, setState] = useState<EntradaFixaState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const iniciar = useCallback((params: {
    banca: number;
    entradaFixa: number;
    maxEntradas: number;
    payout: number;
  }) => {
    if (params.banca <= 0 || params.entradaFixa <= 0) {
      setState(prev => ({ ...prev, mensagem: '🚫 Valores inválidos.' }));
      return;
    }
    if (params.entradaFixa > params.banca) {
      setState(prev => ({ ...prev, mensagem: '🚫 Entrada maior que a banca.' }));
      return;
    }

    setState({
      ...defaultState,
      bancaInicial: params.banca,
      bancaAtual: params.banca,
      entradaFixa: params.entradaFixa,
      maxEntradas: params.maxEntradas,
      payout: params.payout / 100,
      ativo: true,
      mensagem: `Gerenciamento Entrada Fixa iniciado. Entrada: R$ ${params.entradaFixa.toFixed(2)}`,
    });
  }, []);

  const registrarResultado = useCallback((resultado: 'win' | 'loss', payoutOverride?: number) => {
    setState(prev => {
      if (!prev.ativo || prev.encerrado) return prev;

      const payoutUsado = payoutOverride !== undefined ? payoutOverride : prev.payout;
      let s = { ...prev };
      const entrada = s.entradaFixa;

      let lucro = 0;
      let prejuizo = 0;

      if (resultado === 'win') {
        lucro = +(entrada * payoutUsado).toFixed(2);
        s.bancaAtual = +(s.bancaAtual + lucro).toFixed(2);
        s.lucroSessao = +(s.lucroSessao + lucro).toFixed(2);
        s.winsTotal++;
        s.perdaSequencial = 0;
        s.mensagem = `✅ Win! Lucro: R$ ${lucro.toFixed(2)}`;
      } else {
        prejuizo = entrada;
        s.bancaAtual = +(s.bancaAtual - entrada).toFixed(2);
        s.lucroSessao = +(s.lucroSessao - entrada).toFixed(2);
        s.lossesTotal++;
        s.perdaSequencial++;
        s.mensagem = `❌ Loss. Perda: R$ ${entrada.toFixed(2)}`;
      }

      s.entradasRealizadas++;

      // Record history
      const entry: EntradaFixaEntry = {
        numero: s.entradasRealizadas,
        entrada,
        resultado,
        lucro,
        prejuizo,
        bancaAtual: s.bancaAtual,
        timestamp: Date.now(),
      };
      s.historico = [entry, ...s.historico].slice(0, 50);

      // Rule: 2 consecutive losses = stop
      if (s.perdaSequencial >= 2) {
        s.encerrado = true;
        s.mensagem = '🚫 2 losses seguidos! Dia encerrado. Saia do gráfico.';
      }

      // Max entries reached
      if (s.entradasRealizadas >= s.maxEntradas && !s.encerrado) {
        s.encerrado = true;
        s.mensagem = `⏹️ Limite de ${s.maxEntradas} entradas atingido.`;
      }

      // Banca insufficient
      if (s.bancaAtual < s.entradaFixa && !s.encerrado) {
        s.encerrado = true;
        s.mensagem = '🚫 Banca insuficiente para próxima entrada.';
      }

      return s;
    });
  }, []);

  const resetar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return { state, iniciar, registrarResultado, resetar };
}
