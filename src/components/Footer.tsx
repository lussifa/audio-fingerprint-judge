
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-border">
      <div className="container">
        <p className="text-sm text-center text-muted-foreground">
          Audio Fingerprint Judge - &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
