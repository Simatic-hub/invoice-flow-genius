
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePackageCheck } from '@/hooks/usePackageCheck';

export const ProjectDiagnostics = () => {
  const { isPackageAvailable, diagnosticInfo } = usePackageCheck();

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Project Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Project Configuration Issue Detected</AlertTitle>
          <AlertDescription>
            The system is unable to locate critical configuration files. 
            This is typically a project structure issue rather than a code issue.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Current Environment Information:</h3>
          <pre className="p-4 bg-muted rounded-md overflow-auto text-sm">
            {diagnosticInfo || 'Collecting information...'}
          </pre>
        </div>
        
        <div className="bg-muted p-4 rounded-md text-sm">
          <p className="font-medium mb-2">Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check that your project structure includes the required configuration files at the correct level</li>
            <li>Verify that all dependencies are correctly installed</li>
            <li>Ensure that build scripts are properly configured</li>
            <li>Try restarting the development server</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDiagnostics;
