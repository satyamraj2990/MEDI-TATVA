import { useState } from 'react';
import { Phone, PhoneOff, PhoneCall, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';

interface MediCallSarthiProps {
  onClose: () => void;
}

export const MediCallSarthi = ({ onClose }: MediCallSarthiProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'initiating' | 'active' | 'completed'>('idle');

  const initiateCall = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setCallStatus('initiating');

    try {
      const fullPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      console.log('Initiating call to:', fullPhoneNumber);
      
      const response = await apiClient.post('/voice-call/initiate-call', {
        phoneNumber: fullPhoneNumber,
        patientName: 'Patient'
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        setCallSid(response.data.callSid);
        setCallStatus('active');
        toast.success('Call initiated! You will receive a call shortly.');
      } else {
        toast.error('Failed to initiate call');
        setCallStatus('idle');
      }
    } catch (error: any) {
      console.error('Error initiating call:', error);
      
      // Show specific error message
      const errorData = error.response?.data;
      
      if (errorData?.errorType === 'unverified_number') {
        toast.error('Twilio Trial Account Limitation', {
          description: 'Your phone number needs to be verified in Twilio console first.',
          duration: 8000
        });
        console.log('\n⚠️ TWILIO TRIAL ACCOUNT LIMITATION:\n');
        console.log(errorData.error);
        console.log('\n💡 Solution:', errorData.help);
      } else if (errorData?.errorType === 'invalid_number') {
        toast.error('Invalid Phone Number', {
          description: 'Please check the phone number format (e.g., +919876543210)',
          duration: 5000
        });
      } else if (errorData?.error === 'Public URL required') {
        toast.error('Development Setup Required', {
          description: 'Ngrok tunnel needed. Check console for instructions.',
          duration: 6000
        });
        console.log('\n🔧 SETUP REQUIRED:\n');
        console.log(errorData.message);
        console.log('\n📋 Instructions:\n');
        console.log(errorData.instructions);
        console.log('\n📖 See: VOICE_CALL_FIX_SUMMARY.md for detailed setup\n');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network Connection Failed', {
          description: 'Cannot connect to backend server. Please check if backend is running.',
          duration: 6000
        });
        console.error('\n🔴 NETWORK ERROR: Cannot reach backend API');
        console.error('Backend URL should be: http://localhost:5000');
        console.error('Check if backend is running: ps aux | grep "node.*app.js"');
      } else {
        const errorMessage = errorData?.error || errorData?.message || error.message || 'Failed to initiate call';
        toast.error(errorMessage, {
          description: errorData?.details || '',
          duration: 5000
        });
      }
      
      setCallStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const endCall = () => {
    setCallStatus('completed');
    setCallSid(null);
    setPhoneNumber('');
    toast.info('Call session ended');
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Medi Call Sarthi
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI Voice Medical Assistant
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            ✕
          </Button>
        </div>

        {/* Status Indicator */}
        {callStatus !== 'idle' && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700">
            <div className="flex items-center gap-3">
              {callStatus === 'initiating' && (
                <>
                  <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                  <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                    Initiating call...
                  </span>
                </>
              )}
              {callStatus === 'active' && (
                <>
                  <PhoneCall className="w-5 h-5 text-green-600 animate-pulse" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Call in progress...
                  </span>
                </>
              )}
              {callStatus === 'completed' && (
                <>
                  <PhoneOff className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Call completed
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎙️ How it works:
          </h3>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Enter your phone number</li>
            <li>• Click "Start Call" to receive a call</li>
            <li>• Speak your medical concern clearly</li>
            <li>• AI will respond with guidance</li>
            <li>• Supports Hindi & English</li>
          </ul>
        </div>

        {/* Phone Number Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your Phone Number
          </label>
          <Input
            type="tel"
            placeholder="+91 7739489684"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={callStatus !== 'idle'}
            className="text-lg"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Include country code (e.g., +91 for India)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {callStatus === 'idle' && (
            <Button
              onClick={initiateCall}
              disabled={isProcessing || !phoneNumber}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Start Call
                </>
              )}
            </Button>
          )}
          {callStatus === 'active' && (
            <Button
              onClick={endCall}
              variant="destructive"
              className="flex-1"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Session
            </Button>
          )}
        </div>

        {/* Call SID for tracking */}
        {callSid && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
            Call ID: {callSid.substring(0, 8)}...
          </p>
        )}

        {/* Safety Notice */}
        <div className="mt-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ⚠️ <strong>Disclaimer:</strong> This is an AI assistant providing general guidance only. 
            Not a substitute for professional medical advice. For emergencies, call 102 or visit a hospital.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MediCallSarthi;
