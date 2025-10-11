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
  X
} from 'lucide-react';

const SimpleTextEditor = ({ 
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

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#A52A2A', '#808080', '#008000', '#000080', '#FFD700'
  ];

  // Force LTR direction on every render
  useEffect(() => {
    const forceLTR = () => {
      if (editorRef.current) {
        // Set all possible LTR properties
        editorRef.current.style.direction = 'ltr';
        editorRef.current.style.textAlign = 'left';
        editorRef.current.style.unicodeBidi = 'normal';
        editorRef.current.style.writingMode = 'horizontal-tb';
        editorRef.current.setAttribute('dir', 'ltr');
        
        // Force document direction
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.setAttribute('dir', 'ltr');
        document.documentElement.style.direction = 'ltr';
        document.body.style.direction = 'ltr';
      }
    };

    forceLTR();
    const interval = setInterval(forceLTR, 50);
    return () => clearInterval(interval);
  }, []);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    // Force LTR after command
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.setAttribute('dir', 'ltr');
    }
    editorRef.current.focus();
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
          const img = `<img src="${e.target.result}" alt="Uploaded image" style="max-width: 100%; height: auto; direction: ltr;" />`;
          document.execCommand('insertHTML', false, img);
          // Force LTR after insert
          if (editorRef.current) {
            editorRef.current.style.direction = 'ltr';
            editorRef.current.setAttribute('dir', 'ltr');
          }
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
        <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; direction: ltr;">
          <iframe 
            src="${videoUrl}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; direction: ltr;" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      `;
      document.execCommand('insertHTML', false, videoEmbed);
      // Force LTR after insert
      if (editorRef.current) {
        editorRef.current.style.direction = 'ltr';
        editorRef.current.setAttribute('dir', 'ltr');
      }
    }
  };

  const insertLink = () => {
    setShowLinkDialog(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl && linkText) {
      const link = `<a href="${linkUrl}" target="_blank" style="color: blue; text-decoration: underline; direction: ltr;">${linkText}</a>`;
      document.execCommand('insertHTML', false, link);
      // Force LTR after insert
      if (editorRef.current) {
        editorRef.current.style.direction = 'ltr';
        editorRef.current.setAttribute('dir', 'ltr');
      }
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const applyColor = (color) => {
    document.execCommand('foreColor', false, color);
    setSelectedColor(color);
    setShowColorPicker(false);
    // Force LTR after color
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.setAttribute('dir', 'ltr');
    }
  };

  const handleSave = () => {
    const htmlContent = editorRef.current.innerHTML;
    onSave(htmlContent);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete();
    }
  };

  const handleInput = (e) => {
    // Force LTR on every keystroke
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'normal';
      editorRef.current.style.writingMode = 'horizontal-tb';
      editorRef.current.setAttribute('dir', 'ltr');
    }
    setContent(e.target.innerHTML);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Source: .env - TASKFLOW</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Text Color"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More Options">
              <span className="text-lg">⋯</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Open in New Window">
              ↗
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="p-4">
          <div
            ref={editorRef}
            contentEditable
            dir="ltr"
            className="min-h-[400px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ 
              minHeight: '400px',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal',
              writingMode: 'horizontal-tb'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleInput}
            onKeyDown={(e) => {
              // Force LTR on every key press
              if (editorRef.current) {
                editorRef.current.style.direction = 'ltr';
                editorRef.current.setAttribute('dir', 'ltr');
              }
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-1">
            {/* Text Formatting */}
            <button
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('strikeThrough')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            {/* Lists */}
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Media */}
            <button
              onClick={insertImage}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Add Image"
            >
              <Image className="w-4 h-4" />
            </button>
            <button
              onClick={insertVideo}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Add Video"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={insertLink}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Add Link"
            >
              <Link className="w-4 h-4" />
            </button>

            {/* Screenshot Button */}
            <button
              onClick={insertImage}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Screenshot
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Save Note"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Picker */}
        {showColorPicker && (
          <div className="absolute top-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => applyColor(color)}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add Link</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter link text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkSubmit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

export default SimpleTextEditor;
