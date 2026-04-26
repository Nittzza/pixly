import { useMemo, useState } from 'react'
import './PixlyApp.css'

const loadImagesFromFolder = (folderName) =>
  Object.values(
    import.meta.glob(`../assets/${folderName}/*.{png,jpg,jpeg,webp,avif}`, {
      eager: true,
      import: 'default',
    }),
  )

const srmImages = [
  ...loadImagesFromFolder('srm'),
  ...loadImagesFromFolder('srm 2022-26'),
]

const flowerImages = Object.values(
  import.meta.glob('../assets/flowers/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    import: 'default',
  }),
)

const beachyImages = Object.values(
  import.meta.glob('../assets/beachy/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    import: 'default',
  }),
)

const sections = [
  { id: 'srm', title: 'SRM', images: srmImages },
  { id: 'flowers', title: 'Flowers', images: flowerImages },
  { id: 'beachy', title: 'Beachy', images: beachyImages },
]

function PixlyApp() {
  const [selectedSticker, setSelectedSticker] = useState('')
  const [selectedOpacity, setSelectedOpacity] = useState(100)
  const hasAnyStickers = useMemo(
    () => sections.some((section) => section.images.length > 0),
    [],
  )

  return (
    <main className="pixly-shell">
      <header className="pixly-title-bar">
        <h1>Pixly</h1>
      </header>

      <section className="pixly-app">
      <aside className="pixly-sidebar">
        {sections.map((section) => (
          <section key={section.id} className="pixly-section">
            <h2>{section.title}</h2>
            <div className="pixly-grid">
              {section.images.map((imageUrl) => (
                <button
                  key={imageUrl}
                  type="button"
                  className={`pixly-thumb ${selectedSticker === imageUrl ? 'is-active' : ''}`}
                  onClick={() => setSelectedSticker(imageUrl)}
                >
                  <img src={imageUrl} alt={`${section.title} sticker`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </aside>

      <section className="pixly-preview">
        <div className="pixly-preview-content">
          {selectedSticker ? (
            <img
              src={selectedSticker}
              alt="Selected sticker preview"
              style={{ opacity: selectedOpacity / 100 }}
            />
          ) : (
            <p>{hasAnyStickers ? 'Select a sticker' : 'No stickers found'}</p>
          )}
        </div>

        <div className="pixly-opacity">
          <label htmlFor="pixly-opacity-slider">Opacity: {selectedOpacity}%</label>
          <input
            id="pixly-opacity-slider"
            type="range"
            min="0"
            max="100"
            value={selectedOpacity}
            onChange={(event) => setSelectedOpacity(Number(event.target.value))}
            disabled={!selectedSticker}
          />
        </div>
      </section>
      </section>
    </main>
  )
}

export default PixlyApp
