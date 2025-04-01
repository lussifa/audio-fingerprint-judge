
import React from 'react';
import { Waveform } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="bg-card shadow-md py-4 px-6 mb-6 border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Waveform className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Audio Fingerprint Judge</h1>
            <p className="text-xs text-muted-foreground">
              Analyze and classify audio files using acoustic fingerprints
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
