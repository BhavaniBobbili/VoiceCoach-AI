import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Upload, Square } from "lucide-react";

interface RecordingSectionProps {
  onComplete: (audioBlob: Blob, duration: number) => void;
}

const RecordingSection = ({ onComplete }: RecordingSectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s >= 90) {
            handleStopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use the best available mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
        }
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: mimeType });
        // Calculate actual duration from recording time
        const actualDuration = recordingStartTimeRef.current 
          ? (Date.now() - recordingStartTimeRef.current) / 1000 
          : seconds;
        // Convert to WAV format
        convertToWav(audioBlob, actualDuration);
        stream.getTracks().forEach(track => track.stop());
        recordingStartTimeRef.current = null;
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setSeconds(0);
      recordingStartTimeRef.current = Date.now();
    } catch (error) {
      // Error handling is done silently - user can still upload files
      setIsRecording(false);
      recordingStartTimeRef.current = null;
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const convertToWav = async (audioBlob: Blob, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const wav = audioBufferToWav(audioBuffer);
      const wavBlob = new Blob([wav], { type: 'audio/wav' });
      onComplete(wavBlob, duration);
    } catch (error) {
      // Fallback: send the original blob if conversion fails
      onComplete(audioBlob, duration);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return arrayBuffer;
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Try to get duration from audio file
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    
    audio.onloadedmetadata = () => {
      const duration = audio.duration || 0;
      onComplete(file, duration);
      URL.revokeObjectURL(objectUrl);
    };
    
    audio.onerror = () => {
      // If we can't load metadata, send with 0 duration (backend will default to 60)
      onComplete(file, 0);
      URL.revokeObjectURL(objectUrl);
    };
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center mb-12 animate-fade-up">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
          Practice Makes <span className="text-gradient">Perfect</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Record your interview answer and receive instant AI-powered feedback
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 w-full max-w-md animate-scale-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex flex-col items-center gap-8">
          {/* Microphone Button */}
          <div className="relative">
            {/* Pulse rings when recording */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" style={{ animationDuration: "1.5s" }} />
                <div className="absolute inset-[-12px] rounded-full border-2 border-destructive/30 pulse-ring" />
                <div className="absolute inset-[-24px] rounded-full border border-destructive/20 pulse-ring" style={{ animationDelay: "0.5s" }} />
              </>
            )}
            
            <button
              onClick={handleToggleRecording}
              className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording
                  ? "bg-destructive recording-glow"
                  : "bg-gradient-to-br from-primary to-primary/80 glow-button"
              }`}
            >
              {isRecording ? (
                <Square className="w-10 h-10 md:w-12 md:h-12 text-foreground fill-foreground" />
              ) : (
                <Mic className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
              )}
            </button>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-semibold tracking-wider mb-2">
              {formatTime(seconds)}
            </div>
            <p className="text-muted-foreground text-sm">
              {isRecording ? "Recording in progress..." : "Click to start recording"}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-3 px-6 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 group cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/wav,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              Upload WAV file
            </span>
          </label>
        </div>
      </div>

      {/* Floating hint */}
      <p className="mt-8 text-muted-foreground/60 text-sm animate-float">
        Speak clearly for best results
      </p>
    </section>
  );
};

export default RecordingSection;
