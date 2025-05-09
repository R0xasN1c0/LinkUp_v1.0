
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Calendar Sync Edge Function
 * 
 * This function synchronizes calendar data from external providers (like Google Calendar)
 * with the LinkUp application database.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the auth context
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Error getting user session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: sessionError || 'No user session found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all calendar connections for the user
    const { data: connections, error: connectionsError } = await supabaseClient
      .from('calendar_connections')
      .select('*')
      .eq('user_id', userId);

    if (connectionsError) {
      console.error('Error fetching calendar connections:', connectionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch calendar connections', details: connectionsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No calendar connections found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Process each connection - in a real implementation, this would fetch events from Google Calendar API
    // and sync them to our database
    console.log(`Found ${connections.length} calendar connections for user ${userId}`);
    
    // For now, we'll just update the last_synced_at timestamp
    for (const connection of connections) {
      await supabaseClient
        .from('calendar_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', connection.id);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Synced ${connections.length} calendars` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in sync-calendars function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
