
import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Camera, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { StorageService } from '@/services/storageService'
import { optimizeImageForUpload } from '@/lib/image'

const REQUIRED = {
  idFrontPhoto: 'Documento de identidad (frontal)',
  idBackPhoto: 'Documento de identidad (reverso)',
  selfieWithId: 'Selfie con documento',
} as const

type ImgKey = keyof typeof REQUIRED

interface Props {
  transferId: string
  onDataReady: (data: {
    idNumber: string
    idFrontPhoto: string
    idBackPhoto: string
    selfieWithId: string
    hasDamage: boolean
    damageDescription?: string
  }) => void
  onDataChanged: (nextDisabled: boolean) => void
  initialData?: {
    idNumber?: string
    idFrontPhoto?: string
    idBackPhoto?: string
    selfieWithId?: string
    hasDamage?: boolean
    damageDescription?: string
  }
}

const RecipientIdentityStep: React.FC<Props> = ({
  transferId,
  onDataReady,
  onDataChanged,
  initialData,
}) => {
  const [imageUrls, setImageUrls] = useState<Record<ImgKey, string>>({} as any)
  // Loading por campo para subidas en paralelo
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [idNumber, setIdNumber] = useState('')
  const [hasDamage, setHasDamage] = useState(false)
  const [damageDescription, setDamageDescription] = useState('')

  const readyRef = useRef(false)
  const keys = Object.keys(REQUIRED) as ImgKey[]

  const handleImageUpload = async (key: ImgKey, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }))
    
    try {
      const optimized = await optimizeImageForUpload(file, 1600, 0.75)
      const folderPath = `travel/${transferId}/delivery/identity`
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

  // determine form validity and notify parent
  useEffect(() => {
    const allImgs = keys.every(k => Boolean(imageUrls[k]))
    const dmgOk = !hasDamage || damageDescription.trim() !== ''
    const isUploadingAny = Object.values(uploading).some(Boolean)
    const formValid = idNumber.trim() !== '' && allImgs && dmgOk && !isUploadingAny

    onDataChanged(!formValid)

    if (formValid && !readyRef.current) {
      onDataReady({
        idNumber: idNumber.trim(),
        idFrontPhoto: imageUrls.idFrontPhoto!,
        idBackPhoto: imageUrls.idBackPhoto!,
        selfieWithId: imageUrls.selfieWithId!,
        hasDamage,
        damageDescription: hasDamage ? damageDescription.trim() : undefined,
      })
      readyRef.current = true
    } else if (!formValid && readyRef.current) {
      onDataReady(null as any)
      readyRef.current = false
    }
  }, [
    idNumber,
    hasDamage,
    damageDescription,
    imageUrls,
    uploading,
  ])

  // Hidratar desde props iniciales al montar
  useEffect(() => {
    if (initialData) {
      if (initialData.idFrontPhoto || initialData.idBackPhoto || initialData.selfieWithId) {
        setImageUrls(prev => ({
          ...prev,
          ...(initialData.idFrontPhoto ? { idFrontPhoto: initialData.idFrontPhoto } : {}),
          ...(initialData.idBackPhoto ? { idBackPhoto: initialData.idBackPhoto } : {}),
          ...(initialData.selfieWithId ? { selfieWithId: initialData.selfieWithId } : {}),
        } as any))
      }
      if (initialData.idNumber) setIdNumber(initialData.idNumber)
      if (typeof initialData.hasDamage === 'boolean') setHasDamage(initialData.hasDamage)
      if (initialData.damageDescription) setDamageDescription(initialData.damageDescription)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <p className="text-white/70">
        Verifica la identidad del receptor y documenta el estado del vehículo.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="space-y-4">
          {/* Número de documento */}
          <div className="space-y-2">
            <Label className="text-white">Número de documento</Label>
            <Input
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              placeholder="Introduce el DNI/NIE"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

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

          {/* Daños */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-white">
                ¿El vehículo tiene daños visibles?
              </Label>
              <Switch checked={hasDamage} onCheckedChange={setHasDamage} />
            </div>
            {hasDamage && (
              <div className="mt-4">
                <Label className="text-white">Describe los daños</Label>
                <Textarea
                  value={damageDescription}
                  onChange={e => setDamageDescription(e.target.value)}
                  placeholder="Describe los daños observados…"
                  className="mt-2 bg-white/5 border-white/20 text-white"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RecipientIdentityStep
