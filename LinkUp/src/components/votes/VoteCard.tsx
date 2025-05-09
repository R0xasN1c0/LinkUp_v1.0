
import React from 'react';
import { format } from 'date-fns';
import { VoteProposal, User } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/AppContext';

interface VoteCardProps {
  vote: VoteProposal;
  creator?: User;
}

const VoteCard: React.FC<VoteCardProps> = ({ vote, creator }) => {
  const { currentUser, submitVote } = useAppContext();
  
  // Access vote_responses safely, defaulting to empty array if undefined
  const voteResponses = vote.vote_responses || [];
  
  const userVote = currentUser 
    ? voteResponses.find(v => v.user_id === currentUser.id)?.response 
    : undefined;
    
  const yesVotes = voteResponses.filter(v => v.response === 'yes').length;
  const maybeVotes = voteResponses.filter(v => v.response === 'maybe').length;
  const noVotes = voteResponses.filter(v => v.response === 'no').length;
  const totalVotes = voteResponses.length;
  
  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  
  const handleVote = (voteValue: 'yes' | 'no' | 'maybe') => {
    submitVote(vote.id, voteValue);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 pb-2">
        <CardTitle>{vote.title}</CardTitle>
        <CardDescription>
          Proposed by {creator?.name || 'Unknown'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 pb-2">
        <div className="space-y-4">
          {vote.description && (
            <p className="text-sm text-gray-600">{vote.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Start</p>
              <p>{format(new Date(vote.proposed_start), 'PPP')}</p>
              <p>{format(new Date(vote.proposed_start), 'HH:mm')}</p>
            </div>
            
            <div>
              <p className="text-gray-500">End</p>
              <p>{format(new Date(vote.proposed_end), 'PPP')}</p>
              <p>{format(new Date(vote.proposed_end), 'HH:mm')}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Current votes:</span>
              <span>{yesVotes} of {totalVotes} voted yes</span>
            </div>
            <Progress value={yesPercentage} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-1">
            {voteResponses.map(userVote => {
              // Find the user who voted
              const voter = userVote.user_id === currentUser?.id 
                ? currentUser 
                : { name: 'User', avatar_url: null };
              
              if (!voter) return null;
              
              return (
                <div 
                  key={userVote.id}
                  className="flex items-center text-xs rounded-full px-2 py-1"
                  style={{
                    backgroundColor: 
                      userVote.response === 'yes' ? '#d1fae5' :
                      userVote.response === 'maybe' ? '#fef3c7' : '#fee2e2'
                  }}
                >
                  <Avatar className="h-4 w-4 mr-1">
                    <div className="h-full w-full flex items-center justify-center text-[8px]">
                      {voter.avatar_url ? (
                        <img src={voter.avatar_url} alt={voter.name} className="h-full w-full object-cover" />
                      ) : (
                        voter.name.charAt(0)
                      )}
                    </div>
                  </Avatar>
                  {voter.name}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full grid grid-cols-3 gap-2">
          <Button 
            variant={userVote === 'yes' ? "default" : "outline"} 
            size="sm" 
            onClick={() => handleVote('yes')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4 mr-1" />
            Yes
          </Button>
          
          <Button 
            variant={userVote === 'maybe' ? "default" : "outline"} 
            size="sm" 
            onClick={() => handleVote('maybe')}
            className={userVote === 'maybe' ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
          >
            Maybe
          </Button>
          
          <Button 
            variant={userVote === 'no' ? "default" : "outline"} 
            size="sm" 
            onClick={() => handleVote('no')}
            className={userVote === 'no' ? "bg-red-600 hover:bg-red-700 text-white" : "text-red-600 border-red-200 hover:bg-red-50"}
          >
            <X className="h-4 w-4 mr-1" />
            No
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VoteCard;
