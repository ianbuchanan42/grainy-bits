// Image configuration - updated with real filenames from Desktop folders
// Structure supports alt text for accessibility and SEO

const baseUrl = 'https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits'

export const imageConfig = {
  dance: [
    { filename: '000008750015.jpg', alt: '' },
    { filename: '000016450015.jpg', alt: '' },
    { filename: '000023560015.jpg', alt: '' },
    { filename: '000023560016.jpg', alt: '' },
    { filename: '000026360019.jpg', alt: '' },
    { filename: '000030310022.jpg', alt: '' },
    { filename: '000030310027.jpg', alt: '' },
    { filename: '000030310034.jpg', alt: '' },
    { filename: '000047170001.jpg', alt: '' },
    { filename: '000049510031.jpg', alt: '' },
    { filename: '000057380006.jpg', alt: '' },
    { filename: '000057380024.jpg', alt: '' },
    { filename: '000057380025.jpg', alt: '' },
    { filename: '000065440024.jpg', alt: '' },
    { filename: '000065440034.jpg', alt: '' },
    { filename: '000066390021.jpg', alt: '' },
    { filename: '000066390026.jpg', alt: '' },
    { filename: '000066390033.jpg', alt: '' },
    { filename: '000066390034.jpg', alt: '' },
    { filename: '000066400019.jpg', alt: '' },
    { filename: '000066400038.jpg', alt: '' },
    { filename: '000066410009.jpg', alt: '' },
    { filename: '000084020021.jpg', alt: '' },
    { filename: '000098500004.jpg', alt: '' }
  ],
  wedding: [
    { filename: '000002050001.jpg', alt: '' },
    { filename: '000002050002.jpg', alt: '' },
    { filename: '000002050003.jpg', alt: '' },
    { filename: '000002050004.jpg', alt: '' },
    { filename: '000002050005.jpg', alt: '' },
    { filename: '000002050006.jpg', alt: '' },
    { filename: '000002050007.jpg', alt: '' },
    { filename: '000002050008.jpg', alt: '' },
    { filename: '000002050009.jpg', alt: '' },
    { filename: '000002050010.jpg', alt: '' },
    { filename: '000002050011.jpg', alt: '' },
    { filename: '000002050012.jpg', alt: '' },
    { filename: '000002050013.jpg', alt: '' },
    { filename: '000002050014.jpg', alt: '' },
    { filename: '000002050015.jpg', alt: '' },
    { filename: '000002050016.jpg', alt: '' },
    { filename: '000002050017.jpg', alt: '' },
    { filename: '000002050018.jpg', alt: '' },
    { filename: '000002050019.jpg', alt: '' },
    { filename: '000002050020.jpg', alt: '' },
    { filename: '000002050021.jpg', alt: '' },
    { filename: '000002050022.jpg', alt: '' },
    { filename: '000002050023.jpg', alt: '' },
    { filename: '000002050024.jpg', alt: '' },
    { filename: '000002050025.jpg', alt: '' },
    { filename: '000002050026.jpg', alt: '' },
    { filename: '000002050027.jpg', alt: '' },
    { filename: '000002050028.jpg', alt: '' },
    { filename: '000002050029.jpg', alt: '' },
    { filename: '000002050030.jpg', alt: '' },
    { filename: '000002050031.jpg', alt: '' },
    { filename: '000002050032.jpg', alt: '' },
    { filename: '000002050033.jpg', alt: '' },
    { filename: '000002050034.jpg', alt: '' },
    { filename: '000002050035.jpg', alt: '' },
    { filename: '000002050036.jpg', alt: '' },
    { filename: '000002050037.jpg', alt: '' }
  ],
  art: [
    { filename: '000072970001.jpg', alt: '' },
    { filename: '000072970002.jpg', alt: '' },
    { filename: '000072970003.jpg', alt: '' },
    { filename: '000072970004.jpg', alt: '' },
    { filename: '000072970005.jpg', alt: '' },
    { filename: '000072970006.jpg', alt: '' },
    { filename: '000072970007.jpg', alt: '' },
    { filename: '000072970008.jpg', alt: '' },
    { filename: '000072970009.jpg', alt: '' },
    { filename: '000072970010.jpg', alt: '' },
    { filename: '000072970011.jpg', alt: '' },
    { filename: '000072970012.jpg', alt: '' }
  ]
}

export const getImageUrl = (folder, filename) => {
  return `${baseUrl}/${folder}/${filename}`
}

export const getImagesForCategory = (category) => {
  const folderMap = {
    dance: 'Dance',
    wedding: 'Wedding',
    art: 'Misc'
  }
  
  const folder = folderMap[category]
  const images = imageConfig[category] || []
  
  return images.map(image => ({
    filename: image.filename,
    alt: image.alt || `${category} photography`,
    url: getImageUrl(folder, image.filename)
  }))
}
