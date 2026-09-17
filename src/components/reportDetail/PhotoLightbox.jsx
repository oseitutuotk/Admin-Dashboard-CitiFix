import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') onNavigate((index + 1) % photos.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, photos.length, onClose, onNavigate])

  if (index == null) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85" onClick={onClose} role="dialog" aria-modal="true">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white" aria-label="Close">
        <X className="size-7" />
      </button>

      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + photos.length) % photos.length) }}
          className="absolute left-4 text-white/80 hover:text-white"
          aria-label="Previous photo"
        >
          <ChevronLeft className="size-9" />
        </button>
      )}

      <img
        src={photos[index].storage_url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[85vw] object-contain rounded-[var(--radius-sm)]"
      />

      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % photos.length) }}
          className="absolute right-4 text-white/80 hover:text-white"
          aria-label="Next photo"
        >
          <ChevronRight className="size-9" />
        </button>
      )}

      {photos.length > 1 && <p className="absolute bottom-4 text-white/70 text-[13px]">{index + 1} / {photos.length}</p>}
    </div>
  )
}