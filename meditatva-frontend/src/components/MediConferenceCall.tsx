import React, { useState } from 'react';
import { Phone, UserPlus, Users, X, PhoneCall, AlertCircle, PhoneMissed } from 'lucide-react';
import axios from 'axios';

interface Participant {
  phoneNumber: string;
  name?: string;
  callSid?: string;
  status?: 'calling' | 'joined' | 'failed';
}

export default function MediConferenceCall() {
  const [hostNumber, setHostNumber] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState<Participant>({ phoneNumber: '', name: '' });
  const [conferenceName, setConferenceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'active' | 'completed'>('idle');
  const [error, setError] = useState<string>('');
  const [activeConference, setActiveConference] = useState<string>('');

  const startConferenceCall = async () => {
    setError('');
    
    // Validate host number
    if (!hostNumber.trim()) {
      setError('Please enter your phone number to start');
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(hostNumber.replace(/\s/g, ''))) {
      setError('Please enter valid phone number with country code (e.g., +917739489684)');
      return;
    }

    setIsLoading(true);
    setCallStatus('calling');

    try {
      const response = await axios.post('http://localhost:5000/api/voice-call/initiate-conference', {
        phoneNumber: hostNumber.replace(/\s/g, ''),
        conferenceName: conferenceName || undefined
      });

      setActiveConference(response.data.conferenceName);
      setCallStatus('active');
      console.log('Conference started:', response.data);
    } catch (err: any) {
      console.error('Error starting conference:', err);
      setError(err.response?.data?.message || 'Failed to start conference call');
      setCallStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = async () => {
    if (!newParticipant.phoneNumber.trim()) {
      setError('Please enter participant phone number');
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(newParticipant.phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter valid phone number with country code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/voice-call/add-to-conference', {
        conferenceName: activeConference,
        phoneNumber: newParticipant.phoneNumber.replace(/\s/g, ''),
        participantName: newParticipant.name || undefined
      });

      // Add to participants list
      setParticipants([...participants, {
        ...newParticipant,
        callSid: response.data.callSid,
        status: 'calling'
      }]);

      // Reset new participant form
      setNewParticipant({ phoneNumber: '', name: '' });
      
      console.log('Participant added:', response.data);
    } catch (err: any) {
      console.error('Error adding participant:', err);
      setError(err.response?.data?.message || 'Failed to add participant');
    } finally {
      setIsLoading(false);
    }
  };

  const endConference = () => {
    setCallStatus('completed');
    setParticipants([]);
    setHostNumber('');
    setActiveConference('');
    setConferenceName('');
  };

  const resetCall = () => {
    setCallStatus('idle');
    setError('');
    setParticipants([]);
    setHostNumber('');
    setConferenceName('');
    setActiveConference('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medi Conference Call</h2>
          <p className="text-sm text-gray-600">Start your call, then add people to join</p>
        </div>
      </div>

      {callStatus === 'idle' && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number *
            </label>
            <input
              type="tel"
              value={hostNumber}
              onChange={(e) => setHostNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+917739489684"
            />
            <p className="text-xs text-gray-500 mt-1">You will receive the call first</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conference Name (Optional)
            </label>
            <input
              type="text"
              value={conferenceName}
              onChange={(e) => setConferenceName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Family Health Discussion"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Step 1:</strong> You receive a call and join the conference</li>
              <li>• <strong>Step 2:</strong> Add friends/family using the "Add Person" button</li>
              <li>• <strong>Step 3:</strong> AI assistant joins automatically</li>
              <li>• <strong>Step 4:</strong> Anyone can ask medical questions in Hindi/English</li>
              <li>• <strong>Step 5:</strong> AI responds to everyone on the call</li>
            </ul>
          </div>

          <button
            onClick={startConferenceCall}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Calling You...
              </>
            ) : (
              <>
                <PhoneCall className="w-5 h-5" />
                Start My Conference Call
              </>
            )}
          </button>
        </>
      )}

      {callStatus === 'calling' && (
        <div className="text-center py-8">
          <div className="animate-pulse mb-4">
            <Phone className="w-16 h-16 text-purple-600 mx-auto animate-bounce" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Calling You...</h3>
          <p className="text-gray-600">Please answer your phone to join the conference</p>
          <button
            onClick={() => setCallStatus('idle')}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {callStatus === 'active' && (
        <div className="py-4">
          <div className="bg-green-100 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="bg-green-600 rounded-full p-2">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Conference Active!</h3>
              <p className="text-sm text-green-700">Conference: {activeConference}</p>
            </div>
            <button
              onClick={endConference}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              End Call
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">📞 You're on the call now!</h4>
            <p className="text-sm text-yellow-800">
              • AI assistant will join shortly<br />
              • You can ask medical questions anytime<br />
              • Add more people using the button below
            </p>
          </div>

          {/* Participants List */}
          {participants.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Added Participants ({participants.length})</h4>
              <div className="space-y-2">
                {participants.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900">{p.name || 'Participant'}</p>
                      <p className="text-sm text-gray-600">{p.phoneNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'joined' ? 'bg-green-100 text-green-700' :
                      p.status === 'calling' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status === 'joined' ? '✓ Joined' :
                       p.status === 'calling' ? '📞 Calling' :
                       '✗ Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Participant Form */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Add Person to Call
            </h4>
            
            <div className="space-y-3">
              <input
                type="text"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Name (Optional)"
              />
              <input
                type="tel"
                value={newParticipant.phoneNumber}
                onChange={(e) => setNewParticipant({ ...newParticipant, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+919876543210"
              />
              
              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={addParticipant}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    Call & Add to Conference
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {callStatus === 'completed' && (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <PhoneMissed className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Conference Ended</h3>
          <p className="text-gray-600 mb-6">Thank you for using Medi Conference Call</p>
          
          <button
            onClick={resetCall}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            Start New Conference
          </button>
        </div>
      )}
    </div>
  );
}
