function ThumbnailPanel({ sections, selectedImageUrl, onThumbnailClick }) {
  return (
    <aside className="thumb-panel" aria-label="Image thumbnails">
      {sections.map((section) => (
        <section key={section.id} className="thumb-section">
          <h3>{section.title}</h3>
          <div className="thumb-items">
            {section.images.map((imageUrl) => (
              <button
                type="button"
                key={imageUrl}
                className={`thumb-button ${selectedImageUrl === imageUrl ? 'is-active' : ''}`}
                onClick={() => onThumbnailClick(imageUrl)}
              >
                <img src={imageUrl} alt={`${section.title} sticker`} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </aside>
  )
}

export default ThumbnailPanel
