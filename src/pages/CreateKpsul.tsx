import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native'; // Import de react-navigation
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Image as ImageIcon, Mic, Save, X, Settings } from 'lucide-react-native';
import AudioWaveform from '../components/AudioWaveform';
import AccountMenu from '../components/AccountMenu';
import KpsulSettings from '../components/KpsulSettings';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MAX_CONTENT_LENGTH = 5000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Configuration de l'enregistrement audio
const AUDIO_CONFIG = {
  sampleRate: 48000,
  numberOfChannels: 1,
  bitDepth: 16
};

function CreateKpsul() {
  const { t } = useTranslation();
  const navigation = useNavigation(); // Utilisation de useNavigation ici
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [releaseDate, setReleaseDate] = useState<Date | null>(() => {
    const now = new Date();
    const defaultDate = new Date(now);
    defaultDate.setFullYear(2004);
    defaultDate.setHours(12, 0, 0, 0);
    return defaultDate;
  });
  const [randomRule, setRandomRule] = useState<string | undefined>();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const audioStream = useRef<MediaStream | null>(null);

  // Empêcher la rotation sur mobile
  useEffect(() => {
    if ('screen' in window && 'orientation' in window.screen) {
      window.screen.orientation.lock('portrait').catch(() => {
        // Ignorer les erreurs si le verrouillage n'est pas supporté
      });
    }
  }, []);

  const isContentValid = content.length > 0;
  const isContentTooLong = content.length > MAX_CONTENT_LENGTH;

  const handleReleaseDateChange = (date: Date | null, rule?: string) => {
    setReleaseDate(date);
    setRandomRule(rule);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CONTENT_LENGTH) {
      setContent(newContent);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert(t('error.imageFormat', { formats: '.jpg, .png, .webp' }));
        return;
      }

      // Vérifier la taille
      if (file.size > 3 * 1024 * 1024) {
        alert(t('error.imageSize'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: AUDIO_CONFIG.sampleRate,
          channelCount: AUDIO_CONFIG.numberOfChannels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioStream.current = stream;
      audioContext.current = new AudioContext({
        sampleRate: AUDIO_CONFIG.sampleRate,
        latencyHint: 'interactive'
      });

      // Créer un MediaRecorder avec une meilleure qualité
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: AUDIO_CONFIG.sampleRate * AUDIO_CONFIG.bitDepth
      });

      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        if (!user) return;
        
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const now = new Date();
        
        // Format: userId/YYYYMMDD_HHMMSS.webm
        const fileName = `${user.id}/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.webm`;
        
        try {
          // Uploader le fichier audio dans le bucket "audio"
          const { data, error } = await supabase.storage
            .from('audio')
            .upload(fileName, audioBlob);

          if (error) throw error;

          // Obtenir l'URL publique du fichier
          const { data: { publicUrl } } = supabase.storage
            .from('audio')
            .getPublicUrl(fileName);

          setAudioURL(publicUrl);
        } catch (error) {
          console.error('Error uploading audio:', error);
          alert('Failed to upload audio file');
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(t('error.microphone'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);

      // Arrêter et nettoyer le flux audio
      if (audioStream.current) {
        audioStream.current.getTracks().forEach(track => track.stop());
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    }
  };

  const deleteAudio = async () => {
    if (!audioURL) return;

    try {
      // Extraire le nom du fichier de l'URL
      const fileName = audioURL.split('/').pop();
      if (!fileName) return;

      // Supprimer le fichier du stockage
      const { error } = await supabase.storage
        .from('audio')
        .remove([`${user?.id}/${fileName}`]);

      if (error) throw error;

      setAudioURL(null);
    } catch (error) {
      console.error('Error deleting audio:', error);
      alert('Failed to delete audio file');
    }
  };

  const handleSave = async () => {
    if (!user || !isContentValid) return;

    try {
      let finalReleaseDate: Date | null = null;
      
      if (releaseDate) {
        finalReleaseDate = new Date(releaseDate);
      } else {
        // Si pas de date définie, on utilise le mode annuel par défaut (2004)
        const now = new Date();
        finalReleaseDate = new Date(now);
        finalReleaseDate.setFullYear(2004);
      }

      if (finalReleaseDate) {
        finalReleaseDate.setHours(12, 0, 0, 0);
      }

      const finalTitle = title.trim() || new Date().toLocaleString();

      const kpsulData = {
        user_id: user.id,
        title: finalTitle,
        content,
        created_at: new Date().toISOString(),
        release_date: finalReleaseDate?.toISOString() || null,
        random_rule: randomRule,
        image_url: imagePreview,
        audio_url: audioURL
      };

      const { error } = await supabase
        .from('kpsuls')
        .insert([kpsulData]);

      if (error) throw error;

      // Utilisation de la navigation react-navigation
      navigation.goBack(); // Remplace navigate('/')
      
    } catch (error) {
      console.error('Error saving kpsul:', error);
      alert('Failed to save kpsul');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-white/10 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigation.goBack()} // Remplace navigate('/')
            className="flex items-center space-x-2 text-white opacity-40 hover:opacity-100 transition-opacity select-none"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-light hidden sm:inline">{t('nav.back')}</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <KpsulSettings onReleaseDateChange={handleReleaseDateChange} />
            <button
              onClick={handleSave}
              disabled={!isContentValid}
              className={`hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg 
                       text-white transition-all select-none ${
                         isContentValid
                           ? 'bg-white/10 hover:bg-white/20'
                           : 'bg-white/5 cursor-not-allowed'
                       }`}
            >
              <Save className="w-5 h-5" />
              <span className="font-light">{t('nav.save')}</span>
            </button>

            {/* Ajout du bouton settings */}
            <button
              onClick={() => {}}
              className="sm:hidden flex items-center space-x-2 p-2 rounded-lg bg-white/[0.05] border border-white/10 cursor-pointer hover:bg-white/[0.1] transition-all"
            >
              <Settings className="w-5 h-5 text-white opacity-70" />
            </button>
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-24 sm:pb-6 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="sm:flex sm:gap-8">
            <div className="flex-1 mb-6 sm:mb-0">
              <input
                type="text"
                placeholder={t('create.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-xl sm:text-2xl font-light 
                         text-white/90 placeholder-white/50 outline-none border-b 
                         border-white/10 pb-2 mb-6 focus:border-white/30 transition-colors"
              />
              <div className="relative">
                <textarea
                  placeholder={t('create.content')}
                  value={content}
                  onChange={handleContentChange}
                  className={`w-full h-[calc(100vh-280px)] sm:h-[calc(100vh-240px)] bg-white/[0.02] 
                           rounded-xl p-4 text-white/90 placeholder-white/50 outline-none 
                           border transition-colors resize-none ${
                             isContentTooLong
                               ? 'border-red-500/50'
                               : 'border-white/10 focus:border-white/30'
                           }`}
                />
                <div className={`absolute bottom-4 right-4 text-sm select-none ${
                  isContentTooLong ? 'text-red-500' : 'text-white/50'
                }`}>
                  {content.length}/{MAX_CONTENT_LENGTH}
                </div>
              </div>
            </div>

            <div className="sm:w-72">
              <div className="mb-6">
                <label className="block mb-2 text-sm font-light text-white/70 select-none">{t('create.photo')}</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-input"
                  />
                  <label
                    htmlFor="image-input"
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg 
                             bg-white/[0.02] border border-white/10 cursor-pointer
                             hover:bg-white/[0.05] hover:border-white/20 
                             transition-all w-full text-white select-none"
                  >
                    <ImageIcon className="w-5 h-5 opacity-70" />
                    <span className="text-sm font-light">{t('create.addPhoto')}</span>
                  </label>
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/50
                                 hover:bg-black/70 transition-colors text-white select-none"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-light text-white/70 select-none">{t('create.voice')}</label>
                <div className="space-y-2">
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-white
                             border transition-all w-full select-none
                             ${isRecording 
                               ? 'bg-red-500/20 border-red-500/50 animate-pulse' 
                               : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                             }`}
                  >
                    <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500' : 'opacity-70'}`} />
                    <span className="text-sm font-light">
                      {isRecording ? t('create.recording') : t('create.holdRecord')}
                    </span>
                  </button>
                  {audioURL && (
                    <div className="relative">
                      <AudioWaveform audioUrl={audioURL} />
                      <button
                        onClick={deleteAudio}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50
                                 hover:bg-black/70 transition-colors text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div className="p-4">
          <button
            onClick={handleSave}
            disabled={!isContentValid}
            className={`w-full px-4 py-2 rounded-lg text-white transition-all select-none ${
              isContentValid
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 cursor-not-allowed'
            }`}
          >
            {t('nav.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateKpsul;
