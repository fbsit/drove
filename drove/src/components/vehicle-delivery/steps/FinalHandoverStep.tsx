
import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Camera, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { StorageService } from '@/services/storageService'
import SignaturePad from '@/components/vehicle-delivery/SignaturePad'
import { optimizeImageForUpload } from '@/lib/image'

const REQUIRED = {
  delivery_document: 'Documento de entrega firmado',
  fuel_receipt: 'Justificante de pago de combustible',
} as const

type ImgKey = keyof typeof REQUIRED

interface Props {
  transferId: string
  onDataReady: (data: {
    delivery_document: string
    fuel_receipt: string
    comments?: string
    drover_signature: string
    client_signature: string
  }) => void
  onDataChanged: (disabled: boolean) => void
}

const FinalHandoverStep: React.FC<Props> = ({
  transferId,
  onDataReady,
  onDataChanged,
}) => {
  const [imageUrls, setImageUrls] = useState<Record<ImgKey, string>>({} as any)
  // Loading por campo para subidas en paralelo
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState('')
  const [droverSig, setDroverSig] = useState('')
  const [clientSig, setClientSig] = useState('')

  const readyRef = useRef(false)
  const keys = Object.keys(REQUIRED) as ImgKey[]

  const handleImageUpload = async (key: ImgKey, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }))
    
    try {
      const optimized = await optimizeImageForUpload(file, 1600, 0.75)
      const folderPath = `travel/${transferId}/delivery/documents`
      const imageUrl = await StorageService.uploadImage(optimized, folderPath)
      
      if (imageUrl) {
        setImageUrls(prev => ({ ...prev, [key]: imageUrl }))
        toast.success('Imagen subida correctamente')
      } else {
        throw new Error('Error al subir la imagen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleImageChange = (key: ImgKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleImageUpload(key, file)
  }

  const removeImage = (key: ImgKey) => {
    setImageUrls(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
    toast.success('Imagen eliminada')
  }

  // validación y notificación al wizard
  useEffect(() => {
    const allImgs = keys.every(k => Boolean(imageUrls[k]))
    const allSigs = droverSig !== '' && clientSig !== ''
    const isUploadingAny = Object.values(uploading).some(Boolean)
    const formValid = allImgs && allSigs && !isUploadingAny

    onDataChanged(!formValid)

    if (formValid && !readyRef.current) {
      onDataReady({
        delivery_document: imageUrls.delivery_document!,
        fuel_receipt: imageUrls.fuel_receipt!,
        comments: comments.trim() || undefined,
        drover_signature: droverSig,
        client_signature: clientSig,
      })
      readyRef.current = true
    } else if (!formValid && readyRef.current) {
      onDataReady(null as any)
      readyRef.current = false
    }
  }, [imageUrls, droverSig, clientSig, comments, uploading])

  return (
    <div className="space-y-6">
      <p className="text-white/70">
        Para finalizar la entrega, sube los documentos requeridos y obtén las firmas.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="space-y-4">
          {/* Imágenes requeridas */}
          {keys.map(key => (
            <div key={key} className="space-y-2">
              <p className="text-white/80 text-sm">{REQUIRED[key]}</p>
              <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                {imageUrls[key] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageUrls[key]}
                      alt={REQUIRED[key]}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(key)}
                      disabled={!!uploading[key]}
                      className="absolute top-2 right-2 h-6 w-6"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/20 rounded-lg transition-colors">
                    {uploading[key] ? (
                      <Loader className="h-8 w-8 text-white/70 animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white/70" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={!!uploading[key]}
                      onChange={e => handleImageChange(key, e)}
                    />
                  </label>
                )}
              </div>
            </div>
          ))}

          {/* Comentarios */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <Label className="text-white">Comentarios (opcional)</Label>
            <Textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          {/* Firmas */}
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div>
              <Label className="text-white mb-2 block">Firma del Drover</Label>
              <SignaturePad onSignatureChange={setDroverSig} height={150} />
            </div>
            <div>
              <Label className="text-white mb-2 block">Firma del Receptor</Label>
              <SignaturePad onSignatureChange={setClientSig} height={150} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default FinalHandoverStep
