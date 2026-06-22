import { useState, useRef } from 'react';
import api from '../api/api';

export default function ImageUpload({ onUpload, currentImage }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = res.data.url;
      setPreview(imageUrl);
      onUpload?.(imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    onUpload?.(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getImageSrc = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `http://localhost:3001${url}` : url;
  };

  return (
    <div>
      {!preview ? (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          id="image-upload-area"
        >
          <div className="upload-icon">🖼</div>
          {uploading ? (
            <div className="upload-text">Uploading...</div>
          ) : (
            <>
              <div className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </div>
              <div className="upload-text" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                JPEG, PNG, GIF, WebP (max 5MB)
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="upload-preview">
          <img src={getImageSrc(preview)} alt="Upload preview" />
          <button className="upload-remove" onClick={removeImage} title="Remove image">✕</button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="image-file-input"
      />
    </div>
  );
}
