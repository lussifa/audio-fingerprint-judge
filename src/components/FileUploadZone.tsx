
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesSelected, isProcessing }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for WAV files
    const wavFiles = acceptedFiles.filter(file => file.name.toLowerCase().endsWith('.wav'));
    
    if (wavFiles.length < acceptedFiles.length) {
      setError('Some files were rejected. Only .wav files are supported.');
    } else {
      setError(null);
    }
    
    setSelectedFiles(prevFiles => [...prevFiles, ...wavFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav']
    },
    disabled: isProcessing
  });

  const removeFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    } else {
      setError('Please select at least one file.');
    }
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop WAV files here' : 'Drag & drop WAV files here'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse files
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive p-2 rounded bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="bg-card rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {selectedFiles.map((file) => (
              <div 
                key={file.name} 
                className="flex items-center justify-between bg-secondary/50 p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(file.name)}
                  disabled={isProcessing}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={handleClearAll}
          disabled={selectedFiles.length === 0 || isProcessing}
        >
          Clear
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={selectedFiles.length === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Analyze Files'}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadZone;
