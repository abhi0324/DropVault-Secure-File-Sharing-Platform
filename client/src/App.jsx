import './App.css'
import { useState, useRef, useEffect } from 'react';
import { uploadFile } from './service/api';


function App() {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();
  const dropRef = useRef(null);

  const MAX_SIZE_MB = 25;

  useEffect(() => {
    const getImage = async()=> {
      if(file){
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`File exceeds ${MAX_SIZE_MB}MB limit.`);
          setResult('');
          setProgress(0);
          setIsUploading(false);
          return;
        }
        setError('');
        setProgress(0);
        setIsUploading(true);
        const data = new FormData();
        data.append("name", file.name);
        data.append("file", file);

        try {
          const response = await uploadFile(data, {
            onUploadProgress: (evt) => {
              if (!evt.total) return;
              const pct = Math.round((evt.loaded * 100) / evt.total);
              setProgress(pct);
            }
          });
          setResult(response?.path || '');
        } catch (e) {
          setError(e?.message || 'Upload failed');
          setResult('');
          setProgress(0);
        } finally {
          setIsUploading(false);
        }

      }
    };
    getImage();
  }, [file]); 

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e) => {
      prevent(e);
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files[0]) {
        setFile(dt.files[0]);
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

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      alert('Link copied to clipboard');
    } catch {
      // no-op
    }
  };

  return(
    <div className="box">
      <h1>File Sharing Application</h1>
      <p>Upload your file and share links with your friends</p>

      <div ref={dropRef} className="dropzone">
        <p>Drag & drop a file here, or</p>
        <button onClick={() => fileInputRef.current.click()}>Choose file</button>
        <input type="file" 
          ref={fileInputRef} 
          style={{display: 'none'}} 
          onChange={(e) => setFile(e.target.files[0])}/>
        {file ? <p className="meta">Selected: {file.name}</p> : <p className="meta">No file selected</p>}
        
        {isUploading && !result ? (
          <div className="uploading-state">
            <div className="spinner"></div>
            <p className="meta">Generating your shareable link...</p>
          </div>
        ) : null}
        
        {progress > 0 && progress < 100 ? (
          <div className="meta" style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
              <div style={{ height: 10, width: `${progress}%`, background: '#8b5cf6', borderRadius: 999 }} />
            </div>
            <div style={{ marginTop: 6 }}>{progress}%</div>
          </div>
        ) : null}
        {error ? <p className="meta" style={{ color: '#fca5a5' }}>{error}</p> : null}
      </div>

      {result ? (
        <div className="result">
          <span className="input-like" title={result}>{result}</span>
          <button onClick={copyToClipboard}>Copy link</button>
          <a href={result} target="_blank" rel="noreferrer">
            <button>Open</button>
          </a>
        </div>
      ) : null}
    </div>
  )
}

export default App;
