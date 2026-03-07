import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Pill,
  FileText,
  AlertTriangle,
  Scan,
  Sparkles,
  Brain,
  SwitchCamera
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  analyzePrescriptionFile, 
  analyzePrescriptionFromCamera,
  VisionResponse 
} from '@/services/visionService';
import { getConfidenceBadgeColor } from '@/services/prescriptionAIService';

interface PrescriptionScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionScanner = ({ isOpen, onClose }: PrescriptionScannerProps) => {
  const [mode, setMode] = useState<'choose' | 'camera' | 'upload'>('choose');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [result, setResult] = useState<VisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate progress for better UX
  useEffect(() => {
    if (isScanning) {
      setScanProgress(0);
      setScanStage('Preparing image...');
      
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev < 30) {
            setScanStage('Extracting text...');
            return prev + 2;
          } else if (prev < 60) {
            setScanStage('Analyzing with AI...');
            return prev + 1;
          } else if (prev < 90) {
            setScanStage('Validating medicines...');
            return prev + 0.5;
          }
          return prev;
        });
      }, 100);
      
      return () => clearInterval(progressInterval);
    }
  }, [isScanning]);

  // Enumerate available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        console.log('📹 Available cameras:', cameras.length);
      } catch (err) {
        console.error('Failed to enumerate cameras:', err);
      }
    };
    getCameras();
  }, []);

  // Start camera
  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    try {
      console.log('📹 Starting camera with facing mode:', facing);
      
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      };

      console.log('📋 Requesting camera with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('📹 Media stream obtained:', mediaStream.getTracks());
      console.log('📹 Video tracks active:', mediaStream.getVideoTracks().map(t => ({
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState
      })));
      
      setStream(mediaStream);
      setFacingMode(facing);
      
      if (videoRef.current) {
        console.log('🎬 Setting srcObject...');
        videoRef.current.srcObject = mediaStream;
        
        // Explicitly set attributes
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Wait for metadata and try to play
        const playPromise = new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video ref lost'));
            return;
          }
          
          const video = videoRef.current;
          
          video.onloadedmetadata = async () => {
            console.log('📺 Metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            try {
              await video.play();
              console.log('✅ Video playing successfully');
              resolve();
            } catch (playErr) {
              console.error('❌ Play error:', playErr);
              // Retry after short delay
              setTimeout(async () => {
                try {
                  await video.play();
                  console.log('✅ Video playing on retry');
                  resolve();
                } catch (retryErr) {
                  console.error('❌ Retry failed:', retryErr);
                  reject(retryErr);
                }
              }, 100);
            }
          };
          
          video.onerror = (err) => {
            console.error('❌ Video error:', err);
            reject(err);
          };
          
          // Timeout after 5 seconds
          setTimeout(() => {
            if (video.paused) {
              console.warn('⚠️ Video still paused after 5s, force playing...');
              video.play().catch(err => console.error('Force play failed:', err));
            }
            resolve();
          }, 5000);
        });
        
        await playPromise;
      }
      
      setMode('camera');
      setError(null);
      
      toast.success(`Camera activated: ${facing === 'user' ? 'Front' : 'Back'} camera`);
    } catch (err: any) {
      console.error('❌ Camera error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        constraint: err.constraint
      });
      
      let errorMsg = 'Failed to access camera. ';
      if (err.name === 'NotAllowedError') {
        errorMsg += 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMsg += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg += 'Camera is already in use.';
      } else {
        errorMsg += err.message || 'Please check permissions and try again.';
      }
      
      setError(errorMsg);
      toast.error('Camera access failed', {
        description: errorMsg
      });
    }
  };

  // Toggle camera (front/back)
  const toggleCamera = () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    console.log('🔄 Switching camera from', facingMode, 'to', newFacingMode);
    toast.info(`Switching to ${newFacingMode === 'user' ? 'front' : 'back'} camera...`);
    startCamera(newFacingMode);
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode('choose');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  // Capture from camera
  const captureImage = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setError(null);
    setScanProgress(0);
    setScanStage('Capturing image...');

    try {
      const analysisResult = await analyzePrescriptionFromCamera(videoRef.current);
      setScanProgress(100);
      setScanStage('Complete!');
      setResult(analysisResult);
      stopCamera();
      
      toast.success('Prescription scanned successfully!', {
        description: `${analysisResult.aiAnalysis?.medicines.length || 0} medicines detected`,
      });
    } catch (err) {
      console.error('❌ Scan error:', err);
      setError('Failed to analyze prescription. Please try again.');
      toast.error('Scan failed', {
        description: 'Please ensure the image is clear and well-lit'
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Upload file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setIsScanning(true);
    setError(null);
    setMode('upload');
    setScanProgress(0);
    setScanStage('Reading image...');

    try {
      const analysisResult = await analyzePrescriptionFile(file);
      setScanProgress(100);
      setScanStage('Complete!');
      setResult(analysisResult);
      
      toast.success('Prescription analyzed successfully!', {
        description: `${analysisResult.aiAnalysis?.medicines.length || 0} medicines detected`,
      });
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError('Failed to analyze prescription. Please try again.');
      toast.error('Analysis failed', {
        description: 'Please ensure the image is clear and readable'
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Reset to choose mode
  const resetScanner = () => {
    setMode('choose');
    setResult(null);
    setError(null);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-slate-950 rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-white/20 dark:border-cyan-500/30 max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-6 rounded-t-3xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Scan className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                    Prescription Scanner
                  </h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    Powered by Google Vision AI
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-10 w-10 rounded-full hover:bg-red-500/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Choose Mode */}
              {mode === 'choose' && !result && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <p className="text-center text-[rgb(var(--text-secondary))] mb-6">
                    Choose how you want to scan your prescription
                  </p>

                  {/* Camera Info */}
                  {availableCameras.length > 1 && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-500/30 rounded-xl">
                      <p className="text-sm text-green-700 dark:text-green-400 text-center">
                        ✨ {availableCameras.length} cameras detected - You can switch between them!
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Camera Option */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={startCamera}
                        className="p-6 cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-cyan-400 transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className="text-center space-y-4">
                          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-[rgb(var(--text-primary))]">
                              Use Camera
                            </h4>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                              Take a photo of prescription
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Upload Option */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={() => fileInputRef.current?.click()}
                        className="p-6 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400 transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className="text-center space-y-4">
                          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-[rgb(var(--text-primary))]">
                              Upload Image
                            </h4>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                              Choose from gallery
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </motion.div>
              )}

              {/* Camera Mode */}
              {mode === 'camera' && !result && (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                    />
                    
                    {/* Camera info badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-black/70 text-white border-white/20">
                        {facingMode === 'environment' ? '📷 Back Camera' : '🤳 Front Camera'}
                      </Badge>
                    </div>

                    {/* Toggle Camera Button - Always show if not scanning */}
                    {!isScanning && (
                      <Button
                        onClick={toggleCamera}
                        className="absolute top-4 right-4 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg border-0 px-4 py-2 h-auto"
                        size="sm"
                      >
                        <SwitchCamera className="h-5 w-5 mr-2" />
                        Switch to {facingMode === 'environment' ? 'Front' : 'Back'}
                      </Button>
                    )}

                    {isScanning && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="text-center">
                          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-3" />
                          <p className="text-white font-semibold">Analyzing prescription...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Camera Info */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-400 text-center">
                      💡 {availableCameras.length > 1 
                        ? 'Tap the switch button to toggle between cameras' 
                        : 'Position prescription in frame and capture'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="flex-1"
                      disabled={isScanning}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={captureImage}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Capture & Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Upload/Scanning Mode */}
              {mode === 'upload' && isScanning && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center"
                >
                  <Loader2 className="h-16 w-16 text-cyan-500 animate-spin mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    {scanStage}
                  </h4>
                  <p className="text-[rgb(var(--text-secondary))] mb-4">
                    Please wait while we process your image...
                  </p>
                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-2">
                      {Math.round(scanProgress)}% complete
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Success Header */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h4 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                      Scan Complete!
                    </h4>
                    <p className="text-[rgb(var(--text-secondary))]">
                      OCR Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>

                  {/* AI Analysis Results - ENHANCED */}
                  {result.aiAnalysis && (
                    <Card className="p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 border-2 border-purple-300 dark:border-purple-500/40 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg text-[rgb(var(--text-primary))] flex items-center gap-2">
                            AI-Powered Analysis
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                          </h5>
                          <p className="text-xs text-[rgb(var(--text-secondary))]">
                            Overall Confidence: {result.aiAnalysis.overall_confidence}%
                          </p>
                        </div>
                      </div>

                      {/* Medicines Detected by AI */}
                      {result.aiAnalysis.medicines.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {result.aiAnalysis.medicines.map((medicine, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Pill className="h-5 w-5 text-blue-500" />
                                  <span className="font-bold text-[rgb(var(--text-primary))]">
                                    {medicine.name}
                                  </span>
                                  {medicine.needsReview && (
                                    <Badge variant="destructive" className="text-xs">
                                      ⚠️ Review
                                    </Badge>
                                  )}
                                </div>
                                <Badge 
                                  className={`${getConfidenceBadgeColor(medicine.confidence)} text-white text-xs`}
                                >
                                  {medicine.confidence}%
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-[rgb(var(--text-secondary))] text-xs">Dosage:</span>
                                  <p className="font-medium text-[rgb(var(--text-primary))]">{medicine.dosage}</p>
                                </div>
                                <div>
                                  <span className="text-[rgb(var(--text-secondary))] text-xs">Frequency:</span>
                                  <p className="font-medium text-[rgb(var(--text-primary))]">{medicine.frequency}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-500/30 mb-4">
                          <p className="text-sm text-yellow-800 dark:text-yellow-400">
                            ⚠️ No medicines clearly identified. Please verify prescription manually.
                          </p>
                        </div>
                      )}

                      {/* AI Warnings */}
                      {result.aiAnalysis.warnings.length > 0 && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-semibold text-orange-800 dark:text-orange-400">
                              Important Notices
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {result.aiAnalysis.warnings.map((warning, index) => (
                              <li key={index} className="text-xs text-orange-700 dark:text-orange-300">
                                • {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Basic Medications (fallback if no AI analysis) */}
                  {!result.aiAnalysis && result.medications.length > 0 && (
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                        <h5 className="font-bold text-[rgb(var(--text-primary))]">Medications Detected</h5>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.medications.map((med, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Dosages */}
                  {!result.aiAnalysis && result.dosages.length > 0 && (
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h5 className="font-bold text-[rgb(var(--text-primary))]">Dosage Information</h5>
                      </div>
                      <ul className="space-y-1">
                        {result.dosages.map((dosage, index) => (
                          <li key={index} className="text-sm text-[rgb(var(--text-secondary))]">
                            • {dosage}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Warnings (basic - only if no AI analysis) */}
                  {!result.aiAnalysis && result.warnings.length > 0 && (
                    <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-200 dark:border-orange-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h5 className="font-bold text-[rgb(var(--text-primary))]">Warnings & Notes</h5>
                      </div>
                      <ul className="space-y-1">
                        {result.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-[rgb(var(--text-secondary))]">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Full Text */}
                  {result.text && (
                    <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200 dark:border-slate-700/20">
                      <h5 className="font-bold text-[rgb(var(--text-primary))] mb-2">Full Text</h5>
                      <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {result.text}
                      </p>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="flex-1"
                    >
                      Scan Another
                    </Button>
                    <Button
                      onClick={onClose}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Done
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
