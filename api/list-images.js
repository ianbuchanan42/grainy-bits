// Simple API endpoint to list images from Supabase Storage
// This would need to be deployed as a serverless function

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://afziltusqfvlckjbgkil.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY // You'd need to set this

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  const { folder } = req.query
  
  if (!folder) {
    return res.status(400).json({ error: 'Folder parameter required' })
  }

  try {
    const { data, error } = await supabase.storage
      .from('grainy-bits')
      .list(folder, {
        limit: 100,
        offset: 0,
      })

    if (error) {
      throw error
    }

    // Filter for image files
    const imageFiles = data
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
      .map(file => ({
        name: file.name,
        url: `https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits/${folder}/${file.name}`
      }))

    res.status(200).json({ images: imageFiles })
  } catch (error) {
    console.error('Error listing images:', error)
    res.status(500).json({ error: 'Failed to list images' })
  }
}
