'use client'

import ImageConverter from '../components/ImageConverter'
import { useQueryState } from 'nuqs'

type ImageFormat = 'PNG' | 'JPG' | 'WEBP' | 'ICO' | 'ICNS'

const isValidFormat = (value: string): value is ImageFormat => {
  return ['PNG', 'JPG', 'WEBP', 'ICO', 'ICNS'].includes(value.toUpperCase())
}

export default function ImageConverterPage() {
  const [format] = useQueryState<ImageFormat>('format', {
    parse: (value: string | null) => {
      if (!value) return 'PNG'
      const upperValue = value.toUpperCase()
      return isValidFormat(upperValue) ? upperValue as ImageFormat : 'PNG'
    }
  })
  
  const [quality] = useQueryState('quality', {
    defaultValue: '80'
  })

  return (
    <div className="container mx-auto p-4">

      <ImageConverter 
        defaultFormat={format || 'PNG'} 
        defaultQuality={parseInt(quality)} 
      />
    </div>
  )
} 