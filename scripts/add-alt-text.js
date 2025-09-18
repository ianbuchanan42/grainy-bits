#!/usr/bin/env node

// Helper script to add alt text to images
// Usage: node scripts/add-alt-text.js

const fs = require('fs')
const path = require('path')

const imagesFile = path.join(__dirname, '../src/data/images.js')

console.log('📝 Alt Text Helper for Grainy Bits')
console.log('===================================')
console.log('')
console.log('To add alt text to your images:')
console.log('1. Open src/data/images.js')
console.log('2. Find the image you want to describe')
console.log('3. Replace the empty string with descriptive text')
console.log('')
console.log('Example:')
console.log('{ filename: "000008750015.jpg", alt: "Dancer in motion, black and white film" }')
console.log('')
console.log('Alt text guidelines:')
console.log('• Be descriptive but concise')
console.log('• Describe what\'s in the image')
console.log('• Include relevant details (mood, setting, action)')
console.log('• Mention it\'s black and white film photography')
console.log('• Keep it under 125 characters for best SEO')
console.log('')
console.log('Example alt texts:')
console.log('• "Bride and groom sharing a quiet moment, black and white film"')
console.log('• "Dancer mid-leap, dramatic lighting, film photography"')
console.log('• "Abstract architectural detail, grainy black and white"')
console.log('• "Wedding ceremony, emotional moment captured on film"')
console.log('')
console.log('💡 Tip: Good alt text helps with accessibility and SEO!')
