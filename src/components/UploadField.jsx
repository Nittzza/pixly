function UploadField({ onImageUpload }) {
  return (
    <label className="upload-field">
      <span>Upload File</span>
      <input type="file" accept="image/*" onChange={onImageUpload} />
    </label>
  )
}

export default UploadField
