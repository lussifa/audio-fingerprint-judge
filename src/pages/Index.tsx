
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import FileUploadZone from '@/components/FileUploadZone';
import AudioAnalysisResults, { ResultItem } from '@/components/AudioAnalysisResults';
import StatsCard from '@/components/StatsCard';
import Footer from '@/components/Footer';
import { detectDirection, processFilesInBatches } from '@/lib/audio-fingerprint';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFilesSelected = async (files: File[]) => {
    // Reset state
    setIsProcessing(true);
    setProgress(0);
    
    // Initialize results with "processing" status
    const initialResults: ResultItem[] = files.map(file => ({
      fileName: file.name,
      direction: detectDirection(file.name),
      prediction: null,
      processing: true
    }));
    
    setResults(initialResults);

    try {
      // Process files with a progress callback
      await processFilesInBatches(
        files, 
        (currentResults, currentProgress) => {
          // Update results as they complete
          setProgress(currentProgress);
          
          // Merge completed results with the initial results
          const updatedResults = initialResults.map(item => {
            const completedItem = currentResults.find(r => r.fileName === item.fileName);
            if (completedItem) {
              return {
                ...item,
                prediction: completedItem.prediction,
                confidence: completedItem.confidence,
                processing: false
              };
            }
            return item;
          });
          
          setResults(updatedResults);
        }
      );

      // All processing complete
      toast({
        title: "Analysis Complete",
        description: `Successfully processed ${files.length} audio files.`,
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while analyzing some files.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="container flex-1">
        <div className="grid gap-8">
          {results.length > 0 && (
            <StatsCard results={results} />
          )}
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Upload Audio Files</h2>
                <p className="text-sm text-muted-foreground">
                  Upload WAV files for quality analysis. The system will determine if each file is of good or bad quality.
                </p>
              </div>
              
              <FileUploadZone 
                onFilesSelected={handleFilesSelected} 
                isProcessing={isProcessing} 
              />
            </div>
            
            <div>
              <AudioAnalysisResults 
                results={results} 
                overallProgress={progress}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
