import { useEffect, useRef } from 'react'
import { Canvas, FabricImage, Gradient } from 'fabric'

const getTouchDistance = (touchA, touchB) => {
  const deltaX = touchA.clientX - touchB.clientX
  const deltaY = touchA.clientY - touchB.clientY
  return Math.hypot(deltaX, deltaY)
}

const getImageDimensions = (imageObject) => {
  const element = imageObject.getElement?.()
  return {
    width: element?.naturalWidth || element?.videoWidth || element?.width || imageObject.width || 1,
    height:
      element?.naturalHeight || element?.videoHeight || element?.height || imageObject.height || 1,
    element,
  }
}

function FabricCanvas({
  backgroundImageUrl,
  imageToAdd,
  selectedObjectOpacity,
  onSelectionOpacityChange,
  onStickerDragStateChange,
}) {
  const canvasElementRef = useRef(null)
  const fabricCanvasRef = useRef(null)
  const backgroundImageRef = useRef(null)
  const onSelectionOpacityChangeRef = useRef(onSelectionOpacityChange)
  const onStickerDragStateChangeRef = useRef(onStickerDragStateChange)
  const pinchStateRef = useRef({ active: false, startDistance: 0, startScale: 1 })
  const draggingStickerRef = useRef(null)
  const overBinRef = useRef(false)

  useEffect(() => {
    onSelectionOpacityChangeRef.current = onSelectionOpacityChange
  }, [onSelectionOpacityChange])

  useEffect(() => {
    onStickerDragStateChangeRef.current = onStickerDragStateChange
  }, [onStickerDragStateChange])

  useEffect(() => {
    if (!canvasElementRef.current) {
      return undefined
    }

    const canvas = new Canvas(canvasElementRef.current, {
      width: 340,
      height: 460,
      backgroundColor: '#0b1020',
      selection: true,
    })

    const notifySelectionOpacity = () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) {
        onSelectionOpacityChangeRef.current?.(null)
        return
      }
      onSelectionOpacityChangeRef.current?.(activeObject.opacity ?? 1)
    }

    const isInBinZone = (object) => {
      const center = object.getCenterPoint()
      const binCenterX = canvas.getWidth() / 2
      const binCenterY = canvas.getHeight() - 24
      const halfBinWidth = 84
      const halfBinHeight = 22

      return (
        Math.abs(center.x - binCenterX) <= halfBinWidth &&
        Math.abs(center.y - binCenterY) <= halfBinHeight
      )
    }

    const getBinDistance = (object) => {
      const center = object.getCenterPoint()
      const binCenterX = canvas.getWidth() / 2
      const binCenterY = canvas.getHeight() - 24
      const deltaX = center.x - binCenterX
      const deltaY = center.y - binCenterY
      return Math.hypot(deltaX, deltaY)
    }

    const handleObjectMoving = (event) => {
      const target = event.target
      if (!target?.isSticker) {
        return
      }

      draggingStickerRef.current = target
      if (!target.dragStartScaleX || !target.dragStartScaleY) {
        target.dragStartScaleX = target.scaleX || 1
        target.dragStartScaleY = target.scaleY || 1
      }

      const isOverBin = isInBinZone(target)
      const wasOverBin = overBinRef.current
      overBinRef.current = isOverBin
      const maxInfluenceDistance = 190
      const distanceToBin = getBinDistance(target)
      const proximity = Math.max(0, Math.min(1, 1 - distanceToBin / maxInfluenceDistance))
      const minScaleFactor = 0.54
      const scaleFactor = 1 - proximity * (1 - minScaleFactor)
      target.set({
        scaleX: target.dragStartScaleX * scaleFactor,
        scaleY: target.dragStartScaleY * scaleFactor,
      })

      onStickerDragStateChangeRef.current?.({ visible: true, overBin: isOverBin })
      canvas.requestRenderAll()
    }

    const handlePointerUp = () => {
      const draggedSticker = draggingStickerRef.current
      if (!draggedSticker) {
        onStickerDragStateChangeRef.current?.({ visible: false, overBin: false })
        return
      }

      if (draggedSticker && overBinRef.current) {
        canvas.remove(draggedSticker)
        canvas.discardActiveObject()
        onSelectionOpacityChangeRef.current?.(null)
      } else if (draggedSticker?.dragStartScaleX && draggedSticker?.dragStartScaleY) {
        draggedSticker.set({
          scaleX: draggedSticker.dragStartScaleX,
          scaleY: draggedSticker.dragStartScaleY,
        })
      }

      if (draggedSticker) {
        delete draggedSticker.dragStartScaleX
        delete draggedSticker.dragStartScaleY
      }

      draggingStickerRef.current = null
      overBinRef.current = false
      onStickerDragStateChangeRef.current?.({ visible: false, overBin: false })
      canvas.requestRenderAll()
    }

    canvas.on('selection:created', notifySelectionOpacity)
    canvas.on('selection:updated', notifySelectionOpacity)
    canvas.on('selection:cleared', notifySelectionOpacity)
    canvas.on('object:moving', handleObjectMoving)
    canvas.on('mouse:up', handlePointerUp)
    canvas.upperCanvasEl.addEventListener('touchend', handlePointerUp)
    canvas.upperCanvasEl.addEventListener('touchcancel', handlePointerUp)

    canvas.requestRenderAll()
    fabricCanvasRef.current = canvas

    return () => {
      canvas.off('selection:created', notifySelectionOpacity)
      canvas.off('selection:updated', notifySelectionOpacity)
      canvas.off('selection:cleared', notifySelectionOpacity)
      canvas.off('object:moving', handleObjectMoving)
      canvas.off('mouse:up', handlePointerUp)
      canvas.upperCanvasEl.removeEventListener('touchend', handlePointerUp)
      canvas.upperCanvasEl.removeEventListener('touchcancel', handlePointerUp)
      backgroundImageRef.current = null
      fabricCanvasRef.current?.dispose()
      fabricCanvasRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return undefined
    }

    const handleTouchStart = (event) => {
      if (event.touches.length !== 2) {
        return
      }

      const mainImage = backgroundImageRef.current
      if (!mainImage) {
        return
      }

      const [touchA, touchB] = event.touches
      pinchStateRef.current = {
        active: true,
        startDistance: getTouchDistance(touchA, touchB),
        startScale: mainImage.scaleX || 1,
      }
    }

    const handleTouchMove = (event) => {
      if (event.touches.length !== 2 || !pinchStateRef.current.active) {
        return
      }

      const mainImage = backgroundImageRef.current
      if (!mainImage) {
        return
      }

      event.preventDefault()

      const [touchA, touchB] = event.touches
      const currentDistance = getTouchDistance(touchA, touchB)
      const distanceRatio = currentDistance / (pinchStateRef.current.startDistance || 1)
      const nextScale = pinchStateRef.current.startScale * distanceRatio
      const baseScale = mainImage.baseScale || 1
      const clampedScale = Math.max(baseScale, Math.min(nextScale, baseScale * 4))

      mainImage.set({ scaleX: clampedScale, scaleY: clampedScale })
      canvas.requestRenderAll()
    }

    const handleTouchEnd = () => {
      pinchStateRef.current.active = false
    }

    const canvasTouchLayer = canvas.upperCanvasEl
    canvasTouchLayer.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvasTouchLayer.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvasTouchLayer.addEventListener('touchend', handleTouchEnd)
    canvasTouchLayer.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      canvasTouchLayer.removeEventListener('touchstart', handleTouchStart)
      canvasTouchLayer.removeEventListener('touchmove', handleTouchMove)
      canvasTouchLayer.removeEventListener('touchend', handleTouchEnd)
      canvasTouchLayer.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return undefined
    }

    let cancelled = false

    const applyBackgroundImage = async () => {
      if (backgroundImageRef.current) {
        canvas.remove(backgroundImageRef.current)
        backgroundImageRef.current = null
      }

      if (!backgroundImageUrl) {
        canvas.backgroundColor = '#0b1020'
        canvas.requestRenderAll()
        return
      }

      const image = await FabricImage.fromURL(backgroundImageUrl)
      if (cancelled) {
        return
      }

      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      const { width: imageWidth, height: imageHeight, element: sourceElement } = getImageDimensions(image)
      const containScale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight)
      const renderedWidth = imageWidth * containScale
      const renderedHeight = imageHeight * containScale
      const offsetX = (canvasWidth - renderedWidth) / 2
      const offsetY = (canvasHeight - renderedHeight) / 2

      const sampleColor = (x, y, width, height, fallback) => {
        if (!sourceElement) {
          return fallback
        }

        const safeWidth = Math.max(1, Math.floor(width))
        const safeHeight = Math.max(1, Math.floor(height))
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = safeWidth
        tempCanvas.height = safeHeight
        const context = tempCanvas.getContext('2d')
        if (!context) {
          return fallback
        }

        context.drawImage(
          sourceElement,
          Math.floor(x),
          Math.floor(y),
          safeWidth,
          safeHeight,
          0,
          0,
          safeWidth,
          safeHeight,
        )

        const { data } = context.getImageData(0, 0, safeWidth, safeHeight)
        let red = 0
        let green = 0
        let blue = 0
        let alphaPixels = 0

        for (let index = 0; index < data.length; index += 4) {
          const alpha = data[index + 3] / 255
          if (alpha <= 0) {
            continue
          }

          red += data[index] * alpha
          green += data[index + 1] * alpha
          blue += data[index + 2] * alpha
          alphaPixels += alpha
        }

        if (!alphaPixels) {
          return fallback
        }

        return `rgb(${Math.round(red / alphaPixels)}, ${Math.round(green / alphaPixels)}, ${Math.round(blue / alphaPixels)})`
      }

      const sampleStripHeight = Math.max(1, imageHeight * 0.1)
      const sampleStripWidth = Math.max(1, imageWidth * 0.1)
      const firstColor =
        offsetY > 0
          ? sampleColor(0, 0, imageWidth, sampleStripHeight, '#1e293b')
          : sampleColor(0, 0, sampleStripWidth, imageHeight, '#1e293b')
      const secondColor =
        offsetY > 0
          ? sampleColor(0, imageHeight - sampleStripHeight, imageWidth, sampleStripHeight, '#1e293b')
          : sampleColor(imageWidth - sampleStripWidth, 0, sampleStripWidth, imageHeight, '#1e293b')

      canvas.backgroundColor = new Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: offsetY > 0 ? { x1: 0, y1: 0, x2: 0, y2: canvasHeight } : { x1: 0, y1: 0, x2: canvasWidth, y2: 0 },
        colorStops: [
          { offset: 0, color: firstColor },
          { offset: 1, color: secondColor },
        ],
      })

      image.set({
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        scaleX: containScale,
        scaleY: containScale,
        selectable: false,
        evented: false,
      })
      image.baseScale = containScale

      canvas.add(image)
      canvas.bringObjectToFront(image)
      backgroundImageRef.current = image
      canvas.requestRenderAll()
    }

    applyBackgroundImage()
    return () => {
      cancelled = true
    }
  }, [backgroundImageUrl])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !imageToAdd?.url) {
      return undefined
    }

    let cancelled = false

    const addImageObject = async () => {
      const image = await FabricImage.fromURL(imageToAdd.url)
      if (cancelled) {
        return
      }

      const { width: imageWidth, height: imageHeight } = getImageDimensions(image)
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      const maxStickerSize = Math.min(canvasWidth, canvasHeight) * 0.24
      const fittedScale = maxStickerSize / Math.max(imageWidth, imageHeight)
      const initialScale = Math.min(1, fittedScale)

      image.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        scaleX: initialScale,
        scaleY: initialScale,
        opacity: 0.6,
        selectable: true,
        evented: true,
        hasControls: true,
        lockUniScaling: true,
        lockRotation: true,
        lockSkewingX: true,
        lockSkewingY: true,
        isSticker: true,
      })
      image.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: false,
      })

      canvas.add(image)
      canvas.setActiveObject(image)
      canvas.requestRenderAll()
    }

    addImageObject()
    return () => {
      cancelled = true
    }
  }, [imageToAdd])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    const activeObject = canvas.getActiveObject()
    if (!activeObject) {
      return
    }

    activeObject.set('opacity', selectedObjectOpacity)
    canvas.requestRenderAll()
  }, [selectedObjectOpacity])

  return <canvas ref={canvasElementRef} />
}

export default FabricCanvas
