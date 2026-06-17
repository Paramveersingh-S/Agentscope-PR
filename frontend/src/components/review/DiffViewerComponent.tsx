import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewerComponentProps {
  oldCode: string;
  newCode: string;
}

export function DiffViewerComponent({ oldCode, newCode }: DiffViewerComponentProps) {
  
  const customStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#0a0a0a',
        diffViewerTitleBackground: '#0f172a',
        diffViewerColor: '#ededed',
        diffViewerTitleColor: '#ededed',
        diffViewerTitleBorderColor: '#1e293b',
        addedBackground: '#064e3b',
        addedColor: '#34d399',
        removedBackground: '#4c1d95', // Use a deep purple/red for removed
        removedColor: '#f87171',
        wordAddedBackground: '#059669',
        wordRemovedBackground: '#7f1d1d',
        addedGutterBackground: '#022c22',
        removedGutterBackground: '#2e1065',
        gutterBackground: '#0f172a',
        gutterBackgroundDark: '#0f172a',
        highlightBackground: '#1e3a8a',
        highlightGutterBackground: '#1e3a8a',
        codeFoldGutterBackground: '#0f172a',
        codeFoldBackground: '#0f172a',
        emptyLineBackground: '#0a0a0a',
        gutterColor: '#475569',
        addedGutterColor: '#34d399',
        removedGutterColor: '#f87171',
      }
    },
    line: {
      fontSize: '13px',
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 glass">
      <div className="bg-muted px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center">
          <span className="w-2 h-2 rounded-full bg-secondary mr-2"></span>
          Code Changes
        </h3>
      </div>
      <ReactDiffViewer 
        oldValue={oldCode} 
        newValue={newCode} 
        splitView={true}
        useDarkTheme={true}
        compareMethod={DiffMethod.WORDS}
        styles={customStyles}
        hideLineNumbers={false}
      />
    </div>
  );
}
