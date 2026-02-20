import './App.css'
import { useState, useRef, useEffect } from 'react';
import { uploadFile, getFileInfo } from './service/api';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef();
  const dropRef = useRef(null);

  const MAX_SIZE_MB = 25;

  // Load recent uploads from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentUploads');
    if (stored) {
      try {
        setRecentUploads(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading recent uploads', e);
      }
    }
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Generate preview for images
  useEffect(() => {
    const previews = {};
    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target.result;
          setFilePreviews({ ...previews });
        };
        reader.readAsDataURL(file);
      }
    });
  }, [files]);

  // Manual file upload handler
  const handleUpload = async () => {
    if (files.length === 0) return;

    // Validate all files
    const validFiles = [];
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showToast(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB limit`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setFiles([]);
      return;
    }

    setError('');
    setProgress(0);
    setIsUploading(true);

    const data = new FormData();
    validFiles.forEach(file => {
      data.append("file", file);
    });

    if (password) {
      data.append("password", password);
    }
    if (expiresInDays) {
      data.append("expiresInDays", expiresInDays);
    }

    try {
      const response = await uploadFile(data, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgress(pct);
        }
      });

      const newUploads = response.files || [];
      setUploadedFiles(newUploads);
      
      // Save to recent uploads
      const updatedRecent = [...newUploads, ...recentUploads].slice(0, 10);
      setRecentUploads(updatedRecent);
      localStorage.setItem('recentUploads', JSON.stringify(updatedRecent));

      showToast(`Successfully uploaded ${newUploads.length} file(s)!`, 'success');
      setFiles([]);
      setPassword('');
      setExpiresInDays('');
    } catch (e) {
      const errorMsg = e?.response?.data?.msg || e?.message || 'Upload failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    
    const prevent = (e) => { 
      e.preventDefault(); 
      e.stopPropagation(); 
    };
    
    const onDrop = (e) => {
      prevent(e);
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        const fileArray = Array.from(dt.files);
        setFiles(fileArray);
      }
    };

    el.addEventListener('dragenter', prevent);
    el.addEventListener('dragover', prevent);
    el.addEventListener('dragleave', prevent);
    el.addEventListener('drop', onDrop);
    
    return () => {
      el.removeEventListener('dragenter', prevent);
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('dragleave', prevent);
      el.removeEventListener('drop', onDrop);
    };
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  const copyToClipboard = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const newPreviews = { ...filePreviews };
    delete newPreviews[index];
    setFilePreviews(newPreviews);
  };

  const clearRecent = () => {
    setRecentUploads([]);
    localStorage.removeItem('recentUploads');
    showToast('Recent uploads cleared', 'success');
  };

  return (
    <div className="box">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <h1>DropVault – Secure File Sharing Platform</h1>
      <p>Upload your files and share secure links with anyone</p>

      {/* Upload Section */}
      <div ref={dropRef} className="dropzone">
        <p>Drag & drop files here, or</p>
        <button onClick={() => fileInputRef.current.click()}>
          Choose {files.length > 0 ? 'More' : 'Files'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{display: 'none'}} 
          multiple
          onChange={handleFileSelect}
        />

        {/* Selected Files Preview */}
        {files.length > 0 && (
          <div className="files-preview">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                {filePreviews[index] ? (
                  <img src={filePreviews[index]} alt="Preview" className="file-preview-img" />
                ) : (
                  <div className="file-icon">📄</div>
                )}
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
                <button className="remove-btn" onClick={() => removeFile(index)}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        {files.length > 0 && !isUploading && (
          <div className="upload-options">
            <div className="option-group">
              <label>Password (optional):</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Protect with password"
                className="option-input"
              />
              <button 
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="option-group">
              <label>Expires in (days, optional):</label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="e.g., 7"
                min="1"
                className="option-input"
              />
            </div>
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="upload-btn"
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#f8fafc',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        )}

        {/* Uploading State */}
        {isUploading && uploadedFiles.length === 0 && (
          <div className="uploading-state">
            <div className="spinner"></div>
            <p className="meta">Uploading {files.length} file(s)...</p>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && progress < 100 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}

        {error && <p className="meta error-text">{error}</p>}
      </div>

      {/* Uploaded Files Results */}
      {uploadedFiles.length > 0 && (
        <div className="results-section">
          <h2>Uploaded Files</h2>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="result-card">
              <div className="result-header">
                <div className="result-info">
                  <h3>{file.name}</h3>
                  <p className="meta">
                    {formatFileSize(file.size)} • {file.mimetype}
                    {file.expiresAt && (
                      <span> • Expires: {new Date(file.expiresAt).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                <button 
                  className="qr-toggle"
                  onClick={() => setShowQR(showQR === file.id ? null : file.id)}
                >
                  {showQR === file.id ? 'Hide QR' : 'Show QR'}
                </button>
              </div>

              {showQR === file.id && (
                <div className="qr-container">
                  <QRCodeSVG value={file.path} size={200} />
                </div>
              )}

              <div className="result-actions">
                <input 
                  type="text" 
                  value={file.path} 
                  readOnly 
                  className="input-like"
                  onClick={(e) => e.target.select()}
                />
                <button onClick={() => copyToClipboard(file.path)}>Copy</button>
                <a href={file.path} target="_blank" rel="noreferrer">
                  <button>Open</button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Uploads */}
      {recentUploads.length > 0 && uploadedFiles.length === 0 && (
        <div className="recent-section">
          <div className="recent-header">
            <h2>Recent Uploads</h2>
            <button className="clear-btn" onClick={clearRecent}>Clear</button>
          </div>
          <div className="recent-list">
            {recentUploads.slice(0, 5).map((file, index) => (
              <div key={index} className="recent-item">
                <span className="recent-name">{file.name}</span>
                <div className="recent-actions">
                  <button onClick={() => copyToClipboard(file.path)}>Copy</button>
                  <a href={file.path} target="_blank" rel="noreferrer">
                    <button>Open</button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
