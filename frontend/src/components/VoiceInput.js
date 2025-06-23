import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VoiceInput = ({ onTranscription, onError, className = "" }) => {
  const { token } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis for visual feedback
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Start audio level monitoring
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateAudioLevel = () => {
        if (isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = processRecording;
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(chunksRef.current, { 
        type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' 
      });
      
      // Convert to WAV for better compatibility
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      
      const response = await axios.post(`${API}/ai/voice-to-text`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const result = response.data;
      
      if (result.transcribed_text) {
        onTranscription?.({
          text: result.transcribed_text,
          emotionalState: result.emotional_state,
          learningStyle: result.learning_style,
          confidence: result.confidence_score
        });
      } else if (result.error) {
        onError?.(result.error);
      }
      
    } catch (error) {
      console.error('Error processing recording:', error);
      onError?.('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonColor = () => {
    if (isProcessing) return 'bg-yellow-500';
    if (isRecording) return 'bg-red-500 animate-pulse';
    return 'bg-blue-500 hover:bg-blue-600';
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Stop Recording';
    return 'Start Voice Input';
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Voice Input Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          relative px-6 py-3 rounded-full text-white font-medium
          transition-all duration-200 transform hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getButtonColor()}
        `}
      >
        <div className="flex items-center space-x-2">
          {isRecording ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : isProcessing ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
          <span>{getButtonText()}</span>
        </div>
      </button>

      {/* Audio Level Indicator */}
      {isRecording && (
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-100"
            style={{ width: `${Math.min(100, (audioLevel / 128) * 100)}%` }}
          />
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Recording... Click stop when finished</span>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        Click to start speaking your question or comment. 
        The AI will analyze your voice and adapt its response accordingly.
      </div>
    </div>
  );
};

export default VoiceInput;