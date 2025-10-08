import React, { useState } from 'react';
import { Play, Scissors, Grid, Type, Video, Upload } from 'lucide-react';

type FormDataType = {
  position: number | string;
  video_name: string;
  Start: number | string;
  End: number | string;
  crop_top: number | string;
  crop_bottom: number | string;
  crop_left: number | string;
  crop_right: number | string;
  mask_x: string | number;
  mask_y: string | number;
  mask_w: string | number;
  mask_h: string | number;
  Text: string;
  Profile: string;
  Transition: string;
  FinalName: string;
};

const InteractiveVideoGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'crop' | 'mask' | 'text'>('basics');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    position: 1,
    video_name: 'product_demo.mp4',
    Start: 5,
    End: 23.5,
    crop_top: 0,
    crop_bottom: 0,
    crop_left: 0,
    crop_right: 0,
    mask_x: '',
    mask_y: '',
    mask_w: '',
    mask_h: '',
    Text: '',
    Profile: '1080p',
    Transition: 'crossfade 300ms',
    FinalName: 'demo-features-v1.mp4'
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleChange = (field: keyof FormDataType, value: any) => {
    const newData = {...formData, [field]: value};
    setFormData(newData);
    validateForm(newData);
  };

  const validateForm = (data: FormDataType) => {
    const errs: string[] = [];
    if (!data.video_name) errs.push('Missing video_name');
    if (parseFloat(String(data.End)) <= parseFloat(String(data.Start))) errs.push('End time must be after Start time');
    
    const maskFields = [data.mask_x, data.mask_y, data.mask_w, data.mask_h];
    const maskFilled = maskFields.filter(f => String(f) !== '').length;
    if (maskFilled > 0 && maskFilled < 4) errs.push('Mask requires all 4 fields or leave all blank');
    
    if (data.FinalName && String(data.FinalName).includes(' ')) errs.push('FinalName cannot contain spaces');
    
    setErrors(errs);
  };

  const duration = (parseFloat(String(formData.End)) - parseFloat(String(formData.Start))).toFixed(1);
  const hasCrop = Number(formData.crop_top) || Number(formData.crop_bottom) || Number(formData.crop_left) || Number(formData.crop_right);
  const hasMask = formData.mask_x !== '' && formData.mask_y !== '' && formData.mask_w !== '' && formData.mask_h !== '';
  
  const textStr = String(formData.Text || '').trim();
  const hasText = textStr !== '';
  let textPosition: 'top' | 'bottom' | 'center' | 'mask' = 'bottom';
  let displayText: string = textStr;
  
  if (textStr.startsWith('@top ')) {
    textPosition = 'top';
    displayText = textStr.substring(5);
  } else if (textStr.startsWith('@bottom ')) {
    textPosition = 'bottom';
    displayText = textStr.substring(8);
  } else if (textStr.startsWith('@center ')) {
    textPosition = 'center';
    displayText = textStr.substring(8);
  } else if (textStr.startsWith('@mask ')) {
    textPosition = 'mask';
    displayText = textStr.substring(6);
  }

  const vw = 320, vh = 180;
  const cL = parseInt(String(formData.crop_left || 0)) * (vw / 1920);
  const cR = parseInt(String(formData.crop_right || 0)) * (vw / 1920);
  const cT = parseInt(String(formData.crop_top || 0)) * (vh / 1080);
  const cB = parseInt(String(formData.crop_bottom || 0)) * (vh / 1080);
  
  const visW = vw - cL - cR;
  const visH = vh - cT - cB;

  const mX = parseInt(String(formData.mask_x || 0)) * (visW / 1920);
  const mY = parseInt(String(formData.mask_y || 0)) * (visH / 1080);
  const mW = parseInt(String(formData.mask_w || 0)) * (visW / 1920);
  const mH = parseInt(String(formData.mask_h || 0)) * (visH / 1080);

  const tabs = [
    {id: 'basics', label: 'Basics', icon: Play},
    {id: 'crop', label: 'Crop', icon: Scissors},
    {id: 'mask', label: 'Mask', icon: Grid},
    {id: 'text', label: 'Text & Export', icon: Type}
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Interactive Video Sheet Guide
          </h1>
          <p className="text-slate-300">Upload video • Configure settings • See real-time preview</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto justify-center">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl' : 'bg-slate-800 border border-slate-600'
              }`}>
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-600">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Configure Your Clip
            </h2>
            
            {activeTab === 'basics' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-300 flex items-center gap-2">
                    <Upload size={16} />
                    Upload Video (Optional Preview)
                  </label>
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                  />
                  <p className="text-xs text-slate-400 mt-1">Upload to preview crop, mask & text on real video</p>
                  {videoFile && (
                    <p className="text-xs text-green-400 mt-1">✓ Loaded: {videoFile.name}</p>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-3 mt-4">
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Position</label>
                  <input type="number" value={formData.position} onChange={(e) => handleChange('position', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Video Name</label>
                  <input type="text" value={formData.video_name} onChange={(e) => handleChange('video_name', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-purple-300">Start (s)</label>
                    <input type="number" step="0.1" value={formData.Start} onChange={(e) => handleChange('Start', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-purple-300">End (s)</label>
                    <input type="number" step="0.1" value={formData.End} onChange={(e) => handleChange('End', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>
                <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3">
                  <p className="text-sm font-bold">Duration: <span className="text-lg text-purple-300">{duration}s</span></p>
                </div>
              </div>
            )}

            {activeTab === 'crop' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded">Remove pixels from edges</p>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Crop Top</label>
                  <input type="number" value={formData.crop_top} onChange={(e) => handleChange('crop_top', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Crop Bottom</label>
                  <input type="number" value={formData.crop_bottom} onChange={(e) => handleChange('crop_bottom', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Crop Left</label>
                  <input type="number" value={formData.crop_left} onChange={(e) => handleChange('crop_left', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Crop Right</label>
                  <input type="number" value={formData.crop_right} onChange={(e) => handleChange('crop_right', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'mask' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded">Blur area for privacy</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-purple-300">X</label>
                    <input type="number" value={String(formData.mask_x)} onChange={(e) => handleChange('mask_x', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-purple-300">Y</label>
                    <input type="number" value={String(formData.mask_y)} onChange={(e) => handleChange('mask_y', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-purple-300">Width</label>
                    <input type="number" value={String(formData.mask_w)} onChange={(e) => handleChange('mask_w', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-purple-300">Height</label>
                    <input type="number" value={String(formData.mask_h)} onChange={(e) => handleChange('mask_h', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Text</label>
                  <textarea value={formData.Text} onChange={(e) => handleChange('Text', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none h-20"
                    placeholder="@bottom Your text here..." />
                  <p className="text-xs text-slate-400 mt-1">Use @top, @bottom, @center, or @mask prefix</p>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 text-xs text-blue-200">
                  <p className="font-bold mb-1">Text Position Examples:</p>
                  <p>• <code className="bg-slate-900 px-1 rounded">@top Your text...</code></p>
                  <p>• <code className="bg-slate-900 px-1 rounded">@bottom Your text...</code></p>
                  <p>• <code className="bg-slate-900 px-1 rounded">@center Your text...</code></p>
                  <p>• <code className="bg-slate-900 px-1 rounded">@mask Your text...</code></p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Profile</label>
                  <select value={formData.Profile} onChange={(e) => handleChange('Profile', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none">
                    <option value="1080p">1080p</option>
                    <option value="Vertical 9:16">Vertical 9:16</option>
                    <option value="Square 1:1">Square 1:1</option>
                    <option value="720p">720p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Transition</label>
                  <select value={formData.Transition} onChange={(e) => handleChange('Transition', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none">
                    <option value="none">None</option>
                    <option value="crossfade 300ms">Crossfade 300ms</option>
                    <option value="fade">Fade</option>
                    <option value="wipeleft">Wipe Left</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-300">Final Name</label>
                  <input type="text" value={formData.FinalName} onChange={(e) => handleChange('FinalName', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Live Preview</h3>
              
              <div className="bg-slate-900/80 rounded-lg p-4 mb-4">
                <div style={{width: vw, height: vh, margin: '0 auto', position: 'relative', backgroundColor: '#1e293b', border: '3px solid #64748b', borderRadius: '8px', overflow: 'hidden'}}>
                  
                  {videoUrl ? (
                    <video 
                      src={videoUrl}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      controls
                      muted
                      loop
                    />
                  ) : (
                    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '600', flexDirection: 'column', gap: '6px', padding: '10px', textAlign: 'center'}}>
                      <Upload size={24} color="#64748b" />
                      <span>No Video Uploaded</span>
                      <span style={{fontSize: '9px', color: '#64748b'}}>Go to Basics tab → Upload video for preview</span>
                    </div>
                  )}

                  {!!hasCrop && (
                    <>
                      {cT > 0 && <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: cT, background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.5), rgba(239,68,68,0.5) 10px, rgba(220,38,38,0.5) 10px, rgba(220,38,38,0.5) 20px)', border: '1px dashed #ef4444', pointerEvents: 'none'}} />}
                      {cB > 0 && <div style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: cB, background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.5), rgba(239,68,68,0.5) 10px, rgba(220,38,38,0.5) 10px, rgba(220,38,38,0.5) 20px)', border: '1px dashed #ef4444', pointerEvents: 'none'}} />}
                      {cL > 0 && <div style={{position: 'absolute', top: 0, left: 0, width: cL, height: '100%', background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.5), rgba(239,68,68,0.5) 10px, rgba(220,38,38,0.5) 10px, rgba(220,38,38,0.5) 20px)', border: '1px dashed #ef4444', pointerEvents: 'none'}} />}
                      {cR > 0 && <div style={{position: 'absolute', top: 0, right: 0, width: cR, height: '100%', background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.5), rgba(239,68,68,0.5) 10px, rgba(220,38,38,0.5) 10px, rgba(220,38,38,0.5) 20px)', border: '1px dashed #ef4444', pointerEvents: 'none'}} />}
                    </>
                  )}

                  {hasMask && mW > 0 && mH > 0 && (
                    <div style={{position: 'absolute', left: cL + mX, top: cT + mY, width: mW, height: mH, backgroundColor: 'rgba(59,130,246,0.4)', border: '2px solid #3b82f6', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 'bold', pointerEvents: 'none'}}>
                      BLURRED
                    </div>
                  )}

                  {hasText && (
                    <div style={{
                      position: 'absolute',
                      ...(textPosition === 'top' && { 
                        left: cL + 10, 
                        top: cT + 10, 
                        right: cR + 10 
                      }),
                      ...(textPosition === 'bottom' && { 
                        left: cL + 10, 
                        bottom: cB + 10, 
                        right: cR + 10 
                      }),
                      ...(textPosition === 'center' && { 
                        left: cL + 10, 
                        top: '50%', 
                        right: cR + 10, 
                        transform: 'translateY(-50%)' 
                      }),
                      ...(textPosition === 'mask' && hasMask && { 
                        left: cL + mX, 
                        top: cT + mY, 
                        width: mW, 
                        height: mH,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }),
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: '500',
                      pointerEvents: 'none'
                    }}>
                      {displayText}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 text-xs justify-center flex-wrap">
                <span className="flex items-center gap-1 bg-red-900/40 text-red-300 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-red-500 rounded"></div>Crop
                </span>
                <span className="flex items-center gap-1 bg-blue-900/40 text-blue-300 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>Blur
                </span>
                <span className="flex items-center gap-1 bg-slate-800 text-slate-200 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-slate-900 rounded border border-white"></div>Text
                </span>
              </div>
            </div>

            <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">Status</h3>
              
              {errors.length > 0 ? (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                  <p className="font-bold text-red-300 mb-2">❌ Errors</p>
                  <ul className="text-xs text-red-200 space-y-1">
                    {errors.map((err, i) => <li key={i}>• {err}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4">
                  <p className="font-bold text-green-300">✅ Valid</p>
                </div>
              )}

              <div className="space-y-2 text-sm bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-bold text-purple-300">{duration}s</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Crop:</span>
                  <span className={hasCrop ? 'text-red-400' : 'text-slate-500'}>{hasCrop ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Mask:</span>
                  <span className={hasMask ? 'text-blue-400' : 'text-slate-500'}>{hasMask ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Text:</span>
                  <span className={hasText ? 'text-yellow-400' : 'text-slate-500'}>{hasText ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-600/90 backdrop-blur rounded-2xl p-5 border border-purple-400">
              <div className="flex items-center gap-2 mb-3">
                <Video size={24} />
                <h3 className="text-xl font-bold">Copy to Sheet</h3>
              </div>
              <div className="bg-slate-900/70 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                <div>position: {String(formData.position)}</div>
                <div>video_name: {formData.video_name}</div>
                <div>Start: {String(formData.Start)}</div>
                <div>End: {String(formData.End)}</div>
                <div>clip_length: {duration}</div>
                <div>Profile: {formData.Profile}</div>
                <div>Transition: {formData.Transition}</div>
                <div>Text: {formData.Text || '(empty)'}</div>
                <div>crop_top: {String(formData.crop_top || 0)}</div>
                <div>crop_bottom: {String(formData.crop_bottom || 0)}</div>
                <div>crop_left: {String(formData.crop_left || 0)}</div>
                <div>crop_right: {String(formData.crop_right || 0)}</div>
                <div>mask_x: {String(formData.mask_x || '(empty)')}</div>
                <div>mask_y: {String(formData.mask_y || '(empty)')}</div>
                <div>mask_w: {String(formData.mask_w || '(empty)')}</div>
                <div>mask_h: {String(formData.mask_h || '(empty)')}</div>
                <div>FinalName: {formData.FinalName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => <InteractiveVideoGuide />;

export default App;
