
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, WifiOff, FileText } from 'lucide-react';
import { usePackageCheck } from '@/hooks/usePackageCheck';
import { Button } from '@/components/ui/button';
import { useDiagnostics } from '@/components/invoices/useDiagnostics';

export const ProjectDiagnostics = () => {
  const { isPackageAvailable, diagnosticInfo } = usePackageCheck();
  const { isSupabaseConnected, isPdfLibraryLoaded, checkConnection, isCheckingConnection } = useDiagnostics();
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Project Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={isSupabaseConnected ? "default" : "destructive"}>
          {isSupabaseConnected ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertTitle>
            {isSupabaseConnected 
              ? "Connection Status: OK" 
              : "Connection Issue Detected"}
          </AlertTitle>
          <AlertDescription>
            {isSupabaseConnected ? (
              "Your application is properly connected to Supabase."
            ) : (
              <>
                The system is having trouble connecting to required services. This might be due to:
                <ul className="list-disc pl-5 mt-2">
                  <li>Supabase connection issues</li>
                  <li>Missing or incorrect environment configuration</li>
                  <li>Network connectivity problems</li>
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
        
        <Alert variant={isPdfLibraryLoaded ? "default" : "destructive"}>
          {isPdfLibraryLoaded ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <AlertTitle>
            {isPdfLibraryLoaded 
              ? "PDF Generation: Ready" 
              : "PDF Generation Issue Detected"}
          </AlertTitle>
          <AlertDescription>
            {isPdfLibraryLoaded ? (
              "The PDF generation library is properly loaded and available."
            ) : (
              <>
                The system is having trouble with PDF generation. This might be due to:
                <ul className="list-disc pl-5 mt-2">
                  <li>jsPDF library not properly loaded</li>
                  <li>Missing or incorrect dependency versions</li>
                  <li>Browser compatibility issues</li>
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
        
        {showDetails && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Current Environment Information:</h3>
            <pre className="p-4 bg-muted rounded-md overflow-auto text-sm">
              {JSON.stringify(diagnosticInfo, null, 2) || 'Collecting information...'}
            </pre>
          </div>
        )}

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              checkConnection();
            }}
            disabled={isCheckingConnection}
          >
            {isCheckingConnection ? "Checking..." : "Retry Connection"}
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-md text-sm">
          <p className="font-medium mb-2">Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Verify that your Supabase project is properly connected</li>
            <li>Check that all required dependencies are correctly installed</li>
            <li>Ensure that you're logged in to access protected resources</li>
            <li>Try restarting the development server</li>
            <li>Check browser console for specific error messages</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDiagnostics;
