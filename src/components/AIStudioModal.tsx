import React, { useState } from 'react';
import { Palette, X, Sparkles, Download, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { playTapSound, playCoinSound } from '../utils/audio';
import { speakText } from '../utils/speech';

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetCustomArt?: (url: string) => void;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({
  isOpen,
  onClose,
  onSetCustomArt,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Cool Nigerian tomboy hero with neon purple hair wearing cyber-danfo jacket and gold ear cuff'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const promptSuggestions = [
    'Purple-haired tomboy girl in neon jacket standing in Oshodi night market with yellow Danfo buses',
    'Afro-cyberpunk female warrior summoning purple thunderbolts on Third Mainland Bridge',
    'Cozy modern Lagos penthouse apartment overlooking Victoria Island marina at sunset',
    'Futuristic Nigerian Ekuke pet wearing glowing neon armor and cyber goggles',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setErrorMsg('');
    setIsGenerating(true);
    playTapSound();
    speakText(`Generating ${imageSize} resolution art with model...`);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        playCoinSound();
        speakText('Art generation complete!');
      } else {
        setErrorMsg(data.error || 'Image generation failed. Try another prompt.');
      }
    } catch {
      setErrorMsg('Image generation service is temporarily busy. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1526] border border-cyan-500/60 shadow-2xl p-6 text-slate-100 my-8 space-y-5">
        <button
          onClick={onClose}
          aria-label="Close AI Studio"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <span>AI Lagos Studio: Custom Art Generator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                gemini-3-pro-image-preview
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate 1K, 2K, or 4K resolution character skins, posters, and Lagos wallpapers!
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Art Prompt / Character Description
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            placeholder="Describe your Lagos character, vehicle or scenery..."
          />
        </div>

        {/* Suggested Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(s)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500 whitespace-nowrap transition"
            >
              Preset #{idx + 1}
            </button>
          ))}
        </div>

        {/* Resolution Affordance (1K, 2K, 4K) & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Image Resolution Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setImageSize(size);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                    imageSize === size
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['1:1', '16:9', '4:3', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setAspectRatio(ratio);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-semibold transition border ${
                    aspectRatio === ratio
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-xl shadow-cyan-950 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{isGenerating ? `Synthesizing ${imageSize} Art...` : `Generate High-Quality (${imageSize}) Image`}</span>
        </button>

        {/* Generated Image Result Display */}
        {generatedImageUrl && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-[300px] flex items-center justify-center bg-black">
              <img
                src={generatedImageUrl}
                alt="Generated Lagos Art"
                className="max-h-[300px] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Size: {imageSize} · Ratio: {aspectRatio}
              </span>
              <div className="flex gap-2">
                <a
                  href={generatedImageUrl}
                  download="mylag_custom_art.png"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                {onSetCustomArt && (
                  <button
                    onClick={() => {
                      playCoinSound();
                      onSetCustomArt(generatedImageUrl);
                      speakText('Custom art applied to your profile and apartment!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  >
                    Set as Avatar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
