'use client';
import { useState } from 'react';
import './page.css';

interface Entry {
  id: number;
  title: string;
  imageUrl: string;
  date: string;
  location: string;
  notes: string;
  exposures: string;
  exposureTime: string;
  iso: string;
  focalLength: string;
  telescope: string;
  camera: string;
  mount: string;
  filters: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    date: '',
    location: '',
    notes: '',
    exposures: '',
    exposureTime: '',
    iso: '',
    focalLength: '',
    telescope: '',
    camera: '',
    mount: '',
    filters: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Sorry, TIFF files and unsupported formats aren’t supported. Please use JPG, PNG, or WebP.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log("Preview URL:", url);
      setForm({ ...form, imageUrl: url });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Sorry, TIFF files and unsupported formats aren’t supported. Please use JPG, PNG, or WebP.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log("Preview URL:", url);
      setForm({ ...form, imageUrl: url });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAddEntry = () => {
    const newEntry = { ...form, id: Date.now() };
    setEntries([...entries, newEntry]);
    setForm({ title: '', imageUrl: '', date: '', location: '', notes: '', exposures: '', exposureTime: '', iso: '', focalLength: '', telescope: '', camera: '', mount: '', filters: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowForm(false);
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="journal-page">
      <h1 className="main-header">My Sky-Journal</h1>
      <p className='header-description'>
        A deep-sky logbook for photos, targets, and notes.
      </p>

      {/* Place the new-entry button below the journal-grid */}

      {showForm && (
        <div className="journal-form-container">
          <div className="journal-form basic-form">
            <div
              className="file-drop"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              tabIndex={0}
              role="button"
              onClick={() => {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) (fileInput as HTMLInputElement).click();
              }}
            >
              <p>Drag &amp; drop your image here, or click to select a file</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label htmlFor="fileInput" className="file-drop-label">Choose file</label>
            </div>

            <label>
              Target Name
              <input
                type="text"
                placeholder='e.g. M42 - Orion Nebula'
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>

            <label>
              Location
              <input
                type="text"
                placeholder='e.g. San Francisco, CA'
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>

            <label>
              Notes
              <textarea
                placeholder='Comments, observations, etc.'
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <button className='advanced-fields-button' type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? 'Hide Advanced Fields' : 'Show Advanced Fields'}
            </button>

            <div className="journal-form-buttons">
              <button className='cancel-button' onClick={() => setShowForm(false)}>Cancel</button>
              <button className='add-entry-button' onClick={handleAddEntry}>Add Entry</button>
            </div>
          </div> 

          {showAdvanced && (
            <div className="journal-form advanced-fields">
              <label>
                Number of Exposures
                <input
                  type="number"
                  placeholder='e.g. 100'
                  value={form.exposures}
                  onChange={(e) => setForm({ ...form, exposures: e.target.value })}
                />
              </label>

              <label>
                Exposure Time
                <input
                  type="text"
                  placeholder='e.g. 60'
                  value={form.exposureTime}
                  onChange={(e) => setForm({ ...form, exposureTime: e.target.value })}
                />
              </label>

              <label>
                ISO
                <input
                  type="text"
                  placeholder='e.g. 3200'
                  value={form.iso}
                  onChange={(e) => setForm({ ...form, iso: e.target.value })}
                />
              </label>

              <label>
                Focal Length
                <input
                  type="text"
                  placeholder='e.g. 360mm'
                  value={form.focalLength}
                  onChange={(e) => setForm({ ...form, focalLength: e.target.value })}
                />
              </label>

              <label>
                Telescope
                <input
                  type="text"
                  placeholder='e.g. Apertura 60mm FPL-53 Doublet'
                  value={form.telescope}
                  onChange={(e) => setForm({ ...form, telescope: e.target.value })}
                />
              </label>

              <label>
                Camera
                <input
                  type="text"
                  placeholder='e.g. Canon EOS Rebel T7i'
                  value={form.camera}
                  onChange={(e) => setForm({ ...form, camera: e.target.value })}
                />
              </label>

              <label>
                Mount
                <input
                  type="text"
                  placeholder='e.g. SkyWatcher Star Adventurer GTi'
                  value={form.mount}
                  onChange={(e) => setForm({ ...form, mount: e.target.value })}
                />
              </label>

              <label>
                Filters
                <input
                  type="text"
                  placeholder='e.g. Optolong 2" H-Alpha 7nm Filter'
                  value={form.filters}
                  onChange={(e) => setForm({ ...form, filters: e.target.value })}
                />
              </label>
            </div>
          )}

          {previewUrl && (
            <div className="journal-form preview-box">
              <h3>Preview</h3>
              <img
                src={previewUrl}
                alt="Preview"
                className="preview-image"
                onError={() => console.error("Image failed to load:", previewUrl)}
              />
            </div>
          )}
        </div>
      )}

      <div className="journal-grid">
        {entries.map((entry) => (
          <div className="journal-entry" key={entry.id}>
            <h2>{entry.title}</h2>
            <img src={entry.imageUrl} alt={entry.title} />
            <p>
              <strong>Date:</strong> {entry.date}<br />
              <strong>Location:</strong> {entry.location}
            </p>
            <p>{entry.notes}</p>
            <div className="equipment-info">
              <p><strong>Exposures:</strong> {entry.exposures} × {entry.exposureTime} @ ISO {entry.iso}</p>
              <p><strong>Focal Length:</strong> {entry.focalLength}</p>
              <p><strong>Telescope:</strong> {entry.telescope}</p>
              <p><strong>Camera:</strong> {entry.camera}</p>
              <p><strong>Mount:</strong> {entry.mount}</p>
              <p><strong>Filters:</strong> {entry.filters}</p>
            </div>
            <button className="delete-entry-button" onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
          </div>
        ))}
      </div>

      {!showForm && (
        <div className="new-entry-button-container">
          <button className="new-entry-button" onClick={() => setShowForm(true)}>
          ➕
          </button>
        </div>
      )}
    </div>
  );
}