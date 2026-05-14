import { put } from '@vercel/blob'

export async function uploadImage(file: File): Promise<string> {
  console.log('Uploading image:', file)
  console.log('token:', import.meta.env.VITE_BLOB_READ_WRITE_TOKEN)
  const blob = await put(file.name, file, {
    access: 'public',
    token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
  })
  return blob.url
}
