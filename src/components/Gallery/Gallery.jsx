import { useState, useEffect } from 'react'
import { getImagesForCategory } from '../../data/images'
import styles from './Gallery.module.css'

const Gallery = ({ category }) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    setLoading(true)
    
    // Get images from configuration
    const categoryImages = getImagesForCategory(category)
    
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setImages(categoryImages)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [category])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading {category} gallery...</p>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No images found in {category} gallery</p>
        <p className={styles.emptySubtext}>
          Add image filenames to src/data/images.js to display them here
        </p>
      </div>
    )
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.galleryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)} Gallery</h2>
        <p className={styles.imageCount}>{images.length} images</p>
      </div>
      
      <div className={styles.grid}>
        {images.map((image, index) => (
          <div 
            key={image.filename} 
            className={styles.imageContainer}
            onClick={() => setSelectedImage(image.url)}
          >
            <img
              src={image.url}
              alt={image.alt}
              className={styles.image}
              loading="lazy"
              onError={(e) => {
                console.log(`Failed to load image: ${image.filename}`)
                e.target.style.display = 'none'
              }}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent}>
            <img
              src={selectedImage}
              alt="Full size"
              className={styles.modalImage}
            />
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
