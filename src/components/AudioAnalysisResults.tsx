
import React from 'react';
import { Check, X, FileAudio, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface ResultItem {
  fileName: string;
  direction: 'forward' | 'backward';
  prediction: 'good' | 'bad' | null;
  confidence?: number;
  processing?: boolean;
  error?: string;
}

interface AudioAnalysisResultsProps {
  results: ResultItem[];
  overallProgress: number;
  isProcessing: boolean;
}

const AudioAnalysisResults: React.FC<AudioAnalysisResultsProps> = ({ 
  results, 
  overallProgress,
  isProcessing 
}) => {
  
  if (results.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Analysis Results</h2>
        {isProcessing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing {overallProgress.toFixed(0)}%</span>
          </div>
        )}
      </div>
      
      {isProcessing && (
        <Progress value={overallProgress} className="h-2 mb-4" />
      )}
      
      <div className="grid gap-3">
        {results.map((item) => (
          <div 
            key={item.fileName} 
            className={cn(
              "bg-card border rounded-lg p-4 transition-all",
              item.processing && "animate-pulse border-primary/30",
              item.error && "border-destructive/50",
              item.prediction === 'good' && !item.processing && "border-success/50",
              item.prediction === 'bad' && !item.processing && "border-destructive/50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <FileAudio className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.fileName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full mr-2">
                  {item.direction}
                </span>
                {item.processing ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : item.error ? (
                  <div className="flex items-center text-destructive">
                    <X className="h-5 w-5" />
                  </div>
                ) : item.prediction === 'good' ? (
                  <div className="flex items-center text-success">
                    <Check className="h-5 w-5" />
                  </div>
                ) : item.prediction === 'bad' ? (
                  <div className="flex items-center text-destructive">
                    <X className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
            </div>
            
            {item.error ? (
              <div className="text-sm text-destructive mt-2">
                Error: {item.error}
              </div>
            ) : item.processing ? (
              <div className="text-sm text-muted-foreground">
                Analyzing audio fingerprint...
              </div>
            ) : item.prediction ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Quality: <span className={cn(
                      "font-medium",
                      item.prediction === 'good' ? "text-success" : "text-destructive"
                    )}>
                      {item.prediction.toUpperCase()}
                    </span>
                  </span>
                  {item.confidence && (
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(item.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                {item.confidence && (
                  <Progress 
                    value={item.confidence * 100} 
                    className={cn(
                      "h-1.5",
                      item.prediction === 'good' ? "bg-success/20" : "bg-destructive/20" 
                    )}
                    indicatorClassName={
                      item.prediction === 'good' ? "bg-success" : "bg-destructive"
                    }
                  />
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioAnalysisResults;
