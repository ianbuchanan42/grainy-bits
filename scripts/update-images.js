#!/usr/bin/env node

// Simple script to help manage image lists
// Run with: node scripts/update-images.js

const fs = require('fs')
const path = require('path')

const imagesFile = path.join(__dirname, '../src/data/images.js')

console.log('📸 Grainy Bits Image Manager')
console.log('============================')
console.log('')
console.log('To add new images:')
console.log('1. Upload your images to the appropriate Supabase folder')
console.log('2. Add the filename to the array in src/data/images.js')
console.log('3. The image will automatically appear in the gallery')
console.log('')
console.log('Current image configuration:')
console.log('📁 Dance folder: Dance/')
console.log('📁 Wedding folder: Wedding/')
console.log('📁 Art folder: Misc/')
console.log('')
console.log('Example:')
console.log('dance: [')
console.log('  "000008750015.jpg", // existing')
console.log('  "000008750031.jpg", // new image')
console.log('  "000008750032.jpg", // another new image')
console.log(']')
console.log('')
console.log('💡 Tip: Keep filenames consistent for easier management!')
