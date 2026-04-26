import { useCallback, useEffect, useState } from 'react'
import EditorHeader from './components/EditorHeader'
import FabricCanvas from './components/FabricCanvas'
import OpacityControl from './components/OpacityControl'
import ThumbnailPanel from './components/ThumbnailPanel'
import UploadField from './components/UploadField'
import { stickerSections } from './constants/galleryImages'
import './App.css'

function App() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('')
  const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState('')
  const [imageToAdd, setImageToAdd] = useState(null)
  const [selectedObjectOpacity, setSelectedObjectOpacity] = useState(null)
  const [opacitySliderValue, setOpacitySliderValue] = useState(60)
  const [binState, setBinState] = useState({ visible: false, overBin: false })

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const nextUrl = URL.createObjectURL(file)
    setUploadedImageUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl)
      }
      return nextUrl
    })
    setBackgroundImageUrl(nextUrl)
    event.target.value = ''
  }, [])

  const handleThumbnailClick = useCallback((imageUrl) => {
    setSelectedThumbnailUrl(imageUrl)
    setImageToAdd({
      id: crypto.randomUUID(),
      url: imageUrl,
    })
  }, [])

  const handleOpacitySliderChange = useCallback((event) => {
    setOpacitySliderValue(Number(event.target.value))
  }, [])

  const handleSelectionOpacityChange = useCallback((opacityValue) => {
    if (opacityValue === null) {
      setSelectedObjectOpacity(null)
      return
    }

    const nextSliderValue = Math.round(opacityValue * 100)
    setSelectedObjectOpacity(opacityValue)
    setOpacitySliderValue(nextSliderValue)
  }, [])

  const handleRemoveUploadedImage = useCallback(() => {
    setBackgroundImageUrl('')
    setUploadedImageUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl)
      }
      return ''
    })
  }, [])

  const handleStickerDragStateChange = useCallback((nextState) => {
    setBinState(nextState)
  }, [])

  return (
    <main className="editor-page">
      <section className="editor-phone">
        <EditorHeader />

        <UploadField onImageUpload={handleImageUpload} />

        <div className="toolbar">
          <button
            type="button"
            className="tool-button"
            onClick={handleRemoveUploadedImage}
          >
            Delete Uploaded Photo
          </button>
        </div>

        <OpacityControl
          sliderValue={opacitySliderValue}
          hasActiveSelection={selectedObjectOpacity !== null}
          onSliderChange={handleOpacitySliderChange}
        />

        <div className="editor-body">
          <ThumbnailPanel
            sections={stickerSections}
            selectedImageUrl={selectedThumbnailUrl}
            onThumbnailClick={handleThumbnailClick}
          />

          <div className="canvas-wrap">
            <FabricCanvas
              backgroundImageUrl={backgroundImageUrl}
              imageToAdd={imageToAdd}
              selectedObjectOpacity={opacitySliderValue / 100}
              onSelectionOpacityChange={handleSelectionOpacityChange}
              onStickerDragStateChange={handleStickerDragStateChange}
            />
            <div
              className={`trash-bin ${binState.visible ? 'is-visible' : ''} ${
                binState.overBin ? 'is-over' : ''
              }`}
            >
              🗑 Drop here to delete
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
