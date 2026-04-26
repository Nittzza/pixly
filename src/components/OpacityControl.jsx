function OpacityControl({ sliderValue, hasActiveSelection, onSliderChange }) {
  return (
    <label className="opacity-field">
      <span>Opacity: {sliderValue}%</span>
      <input type="range" min="0" max="100" value={sliderValue} onChange={onSliderChange} />
      <small>
        {hasActiveSelection
          ? 'Adjusts the selected object only.'
          : 'Select an object to apply opacity changes.'}
      </small>
    </label>
  )
}

export default OpacityControl
