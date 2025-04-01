
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
    
    appendLog(`Starting XGBoost training with model name: ${modelName}`);
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
              
              if (response.feature_importances) {
                appendLog('\nFeature Importances:');
                Object.entries(response.feature_importances).forEach(([feature, importance]) => {
                  appendLog(`${feature}: ${importance}`);
                });
              }
              
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
      
      appendLog('Request sent to XGBoost training API...');
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
        <h1 className="text-2xl font-bold mb-6">Audio Fingerprint Training</h1>
        
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
                <CardTitle>Python XGBoost API Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Sample Python FastAPI Implementation</h3>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`from fastapi import FastAPI, UploadFile, File, Form, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict, List, Optional
import os
import time
import numpy as np
import pandas as pd
from librosa.feature import mfcc, spectral_centroid, spectral_bandwidth
from librosa.feature import spectral_rolloff, chroma_stft, zero_crossing_rate
from librosa import load
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
import pickle
from skopt import BayesSearchCV
from skopt.space import Real, Integer
import warnings
warnings.filterwarnings('ignore')

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Training status tracking
training_status = {
    "in_progress": False,
    "progress": 0,
    "message": "",
    "results": None
}

def extract_features(file_path):
    """Extract audio features using librosa"""
    try:
        # Load audio file
        y, sr = load(file_path, sr=None)
        
        # Extract various features
        mfccs = np.mean(mfcc(y=y, sr=sr, n_mfcc=13), axis=1)
        centroid = np.mean(spectral_centroid(y=y, sr=sr))
        bandwidth = np.mean(spectral_bandwidth(y=y, sr=sr))
        rolloff = np.mean(spectral_rolloff(y=y, sr=sr))
        chroma = np.mean(chroma_stft(y=y, sr=sr), axis=1)
        zcr = np.mean(zero_crossing_rate(y))
        
        # Combine all features
        features = np.hstack([mfccs, centroid, bandwidth, rolloff, chroma, zcr])
        return features
    except Exception as e:
        print(f"Error extracting features from {file_path}: {e}")
        return None

def run_training(good_files_paths, bad_files_paths, model_name):
    """Run the XGBoost training with Bayesian optimization"""
    global training_status
    
    try:
        training_status["message"] = "Extracting features from audio files..."
        training_status["progress"] = 10
        
        # Extract features
        features = []
        labels = []
        
        # Process good files
        for i, file_path in enumerate(good_files_paths):
            training_status["progress"] = 10 + int((i / len(good_files_paths)) * 20)
            training_status["message"] = f"Processing good file {i+1}/{len(good_files_paths)}"
            file_features = extract_features(file_path)
            if file_features is not None:
                features.append(file_features)
                labels.append(1)  # 1 for good
        
        # Process bad files
        for i, file_path in enumerate(bad_files_paths):
            training_status["progress"] = 30 + int((i / len(bad_files_paths)) * 20)
            training_status["message"] = f"Processing bad file {i+1}/{len(bad_files_paths)}"
            file_features = extract_features(file_path)
            if file_features is not None:
                features.append(file_features)
                labels.append(0)  # 0 for bad
        
        # Convert to DataFrame
        training_status["progress"] = 50
        training_status["message"] = "Building feature matrix..."
        
        feature_names = [f'mfcc{i+1}' for i in range(13)]
        feature_names.extend(['spectral_centroid', 'spectral_bandwidth', 'spectral_rolloff'])
        feature_names.extend([f'chroma{i+1}' for i in range(12)])
        feature_names.append('zero_crossing_rate')
        
        X = pd.DataFrame(features, columns=feature_names)
        y = np.array(labels)
        
        # Split data
        training_status["progress"] = 55
        training_status["message"] = "Splitting training and test data..."
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Bayesian optimization
        training_status["progress"] = 60
        training_status["message"] = "Optimizing hyperparameters with Bayesian search..."
        
        param_space = {
            'max_depth': Integer(3, 10),
            'learning_rate': Real(0.01, 0.3, 'log-uniform'),
            'n_estimators': Integer(50, 200),
            'gamma': Real(1e-6, 1.0, 'log-uniform'),
            'subsample': Real(0.5, 1.0, 'uniform'),
            'colsample_bytree': Real(0.5, 1.0, 'uniform')
        }
        
        xgb_classifier = xgb.XGBClassifier(objective='binary:logistic', use_label_encoder=False, eval_metric='logloss')
        
        opt = BayesSearchCV(
            xgb_classifier,
            param_space,
            n_iter=10,
            cv=3,
            n_jobs=-1,
            verbose=0,
            random_state=42
        )
        
        training_status["progress"] = 70
        training_status["message"] = "Training model with optimized parameters..."
        opt.fit(X_train, y_train)
        
        # Get best model
        best_model = opt.best_estimator_
        
        # Predictions
        training_status["progress"] = 90
        training_status["message"] = "Evaluating model performance..."
        y_pred = best_model.predict(X_test)
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        
        # Save the model
        training_status["progress"] = 95
        training_status["message"] = "Saving model..."
        os.makedirs("models", exist_ok=True)
        model_path = f"models/{model_name}.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(best_model, f)
        
        # Get feature importances
        feature_importances = dict(zip(feature_names, best_model.feature_importances_))
        
        # Complete
        training_status["progress"] = 100
        training_status["message"] = "Training complete!"
        training_status["results"] = {
            "model_name": f"{model_name}.pkl",
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "training_time": time.time() - training_start_time,
            "feature_importances": {k: float(v) for k, v in sorted(
                feature_importances.items(), 
                key=lambda item: item[1], 
                reverse=True
            )[:10]}  # Top 10 features
        }
    except Exception as e:
        training_status["message"] = f"Error during training: {str(e)}"
        print(f"Training error: {e}")
    finally:
        training_status["in_progress"] = False

@app.post("/train")
async def train_model(
    background_tasks: BackgroundTasks,
    model_name: str = Form(...),
    good_files: List[UploadFile] = File(...),
    bad_files: List[UploadFile] = File(...),
    authorization: Optional[str] = Header(None)
):
    global training_status, training_start_time
    
    # Check if training is already in progress
    if training_status["in_progress"]:
        return {"error": "Training already in progress"}
    
    # Check API key if needed
    if authorization:
        api_key = authorization.replace("Bearer ", "")
        # Verify API key here if needed
    
    # Save uploaded files
    os.makedirs("uploads/good", exist_ok=True)
    os.makedirs("uploads/bad", exist_ok=True)
    
    good_files_paths = []
    for file in good_files:
        file_path = f"uploads/good/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        good_files_paths.append(file_path)
            
    bad_files_paths = []
    for file in bad_files:
        file_path = f"uploads/bad/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        bad_files_paths.append(file_path)
    
    # Reset training status
    training_status = {
        "in_progress": True,
        "progress": 0,
        "message": "Starting training...",
        "results": None
    }
    
    training_start_time = time.time()
    
    # Run training in background
    background_tasks.add_task(
        run_training, 
        good_files_paths,
        bad_files_paths,
        model_name
    )
    
    return {"status": "Training started"}

@app.get("/training-status")
async def get_training_status():
    return training_status

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is a FastAPI implementation that can be used with your training code. It includes feature extraction, XGBoost training with Bayesian optimization, and result reporting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Train Model Tab */}
          <TabsContent value="train" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Start XGBoost Training</CardTitle>
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
                      {isTraining ? 'Training in Progress...' : 'Start XGBoost Training'}
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

export default ApiTrain;
