import { supabase } from '@/supabaseClient'
import { getUserId } from '@/lib/auth'

export async function uploadToBucket(
  bucket: string,
  path: string,
  file: Blob | File | ArrayBuffer | Uint8Array,
  contentType = 'application/octet-stream'
) {
  // supabase-js accepts Blob/File directly in the browser
  const { error } = await supabase.storage.from(bucket).upload(path, file as unknown as Blob, {
    contentType,
    upsert: true,
  })
  if (error) throw error
  return { bucket, path }
}

export async function getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

/** Build a canonical PDF storage path: svj/{svjId}/{userId}/{timestamp}-{fileName}.pdf */
export async function buildPdfPath(svjId: string, fileNameBase: string) {
  const userId = await getUserId()
  const safe = fileNameBase.replace(/[^a-zA-Z0-9._-]/g, '_')
  const ts = Date.now()
  return `svj/${svjId}/${userId}/${ts}-${safe}.pdf`
}
