import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, FileText, Filter } from 'lucide-react';

interface Trade {
  id: string;
  pair_name: string;
  payout: number;
  amount: number | null;
  profit: number | null;
  result: string;
  management_mode: string | null;
  entry_type: string | null;
  created_at: string | null;
  trade_date: string | null;
}

const TradeReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [filterResult, setFilterResult] = useState('all');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTrades(data as Trade[]);
        setLoading(false);
      });
  }, [user]);

  // Apply filters
  const filtered = trades.filter(t => {
    if (filterDate && t.trade_date && !t.trade_date.startsWith(filterDate)) return false;
    if (filterMode !== 'all' && t.management_mode !== filterMode) return false;
    if (filterResult !== 'all' && t.result !== filterResult) return false;
    return true;
  });

  const totalWins = filtered.filter(t => t.result === 'win').length;
  const totalLosses = filtered.filter(t => t.result === 'loss').length;
  const totalProfit = filtered.reduce((acc, t) => acc + (Number(t.profit) || 0), 0);
  const winProfit = filtered.filter(t => t.result === 'win').reduce((acc, t) => acc + (Number(t.profit) || 0), 0);
  const lossTotal = filtered.filter(t => t.result === 'loss').reduce((acc, t) => acc + Math.abs(Number(t.profit) || 0), 0);
  const winRate = filtered.length > 0 ? ((totalWins / filtered.length) * 100).toFixed(1) : '0.0';

  // Count cycles
  const cycleWins = trades.filter(t => t.management_mode === '2x0' || t.management_mode === '2x1').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
          <FileText className="w-5 h-5" /> {t('report.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('report.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{t('report.totalTrades')}</p>
            <p className="text-xl font-display font-bold text-foreground">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Win / Loss</p>
            <p className="text-xl font-display font-bold">
              <span className="win-text">{totalWins}</span>
              <span className="text-muted-foreground"> / </span>
              <span className="loss-text">{totalLosses}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
            <p className="text-xl font-display font-bold text-primary">{winRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{t('report.totalProfit')}</p>
            <p className={`text-xl font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {totalProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Lucro Acumulado</p>
            <p className="text-sm font-display font-bold win-text">R$ {winProfit.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Prejuízo Acumulado</p>
            <p className="text-sm font-display font-bold loss-text">R$ {lossTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Resultado Líquido</p>
            <p className={`text-sm font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {totalProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" /> Filtros
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Data</p>
              <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-secondary text-xs" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gerenciamento</p>
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger className="bg-secondary text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2x0">2x0</SelectItem>
                  <SelectItem value="2x1">2x1</SelectItem>
                  <SelectItem value="quick">Rápido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Resultado</p>
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="bg-secondary text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(filterDate || filterMode !== 'all' || filterResult !== 'all') && (
            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { setFilterDate(''); setFilterMode('all'); setFilterResult('all'); }}>
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Trade Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('report.noTrades')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('report.date')}</TableHead>
                    <TableHead className="text-xs">Hora</TableHead>
                    <TableHead className="text-xs">{t('home.pair')}</TableHead>
                    <TableHead className="text-xs">Payout</TableHead>
                    <TableHead className="text-xs">{t('report.amount')}</TableHead>
                    <TableHead className="text-xs">{t('report.result')}</TableHead>
                    <TableHead className="text-xs">{t('home.profit')}</TableHead>
                    <TableHead className="text-xs">{t('report.mode')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {trade.created_at ? new Date(trade.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {trade.created_at ? new Date(trade.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{trade.pair_name}</TableCell>
                      <TableCell className="text-xs">{trade.payout}%</TableCell>
                      <TableCell className="text-xs">R$ {Number(trade.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {trade.result === 'win' ? (
                          <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10 gap-1">
                            <CheckCircle className="w-3 h-3" /> WIN
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive bg-destructive/10 gap-1">
                            <XCircle className="w-3 h-3" /> LOSS
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={`text-xs font-bold ${(Number(trade.profit) || 0) >= 0 ? 'win-text' : 'loss-text'}`}>
                        R$ {Number(trade.profit || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {trade.management_mode || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeReport;
