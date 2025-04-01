
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Database, Activity, FileCheck, Settings, Check } from 'lucide-react';

const Train = () => {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [goodFiles, setGoodFiles] = useState<File[]>([]);
  const [badFiles, setBadFiles] = useState<File[]>([]);
  const [modelName, setModelName] = useState('fingerprint_model');
  const [logs, setLogs] = useState<string>('');
  const { toast } = useToast();

  const goodDropzone = useDropzone({
    accept: {
      'audio/wav': ['.wav']
    },
    onDrop: (acceptedFiles) => {
      setGoodFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    },
    disabled: isTraining
  });

  const badDropzone = useDropzone({
    accept: {
      'audio/wav': ['.wav']
    },
    onDrop: (acceptedFiles) => {
      setBadFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    },
    disabled: isTraining
  });

  const removeGoodFile = (fileName: string) => {
    setGoodFiles(goodFiles.filter(file => file.name !== fileName));
  };

  const removeBadFile = (fileName: string) => {
    setBadFiles(badFiles.filter(file => file.name !== fileName));
  };

  const clearAllFiles = () => {
    setGoodFiles([]);
    setBadFiles([]);
  };

  const appendLog = (message: string) => {
    setLogs(prev => prev + message + '\n');
  };

  const handleStartTraining = () => {
    if (goodFiles.length === 0 || badFiles.length === 0) {
      toast({
        title: "Files Required",
        description: "Please upload both good and bad audio files for training.",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setLogs('');
    
    // Mock training process
    appendLog(`Starting training with model name: ${modelName}`);
    appendLog(`Good files: ${goodFiles.length}`);
    appendLog(`Bad files: ${badFiles.length}`);
    
    // Simulate training steps with progress updates
    const totalSteps = 10;
    let currentStep = 0;
    
    const trainingInterval = setInterval(() => {
      currentStep++;
      const progress = Math.round((currentStep / totalSteps) * 100);
      setTrainingProgress(progress);
      
      switch(currentStep) {
        case 1:
          appendLog("Preprocessing audio files...");
          break;
        case 2:
          appendLog("Extracting audio fingerprints...");
          break;
        case 3:
          appendLog("Building feature vectors...");
          break;
        case 4:
          appendLog("Splitting training/testing datasets...");
          break;
        case 5:
          appendLog("Normalizing features...");
          break;
        case 6:
          appendLog("Optimizing hyperparameters with Bayesian optimization...");
          break;
        case 7:
          appendLog("Training XGBoost model...");
          break;
        case 8:
          appendLog("Evaluating model performance...");
          break;
        case 9:
          appendLog("Calculating accuracy metrics...");
          break;
        case 10:
          appendLog("Model training complete!");
          appendLog(`Model saved as: ${modelName}.pkl`);
          appendLog("Ready for audio quality prediction.");
          
          toast({
            title: "Training Complete",
            description: `Successfully trained model: ${modelName}.pkl`,
          });
          
          setIsTraining(false);
          clearInterval(trainingInterval);
          break;
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Audio Fingerprint Training</h1>
        
        <Tabs defaultValue="upload">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </TabsTrigger>
            <TabsTrigger value="configure">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="train">
              <Activity className="mr-2 h-4 w-4" />
              Train Model
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Good Files Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileCheck className="mr-2 text-green-500" />
                    Good Quality Audio Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...goodDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4
                      ${goodDropzone.isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                      ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input {...goodDropzone.getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">
                      {goodDropzone.isDragActive ? 'Drop WAV files here' : 'Drag & drop good WAV files here'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse files
                    </p>
                  </div>
                  
                  {goodFiles.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Files ({goodFiles.length})</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setGoodFiles([])}
                          disabled={isTraining}
                        >
                          Clear
                        </Button>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {goodFiles.map(file => (
                          <div key={file.name} className="flex justify-between items-center p-1 text-sm">
                            <span className="truncate max-w-[80%]">{file.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeGoodFile(file.name)} 
                              disabled={isTraining}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Bad Files Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileCheck className="mr-2 text-destructive" />
                    Bad Quality Audio Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...badDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4
                      ${badDropzone.isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                      ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input {...badDropzone.getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">
                      {badDropzone.isDragActive ? 'Drop WAV files here' : 'Drag & drop bad WAV files here'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse files
                    </p>
                  </div>
                  
                  {badFiles.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Files ({badFiles.length})</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setBadFiles([])}
                          disabled={isTraining}
                        >
                          Clear
                        </Button>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {badFiles.map(file => (
                          <div key={file.name} className="flex justify-between items-center p-1 text-sm">
                            <span className="truncate max-w-[80%]">{file.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeBadFile(file.name)} 
                              disabled={isTraining}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="configure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input 
                    id="model-name"
                    value={modelName} 
                    onChange={(e) => setModelName(e.target.value)}
                    disabled={isTraining}
                    placeholder="Enter model name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="direction-labels">Direction Labels</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="forward-label">Forward</Label>
                      <Input 
                        id="forward-label"
                        defaultValue="forward" 
                        disabled={isTraining}
                        placeholder="Forward label pattern"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="backward-label">Backward</Label>
                      <Input 
                        id="backward-label"
                        defaultValue="backward" 
                        disabled={isTraining}
                        placeholder="Backward label pattern"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    These labels will be detected in filenames to determine direction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="train" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Start Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Training Data</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Good files: {goodFiles.length}
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Bad files: {badFiles.length}
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Model name: {modelName}
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <Button 
                      onClick={handleStartTraining} 
                      disabled={isTraining || goodFiles.length === 0 || badFiles.length === 0}
                      className="w-full"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      {isTraining ? 'Training in Progress...' : 'Start Training'}
                    </Button>
                  </div>
                </div>
                
                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{trainingProgress}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="training-logs">Training Logs</Label>
                  <Textarea
                    id="training-logs"
                    value={logs}
                    readOnly
                    className="font-mono text-xs h-40"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Train;
