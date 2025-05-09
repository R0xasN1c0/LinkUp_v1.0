
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';
import { useAppContext } from '@/context/AppContext';
import { Trash2, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePlatform } from '@/hooks/use-platform';
import { useOffline } from '@/hooks/use-offline';

const CalendarConnections: React.FC = () => {
  const { 
    calendarConnections, 
    connectCalendar, 
    disconnectCalendar,
    syncCalendars
  } = useAppContext();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isMobile = useIsMobile();
  const { isNative, platform } = usePlatform();
  const { isOnline } = useOffline();
  const [connectionStarted, setConnectionStarted] = useState(false);

  // Handle deep link redirect when returning from auth
  useEffect(() => {
    const handleDeepLink = () => {
      if (connectionStarted) {
        toast.success('Returning from authentication');
        setConnectionStarted(false);
        // You would implement actual auth state checking here
      }
    };

    // Check for redirect/return from auth
    if (isNative && connectionStarted) {
      // In a production app, you would register for deep link events
      // This is simplified for demonstration
      handleDeepLink();
    }
    
    return () => {
      // Cleanup any listeners
    };
  }, [connectionStarted, isNative]);

  const handleConnect = async () => {
    if (!isOnline) {
      toast.error('You need an internet connection to connect calendars');
      return;
    }
    
    try {
      setIsConnecting(true);
      setConnectionStarted(true);
      await connectCalendar();
    } catch (error) {
      console.error('Calendar connection error:', error);
      toast.error('Failed to connect Google Calendar');
      setConnectionStarted(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('You need an internet connection to sync calendars');
      return;
    }
    
    try {
      setIsSyncing(true);
      await syncCalendars();
      toast.success('Calendar sync initiated');
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast.error('Failed to sync calendars');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <Button 
              variant="default" 
              onClick={handleConnect}
              disabled={isConnecting || !isOnline}
            >
              <GoogleIcon className="h-6 w-6 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
            </Button>
            
            {!isOnline && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription className="text-xs">
                  You need an internet connection to manage calendar connections.
                </AlertDescription>
              </Alert>
            )}
            
            {isMobile && isNative && (
              <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <AlertDescription className="text-xs">
                  {platform === 'ios' 
                    ? 'When connecting on iOS, you\'ll need to return to this app after authentication.'
                    : 'When connecting on Android, you\'ll be redirected back automatically after authorization.'}
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="default" className="mt-2">
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription className="text-xs">
                If you see an access error after clicking, make sure your Google OAuth configuration has the correct redirect URIs set up in the Google Developer Console.
              </AlertDescription>
            </Alert>
          </div>

          {calendarConnections.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Connected Calendars</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleSync}
                        disabled={isSyncing || !isOnline}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sync events from your connected calendars</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {calendarConnections.map((connection) => (
                <div 
                  key={connection.id} 
                  className="flex items-center justify-between p-3 border rounded-lg mb-2"
                >
                  <div className="flex items-center">
                    <GoogleIcon className="h-6 w-6 mr-2" />
                    <span>{connection.calendar_name || 'Google Calendar'}</span>
                  </div>
                  <Button 
                    variant="default" 
                    size="icon"
                    onClick={() => disconnectCalendar(connection.id)}
                    disabled={!isOnline}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarConnections;
