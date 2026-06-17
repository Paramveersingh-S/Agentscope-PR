import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Card } from "@/components/ui/card";

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  splitView?: boolean;
}

export function DiffViewer({ oldCode, newCode, splitView = true }: DiffViewerProps) {
  const newStyles = {
    variables: {
      light: {
        diffViewerBackground: '#fcfcfc',
        addedBackground: '#e6ffed',
        addedColor: '#24292e',
        removedBackground: '#ffeef0',
        removedColor: '#24292e',
        wordAddedBackground: '#acf2bd',
        wordRemovedBackground: '#fdb8c0',
        addedGutterBackground: '#cdffd8',
        removedGutterBackground: '#ffdce0',
        gutterBackground: '#f7f7f7',
        gutterBackgroundDark: '#f3f1f1',
        highlightBackground: '#fffbdd',
        highlightGutterBackground: '#fff5b1',
        codeFoldGutterBackground: '#dbedff',
        codeFoldBackground: '#f1f8ff',
        emptyLineBackground: '#fafbfc',
        gutterColor: '#24292e',
        addedGutterColor: '#211e1e',
        removedGutterColor: '#211e1e',
        codeFoldContentColor: '#24292e',
      },
      dark: {
        diffViewerBackground: '#0d1117',
        addedBackground: '#04260f',
        addedColor: '#c9d1d9',
        removedBackground: '#3fb0a',
        removedColor: '#c9d1d9',
        wordAddedBackground: '#2ea043',
        wordRemovedBackground: '#da3633',
        addedGutterBackground: '#03210d',
        removedGutterBackground: '#300302',
        gutterBackground: '#0d1117',
        gutterBackgroundDark: '#0d1117',
        highlightBackground: '#2a2007',
        highlightGutterBackground: '#42330a',
        codeFoldGutterBackground: '#1f2428',
        codeFoldBackground: '#1f2428',
        emptyLineBackground: '#0d1117',
        gutterColor: '#484f58',
        addedGutterColor: '#8b949e',
        removedGutterColor: '#8b949e',
        codeFoldContentColor: '#8b949e',
      }
    }
  };

  return (
    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={splitView}
        compareMethod={DiffMethod.WORDS}
        styles={newStyles}
        useDarkTheme={true}
      />
    </Card>
  );
}
