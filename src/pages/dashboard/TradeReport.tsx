import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

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

  const totalWins = trades.filter(t => t.result === 'win').length;
  const totalLosses = trades.filter(t => t.result === 'loss').length;
  const totalProfit = trades.reduce((acc, t) => acc + (Number(t.profit) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
          <FileText className="w-5 h-5" /> {t('report.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('report.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{t('report.totalTrades')}</p>
            <p className="text-xl font-display font-bold text-foreground">{trades.length}</p>
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
            <p className="text-xs text-muted-foreground">{t('report.totalProfit')}</p>
            <p className={`text-xl font-display font-bold ${totalProfit >= 0 ? 'win-text' : 'loss-text'}`}>
              R$ {totalProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trade Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.loading')}</div>
          ) : trades.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('report.noTrades')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('report.date')}</TableHead>
                    <TableHead className="text-xs">{t('home.pair')}</TableHead>
                    <TableHead className="text-xs">Payout</TableHead>
                    <TableHead className="text-xs">{t('report.amount')}</TableHead>
                    <TableHead className="text-xs">{t('report.result')}</TableHead>
                    <TableHead className="text-xs">{t('home.profit')}</TableHead>
                    <TableHead className="text-xs">{t('report.mode')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {trade.created_at ? new Date(trade.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
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
                        {trade.entry_type || trade.management_mode || '-'}
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
