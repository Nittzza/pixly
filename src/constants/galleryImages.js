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

const srmImages = [
  ...Object.values(
    import.meta.glob('../assets/srm/*.{png,jpg,jpeg,webp,avif}', {
      eager: true,
      import: 'default',
    }),
  ),
  ...Object.values(
    import.meta.glob('../assets/srm 2022-26/*.{png,jpg,jpeg,webp,avif}', {
      eager: true,
      import: 'default',
    }),
  ),
]

export const stickerSections = [
  { id: 'srm', title: 'SRM', images: srmImages },
  { id: 'flowers', title: 'Flowers', images: flowerImages },
  { id: 'beachy', title: 'Beachy', images: beachyImages },
]

export const galleryImages = [...flowerImages, ...beachyImages, ...srmImages]
