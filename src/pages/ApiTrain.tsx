
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
import { Upload, Database, Activity, FileCheck, Settings, Check, Server } from 'lucide-react';
import { useState as useReactState } from 'react';

interface ApiConfig {
  url: string;
  apiKey: string;
}

const ApiTrain = () => {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [goodFiles, setGoodFiles] = useState<File[]>([]);
  const [badFiles, setBadFiles] = useState<File[]>([]);
  const [modelName, setModelName] = useState('fingerprint_model');
  const [logs, setLogs] = useState<string>('');
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    url: 'http://localhost:8000',
    apiKey: '',
  });
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

  const handleApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiConfig({...apiConfig, url: e.target.value});
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiConfig({...apiConfig, apiKey: e.target.value});
  };

  const handleStartTraining = async () => {
    if (goodFiles.length === 0 || badFiles.length === 0) {
      toast({
        title: "Files Required",
        description: "Please upload both good and bad audio files for training.",
        variant: "destructive"
      });
      return;
    }

    if (!apiConfig.url) {
      toast({
        title: "API URL Required",
        description: "Please provide the training API URL.",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setLogs('');
    
    appendLog(`Starting API-based training with model name: ${modelName}`);
    appendLog(`Good files: ${goodFiles.length}`);
    appendLog(`Bad files: ${badFiles.length}`);
    appendLog(`API URL: ${apiConfig.url}`);
    
    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append('model_name', modelName);
      
      // Add all good files with a "good_" prefix
      goodFiles.forEach((file, index) => {
        formData.append(`good_file_${index}`, file);
      });
      
      // Add all bad files with a "bad_" prefix
      badFiles.forEach((file, index) => {
        formData.append(`bad_file_${index}`, file);
      });

      // Set up progress tracking for the fetch
      const xhr = new XMLHttpRequest();
      
      // Listen for progress events
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const uploadProgress = Math.round((event.loaded / event.total) * 50); // Upload is 50% of the process
          setTrainingProgress(uploadProgress);
          appendLog(`Uploading files: ${uploadProgress}%`);
        }
      });

      // Handle completion
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              setTrainingProgress(100);
              appendLog('Training complete!');
              appendLog(`Model saved as: ${response.model_name}`);
              appendLog(`Accuracy: ${response.accuracy}`);
              appendLog(`Training time: ${response.training_time} seconds`);
              
              toast({
                title: "Training Complete",
                description: `Successfully trained model: ${response.model_name}`,
              });
            } catch (error) {
              appendLog(`Error parsing response: ${error}`);
              toast({
                title: "Training Error",
                description: "Failed to parse server response",
                variant: "destructive"
              });
            }
          } else {
            appendLog(`Server error: ${xhr.status} - ${xhr.statusText}`);
            toast({
              title: "Training Failed",
              description: `Server returned error: ${xhr.status}`,
              variant: "destructive"
            });
          }
          setIsTraining(false);
        }
      };

      // Setup request
      xhr.open('POST', `${apiConfig.url}/train`, true);
      
      // Add API key if provided
      if (apiConfig.apiKey) {
        xhr.setRequestHeader('Authorization', `Bearer ${apiConfig.apiKey}`);
      }
      
      // Send the request
      xhr.send(formData);
      
      appendLog('Request sent to training API...');
      appendLog('Uploading files and waiting for training to complete...');
      
    } catch (error) {
      appendLog(`Error: ${error}`);
      toast({
        title: "Training Failed",
        description: "Failed to communicate with the training API",
        variant: "destructive"
      });
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">API-Based Audio Training</h1>
        
        <Tabs defaultValue="upload">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </TabsTrigger>
            <TabsTrigger value="api">
              <Server className="mr-2 h-4 w-4" />
              API Configuration
            </TabsTrigger>
            <TabsTrigger value="train">
              <Activity className="mr-2 h-4 w-4" />
              Train Model
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Files Tab */}
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
          
          {/* API Configuration Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input 
                    id="api-url"
                    value={apiConfig.url} 
                    onChange={handleApiUrlChange}
                    disabled={isTraining}
                    placeholder="Enter API URL (e.g., http://localhost:8000)"
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL of your training API service (e.g., Flask or FastAPI endpoint)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input 
                    id="api-key"
                    type="password"
                    value={apiConfig.apiKey} 
                    onChange={handleApiKeyChange}
                    disabled={isTraining}
                    placeholder="Enter API key (if required)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Authentication key for your API (leave empty if not required)
                  </p>
                </div>
                
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Python API Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Sample Python FastAPI Code</h3>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`from fastapi import FastAPI, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Optional
import os
import time

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/train")
async def train_model(
    model_name: str = Form(...),
    good_files: List[UploadFile] = File(...),
    bad_files: List[UploadFile] = File(...),
    authorization: Optional[str] = Header(None)
):
    # Check API key if needed
    if authorization:
        api_key = authorization.replace("Bearer ", "")
        # Verify API key here
    
    # Save uploaded files
    os.makedirs("uploads/good", exist_ok=True)
    os.makedirs("uploads/bad", exist_ok=True)
    
    for file in good_files:
        with open(f"uploads/good/{file.filename}", "wb") as f:
            f.write(await file.read())
            
    for file in bad_files:
        with open(f"uploads/bad/{file.filename}", "wb") as f:
            f.write(await file.read())
    
    # Run your training code here
    # This is where you would call your Python training script
    
    # Return results
    return {
        "model_name": f"{model_name}.pkl",
        "accuracy": 0.95,
        "training_time": 120.5
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is a starting point for your Python API. You'll need to adapt it to use your actual training code.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Train Model Tab */}
          <TabsContent value="train" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Start API Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Training Data</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <Check className={`h-4 w-4 mr-2 ${goodFiles.length > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                        Good files: {goodFiles.length}
                      </li>
                      <li className="flex items-center">
                        <Check className={`h-4 w-4 mr-2 ${badFiles.length > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                        Bad files: {badFiles.length}
                      </li>
                      <li className="flex items-center">
                        <Check className={`h-4 w-4 mr-2 ${apiConfig.url ? 'text-green-500' : 'text-muted-foreground'}`} />
                        API URL: {apiConfig.url || 'Not set'}
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
                      disabled={isTraining || goodFiles.length === 0 || badFiles.length === 0 || !apiConfig.url}
                      className="w-full"
                    >
                      <Server className="mr-2 h-4 w-4" />
                      {isTraining ? 'Training in Progress...' : 'Start API Training'}
                    </Button>
                  </div>
                </div>
                
                {(isTraining || trainingProgress > 0) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{trainingProgress}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="training-logs">API Training Logs</Label>
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

export default ApiTrain;
