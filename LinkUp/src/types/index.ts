
/**
 * LinkUp Type Definitions
 * 
 * This file contains TypeScript interfaces for the core data structures
 * used throughout the LinkUp application. These types ensure consistency
 * and type safety when working with application data.
 */

/**
 * Represents a connection to an external calendar service
 */
export interface CalendarConnection {
  id: string;                      // Unique identifier 
  user_id: string;                 // Owner of this connection
  provider: 'google';              // Calendar provider (currently only Google supported)
  external_calendar_id: string;    // ID of the external calendar
  calendar_name?: string;          // Display name of the calendar
  sync_token?: string;             // Token for incremental syncing
  last_synced_at?: Date;           // When the calendar was last synchronized
  created_at?: Date;               // When the connection was created
  access_token: string;            // OAuth access token
  refresh_token: string;           // OAuth refresh token
  token_expires_at: Date;          // When the access token expires
}

/**
 * Represents a user in the LinkUp system
 */
export interface User {
  id: string;                      // Unique identifier
  name: string;                    // Display name
  username?: string;               // Optional username
  avatar_url?: string;             // URL to user's profile picture
  created_at?: Date;               // When the user account was created
}

/**
 * Represents a calendar event
 */
export interface CalendarEvent {
  id: string;                      // Unique identifier
  user_id: string;                 // Owner of this event
  title: string;                   // Event title
  description?: string;            // Optional event description
  start_time: Date;                // Start time and date
  end_time: Date;                  // End time and date
  location?: string;               // Optional physical location
  color?: string;                  // Display color (CSS color value)
  is_private?: boolean;            // Whether the event is private/visible to others
  created_at?: Date;               // When the event was created
  external_event_id?: string;      // ID in external calendar system if synced
}

/**
 * Form data structure for creating/editing events
 */
export interface EventFormData {
  title: string;                   // Event title
  description?: string;            // Optional event description
  start_time: Date;                // Start time and date
  end_time: Date;                  // End time and date
  location?: string;               // Optional physical location
  color?: string;                  // Display color
  is_private?: boolean;            // Privacy setting
}

/**
 * Represents a group of users
 */
export interface Group {
  id: string;                      // Unique identifier
  name: string;                    // Group name
  description?: string;            // Optional group description
  created_by: string;              // User ID of the creator
  created_at: Date;                // When the group was created
  members: string[];               // Array of member user IDs
}

/**
 * Form data structure for creating/editing groups
 */
export interface GroupFormData {
  name: string;                    // Group name
  description?: string;            // Optional group description
  members?: string[];              // Optional array of member user IDs to add
}

/**
 * Represents a user's membership in a group
 */
export interface GroupMember {
  id: string;                      // Unique identifier
  group_id: string;                // Group this membership belongs to
  user_id: string;                 // User ID of the member
  is_admin: boolean;               // Whether user has admin privileges
  created_at: Date;                // When user joined the group
}

/**
 * Represents a friendship connection between users
 */
export interface Friend {
  id: string;                      // Unique identifier
  user_id: string;                 // User who initiated the friendship
  friend_id: string;               // Target user of the friendship
  status: string;                  // Status: 'pending', 'accepted', 'rejected'
  created_at?: Date;               // When the friend request was created
  updated_at?: Date;               // When the friendship status was last updated
}

/**
 * Represents a voting proposal for scheduling
 */
export interface VoteProposal {
  id: string;                      // Unique identifier
  group_id: string;                // Group this vote belongs to
  title: string;                   // Vote title
  description?: string;            // Optional description
  proposed_start: Date;            // Proposed start time
  proposed_end: Date;              // Proposed end time
  created_by: string;              // User ID of creator
  status: 'active' | 'completed' | 'cancelled'; // Current status
  created_at: Date;                // When created
  vote_responses?: VoteResponse[]; // Responses from group members
}

/**
 * Form data structure for creating vote proposals
 */
export interface VoteFormData {
  title: string;                   // Vote title
  description?: string;            // Optional description
  proposed_start: Date;            // Proposed start time
  proposed_end: Date;              // Proposed end time
  group_id: string;                // Group this vote belongs to
}

/**
 * Represents a user's response to a vote proposal
 */
export interface VoteResponse {
  id: string;                      // Unique identifier
  vote_id: string;                 // Vote this response belongs to
  user_id: string;                 // User who submitted this response
  response: 'yes' | 'no' | 'maybe'; // User's vote
  created_at: Date;                // When response was submitted
}
