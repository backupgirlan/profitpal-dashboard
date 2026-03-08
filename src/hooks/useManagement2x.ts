import { useState, useEffect, useCallback } from 'react';

export type ManagementModel = '2x0' | '2x1';

export interface CycleTradeEntry {
  id: string;
  pair: string;
  payout: number;
  amount: number;
  result: 'win' | 'loss';
  profit: number;
  observation: string;
  timestamp: number;
}

export interface CycleHistory {
  model: ManagementModel;
  banca: number;
  trades: CycleTradeEntry[];
  wins: number;
  losses: number;
  status: 'won' | 'lost';
  lucroTotal: number;
  timestamp: number;
}

export interface Management2xState {
  model: ManagementModel | null;
  ativo: boolean;
  banca: number;
  percentual: number;
  entradaRecomendada: number;
  entradaCustom: number | null;
  // Current cycle
  cicloWins: number;
  cicloLosses: number;
  cicloTrades: CycleTradeEntry[];
  cicloStatus: 'active' | 'won' | 'lost';
  cicloLucro: number;
  // History
  historicoCiclos: CycleHistory[];
}

const STORAGE_KEY = 'management_2x_state';

const defaultState: Management2xState = {
  model: null,
  ativo: false,
  banca: 0,
  percentual: 5,
  entradaRecomendada: 0,
  entradaCustom: null,
  cicloWins: 0,
  cicloLosses: 0,
  cicloTrades: [],
  cicloStatus: 'active',
  cicloLucro: 0,
  historicoCiclos: [],
};

export function useManagement2x() {
  const [state, setState] = useState<Management2xState>(() => {
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
    model: ManagementModel;
    banca: number;
    percentual: number;
  }) => {
    const entrada = +(params.banca * (params.percentual / 100)).toFixed(2);
    setState(prev => ({
      ...prev,
      model: params.model,
      ativo: true,
      banca: params.banca,
      percentual: params.percentual,
      entradaRecomendada: entrada,
      entradaCustom: null,
      cicloWins: 0,
      cicloLosses: 0,
      cicloTrades: [],
      cicloStatus: 'active',
      cicloLucro: 0,
    }));
  }, []);

  const getEntradaAtual = useCallback(() => {
    return state.entradaCustom ?? state.entradaRecomendada;
  }, [state.entradaCustom, state.entradaRecomendada]);

  const setEntradaCustom = useCallback((val: number | null) => {
    setState(prev => ({ ...prev, entradaCustom: val }));
  }, []);

  const setPercentual = useCallback((val: number) => {
    setState(prev => ({
      ...prev,
      percentual: val,
      entradaRecomendada: +(prev.banca * (val / 100)).toFixed(2),
    }));
  }, []);

  const registrarOperacao = useCallback((trade: {
    pair: string;
    payout: number;
    amount: number;
    result: 'win' | 'loss';
    observation: string;
  }): CycleTradeEntry | null => {
    let entry: CycleTradeEntry | null = null;
    setState(prev => {
      if (!prev.ativo || prev.cicloStatus !== 'active') return prev;

      const profit = trade.result === 'win'
        ? +(trade.amount * (trade.payout / 100)).toFixed(2)
        : -trade.amount;

      entry = {
        id: crypto.randomUUID(),
        pair: trade.pair,
        payout: trade.payout,
        amount: trade.amount,
        result: trade.result,
        profit,
        observation: trade.observation,
        timestamp: Date.now(),
      };

      const newWins = prev.cicloWins + (trade.result === 'win' ? 1 : 0);
      const newLosses = prev.cicloLosses + (trade.result === 'loss' ? 1 : 0);
      const newTrades = [...prev.cicloTrades, entry];
      const newLucro = +(prev.cicloLucro + profit).toFixed(2);
      const newBanca = +(prev.banca + profit).toFixed(2);

      let status: Management2xState['cicloStatus'] = 'active';

      if (prev.model === '2x0') {
        if (newWins >= 2) status = 'won';
        else if (newLosses >= 1) status = 'lost';
      } else if (prev.model === '2x1') {
        if (newWins >= 2) status = 'won';
        else if (newLosses >= 2) status = 'lost';
      }

      const newState: Management2xState = {
        ...prev,
        cicloWins: newWins,
        cicloLosses: newLosses,
        cicloTrades: newTrades,
        cicloStatus: status,
        cicloLucro: newLucro,
        banca: newBanca,
        entradaRecomendada: +(newBanca * (prev.percentual / 100)).toFixed(2),
      };

      // If cycle ended, add to history
      if (status !== 'active') {
        newState.historicoCiclos = [{
          model: prev.model!,
          banca: prev.banca,
          trades: newTrades,
          wins: newWins,
          losses: newLosses,
          status,
          lucroTotal: newLucro,
          timestamp: Date.now(),
        }, ...prev.historicoCiclos].slice(0, 100);
      }

      return newState;
    });
    return entry;
  }, []);

  const novoCiclo = useCallback(() => {
    setState(prev => ({
      ...prev,
      cicloWins: 0,
      cicloLosses: 0,
      cicloTrades: [],
      cicloStatus: 'active',
      cicloLucro: 0,
      entradaCustom: null,
      entradaRecomendada: +(prev.banca * (prev.percentual / 100)).toFixed(2),
    }));
  }, []);

  const sair = useCallback(() => {
    setState(prev => {
      // Save current cycle to history if active
      const hist = prev.cicloTrades.length > 0 ? [{
        model: prev.model!,
        banca: prev.banca,
        trades: prev.cicloTrades,
        wins: prev.cicloWins,
        losses: prev.cicloLosses,
        status: prev.cicloStatus === 'active' ? 'lost' as const : prev.cicloStatus,
        lucroTotal: prev.cicloLucro,
        timestamp: Date.now(),
      }, ...prev.historicoCiclos].slice(0, 100) : prev.historicoCiclos;
      
      return {
        ...defaultState,
        historicoCiclos: hist,
      };
    });
  }, []);

  const trocar = useCallback(() => {
    sair();
  }, [sair]);

  const updateBanca = useCallback((newBanca: number) => {
    setState(prev => ({
      ...prev,
      banca: newBanca,
      entradaRecomendada: +(newBanca * (prev.percentual / 100)).toFixed(2),
    }));
  }, []);

  return {
    state,
    iniciar,
    getEntradaAtual,
    setEntradaCustom,
    setPercentual,
    registrarOperacao,
    novoCiclo,
    sair,
    trocar,
    updateBanca,
  };
}
