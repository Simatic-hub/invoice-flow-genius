
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { usePackageCheck } from '@/hooks/usePackageCheck';
import { Button } from '@/components/ui/button';
import { useDiagnostics } from '@/components/invoices/useDiagnostics';

export const ProjectDiagnostics = () => {
  const { isPackageAvailable, diagnosticInfo } = usePackageCheck();
  const { isSupabaseConnected, checkConnection } = useDiagnostics();
  
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
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Current Environment Information:</h3>
          <pre className="p-4 bg-muted rounded-md overflow-auto text-sm">
            {diagnosticInfo || 'Collecting information...'}
          </pre>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => {
              checkConnection();
            }}
          >
            Retry Connection
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-md text-sm">
          <p className="font-medium mb-2">Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Verify that your Supabase project is properly connected</li>
            <li>Check that all required dependencies are correctly installed</li>
            <li>Ensure that you're logged in to access protected resources</li>
            <li>Try restarting the development server</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDiagnostics;
