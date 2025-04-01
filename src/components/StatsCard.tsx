
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultItem } from './AudioAnalysisResults';

interface StatsCardProps {
  results: ResultItem[];
}

const StatsCard: React.FC<StatsCardProps> = ({ results }) => {
  const completedResults = results.filter(r => r.prediction && !r.processing && !r.error);
  const goodCount = completedResults.filter(r => r.prediction === 'good').length;
  const badCount = completedResults.filter(r => r.prediction === 'bad').length;
  const forwardCount = completedResults.filter(r => r.direction === 'forward').length;
  const backwardCount = completedResults.filter(r => r.direction === 'backward').length;
  
  const total = completedResults.length;
  const goodPercentage = total > 0 ? (goodCount / total) * 100 : 0;
  
  if (total === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{total}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Good Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline">
          <p className="text-2xl font-bold text-success">{goodCount}</p>
          <p className="ml-2 text-xs text-muted-foreground">
            ({goodPercentage.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Forward Direction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{forwardCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Backward Direction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{backwardCount}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
