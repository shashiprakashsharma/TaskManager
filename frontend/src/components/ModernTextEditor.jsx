import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Image, 
  Video, 
  Link, 
  Palette, 
  Save, 
  Trash2,
  Edit3,
  X,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';

const ModernTextEditor = ({ 
  initialContent = '', 
  onSave, 
  onDelete, 
  onCancel,
  isEditing = false 
}) => {
  const [content, setContent] = useState(initialContent);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const editorRef = useRef(null);

  // formatting state for active buttons
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [isBullet, setIsBullet] = useState(false);
  const [isNumbered, setIsNumbered] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#A52A2A', '#808080', '#008000', '#000080', '#FFD700'
  ];

  // Initialize content once and when initialContent changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || '';
    }
  }, [initialContent]);

  // Force LTR once on mount
  useEffect(() => {
    const forceLTR = () => {
      if (editorRef.current) {
        editorRef.current.style.direction = 'ltr';
        editorRef.current.style.textAlign = 'left';
        editorRef.current.style.unicodeBidi = 'normal';
        editorRef.current.style.writingMode = 'horizontal-tb';
        editorRef.current.setAttribute('dir', 'ltr');
      }
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.setAttribute('dir', 'ltr');
      document.documentElement.style.direction = 'ltr';
      document.body.style.direction = 'ltr';
    };
    forceLTR();
  }, []);

  const updateFormatState = () => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrike(document.queryCommandState('strikeThrough'));
      setIsBullet(document.queryCommandState('insertUnorderedList'));
      setIsNumbered(document.queryCommandState('insertOrderedList'));
    } catch {}
  };

  useEffect(() => {
    const handler = () => updateFormatState();
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'normal';
      editorRef.current.style.writingMode = 'horizontal-tb';
      editorRef.current.setAttribute('dir', 'ltr');
    }
    updateFormatState();
  };

  const handleKeyDown = () => {
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.setAttribute('dir', 'ltr');
    }
    try {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, selectedColor || '#000000');
    } catch {}
    setTimeout(updateFormatState, 0);
  };

  const applyBold = () => {
    try { document.execCommand('bold'); } catch {}
    if (editorRef.current) editorRef.current.focus();
    updateFormatState();
  };

  const applyItalic = () => {
    try { document.execCommand('italic'); } catch {}
    if (editorRef.current) editorRef.current.focus();
    updateFormatState();
  };

  const applyUnderline = () => {
    try { document.execCommand('underline'); } catch {}
    if (editorRef.current) editorRef.current.focus();
    updateFormatState();
  };

  const applyStrike = () => {
    try { document.execCommand('strikeThrough'); } catch {}
    if (editorRef.current) editorRef.current.focus();
    updateFormatState();
  };

  const applyBullet = () => {
    try { document.execCommand('insertUnorderedList'); } catch {}
    if (editorRef.current) editorRef.current.focus();
    updateFormatState();
  };

  const applyNumbered = () => {
    try { document.execCommand('insertOrderedList'); } catch {}
    if (editorRef.current) editorRef.current.focus();
    updateFormatState();
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = `<img src="${e.target.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
          try { document.execCommand('insertHTML', false, img); } catch {}
          if (editorRef.current) editorRef.current.focus();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const insertVideo = () => {
    const videoUrl = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (videoUrl) {
      const videoEmbed = `
        <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
          <iframe 
            src="${videoUrl}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      `;
      try { document.execCommand('insertHTML', false, videoEmbed); } catch {}
      if (editorRef.current) editorRef.current.focus();
    }
  };

  const insertLink = () => {
    setShowLinkDialog(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl && linkText) {
      const link = `<a href="${linkUrl}" target="_blank" style="color: ${selectedColor}; text-decoration: underline;">${linkText}</a>`;
      try { document.execCommand('insertHTML', false, link); } catch {}
      if (editorRef.current) editorRef.current.focus();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const applyColor = (color) => {
    setSelectedColor(color);
    setShowColorPicker(false);
    try {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, color);
    } catch {}
    if (editorRef.current) editorRef.current.focus();
  };

  const handleSave = () => {
    const htmlContent = editorRef.current ? editorRef.current.innerHTML : content;
    onSave(htmlContent);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-purple-100">
        {/* Modern Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Task Note</h1>
              <p className="text-sm text-gray-600">Source: .env - TASKFLOW</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-3 bg-white hover:bg-purple-50 rounded-xl transition-all duration-200 shadow-sm border border-purple-200"
              title="Text Color"
            >
              <Palette className="w-5 h-5 text-purple-600" />
            </button>
            <button className="p-3 bg-white hover:bg-purple-50 rounded-xl transition-all duration-200 shadow-sm border border-purple-200" title="More Options">
              <span className="text-lg text-gray-600">⋯</span>
            </button>
            <button className="p-3 bg-white hover:bg-purple-50 rounded-xl transition-all duration-200 shadow-sm border border-purple-200" title="Open in New Window">
              <Share2 className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>

        {/* Modern Editor */}
        <div className="p-6">
          <div
            ref={editorRef}
            contentEditable
            dir="ltr"
            className="w-full min-h-[500px] p-6 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
            style={{ 
              minHeight: '500px',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal',
              writingMode: 'horizontal-tb',
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: '16px',
              lineHeight: '1.6',
              background: 'linear-gradient(135deg, #fafafa 0%, #f8f9ff 100%)'
            }}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Modern Toolbar */}
        <div className="flex items-center justify-between p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 rounded-b-2xl">
          <div className="flex items-center gap-2">
            {/* Text Formatting */}
            <button
              onClick={applyBold}
              className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${isBold ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 border-purple-200'}`}
              title="Bold"
            >
              <Bold className={`w-5 h-5 ${isBold ? 'text-white' : 'text-purple-600'}`} />
            </button>
            <button
              onClick={applyItalic}
              className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${isItalic ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 border-purple-200'}`}
              title="Italic"
            >
              <Italic className={`w-5 h-5 ${isItalic ? 'text-white' : 'text-purple-600'}`} />
            </button>
            <button
              onClick={applyUnderline}
              className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${isUnderline ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 border-purple-200'}`}
              title="Underline"
            >
              <Underline className={`w-5 h-5 ${isUnderline ? 'text-white' : 'text-purple-600'}`} />
            </button>
            <button
              onClick={applyStrike}
              className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${isStrike ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 border-purple-200'}`}
              title="Strikethrough"
            >
              <Strikethrough className={`w-5 h-5 ${isStrike ? 'text-white' : 'text-purple-600'}`} />
            </button>

            {/* Lists */}
            <button
              onClick={applyBullet}
              className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${isBullet ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 border-purple-200'}`}
              title="Bullet List"
            >
              <List className={`w-5 h-5 ${isBullet ? 'text-white' : 'text-purple-600'}`} />
            </button>
            <button
              onClick={applyNumbered}
              className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${isNumbered ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 border-purple-200'}`}
              title="Numbered List"
            >
              <ListOrdered className={`w-5 h-5 ${isNumbered ? 'text-white' : 'text-purple-600'}`} />
            </button>

            {/* Media */}
            <button
              onClick={insertImage}
              className="p-3 bg-white hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-sm border border-blue-200"
              title="Add Image"
            >
              <Image className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={insertVideo}
              className="p-3 bg-white hover:bg-green-50 rounded-xl transition-all duration-200 shadow-sm border border-green-200"
              title="Add Video"
            >
              <Video className="w-5 h-5 text-green-600" />
            </button>
            <button
              onClick={insertLink}
              className="p-3 bg-white hover:bg-orange-50 rounded-xl transition-all duration-200 shadow-sm border border-orange-200"
              title="Add Link"
            >
              <Link className="w-5 h-5 text-orange-600" />
            </button>

            {/* Screenshot Button */}
            <button
              onClick={insertImage}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Image className="w-5 h-5" />
              Screenshot
            </button>
          </div>

          {/* Modern Action Buttons */}
          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 shadow-sm border border-red-200"
                title="Delete Note"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onCancel}
              className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 flex items-center gap-2"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleSave}
              className="p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all duration-200 shadow-sm border border-green-200 flex items-center gap-2"
              title="Save Note"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
          </div>
        </div>

        {/* Modern Color Picker */}
        {showColorPicker && (
          <div className="absolute top-20 left-6 bg-white border-2 border-purple-200 rounded-xl shadow-2xl p-4 z-10">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Text Color</h3>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => applyColor(color)}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modern Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl border border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Add Link</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                    placeholder="Enter link text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTextEditor;


