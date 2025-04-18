declare module 'react-mathjax2' {
    import * as React from 'react';
  
    interface MathJaxProps {
      children: React.ReactNode;
      inline?: boolean;
      display?: boolean;
    }
  
    export const MathJax: React.ComponentType<MathJaxProps>;
    export const MathJaxNode: React.ComponentType<MathJaxProps>;
  
    export interface MathJaxContextProps {
      children: React.ReactNode;
      input?: string;
    }
  
    export const MathJaxContext: React.ComponentType<MathJaxContextProps>;
  }
  