'use client'

import ImageOCR from '../components/ImageOCR'
import { useQueryState } from 'nuqs'

type OCRLanguage = 'eng' | 'fra' | 'deu' | 'spa' | 'ita' | 'mkd_cyrl'

const isValidLanguage = (value: string): value is OCRLanguage => {
  return ['eng', 'fra', 'deu', 'spa', 'ita', 'mkd_cyrl'].includes(value.toLowerCase())
}

export default function ImageOCRPage() {
  const [language] = useQueryState<OCRLanguage>('lang', {
    parse: (value: string | null) => {
      if (!value) return 'eng'
      const lowerValue = value.toLowerCase()
      return isValidLanguage(lowerValue) ? lowerValue as OCRLanguage : 'eng'
    }
  })
  
  return (
    <div className="container mx-auto p-4">
      <ImageOCR defaultLanguage={language || 'eng'} />
    </div>
  )
} 