import * as THREE from 'three'

/**
 * ModelLoader utility for loading 3D models and textures
 * Provides caching and error handling for asset loading
 */
export class ModelLoader {
  constructor() {
    this.cache = new Map()
    this.textureLoader = new THREE.TextureLoader()
    this.loadingManager = new THREE.LoadingManager()
    
    // Loading progress callbacks
    this.onLoadStart = null
    this.onLoadProgress = null
    this.onLoadComplete = null
    this.onLoadError = null
    
    this.setupLoadingManager()
  }

  setupLoadingManager() {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      if (this.onLoadStart) {
        this.onLoadStart(url, itemsLoaded, itemsTotal)
      }
    }

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (this.onLoadProgress) {
        this.onLoadProgress(url, itemsLoaded, itemsTotal)
      }
    }

    this.loadingManager.onLoad = () => {
      if (this.onLoadComplete) {
        this.onLoadComplete()
      }
    }

    this.loadingManager.onError = (url) => {
      console.error(`Failed to load: ${url}`)
      if (this.onLoadError) {
        this.onLoadError(url)
      }
    }
  }

  /**
   * Load a texture with caching
   * @param {string} url - URL to the texture
   * @param {object} options - Loading options
   * @returns {Promise<THREE.Texture>}
   */
  async loadTexture(url, options = {}) {
    if (this.cache.has(url)) {
      return this.cache.get(url).clone()
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // Apply options
          if (options.wrapS) texture.wrapS = options.wrapS
          if (options.wrapT) texture.wrapT = options.wrapT
          if (options.repeat) {
            texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1)
          }
          if (options.flipY !== undefined) texture.flipY = options.flipY
          
          this.cache.set(url, texture)
          resolve(texture)
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${url}`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Create a simple procedural texture
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {function} generator - Function to generate pixel data
   * @returns {THREE.DataTexture}
   */
  createProceduralTexture(width, height, generator) {
    const size = width * height
    const data = new Uint8Array(4 * size)

    for (let i = 0; i < size; i++) {
      const x = i % width
      const y = Math.floor(i / width)
      const pixel = generator(x, y, width, height)
      
      const stride = i * 4
      data[stride] = pixel.r || 0
      data[stride + 1] = pixel.g || 0
      data[stride + 2] = pixel.b || 0
      data[stride + 3] = pixel.a !== undefined ? pixel.a : 255
    }

    const texture = new THREE.DataTexture(data, width, height)
    texture.needsUpdate = true
    return texture
  }

  /**
   * Create a noise texture for various effects
   * @param {number} size - Texture size (square)
   * @param {number} scale - Noise scale
   * @returns {THREE.DataTexture}
   */
  createNoiseTexture(size = 256, scale = 0.1) {
    return this.createProceduralTexture(size, size, (x, y) => {
      // Simple noise function
      const noise = Math.random()
      const value = Math.floor(noise * 255)
      return { r: value, g: value, b: value, a: 255 }
    })
  }

  /**
   * Create a gradient texture
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {object} colors - Start and end colors
   * @param {string} direction - 'horizontal' or 'vertical'
   * @returns {THREE.DataTexture}
   */
  createGradientTexture(width, height, colors, direction = 'horizontal') {
    return this.createProceduralTexture(width, height, (x, y, w, h) => {
      const factor = direction === 'horizontal' ? x / w : y / h
      
      const r = Math.floor(colors.start.r + (colors.end.r - colors.start.r) * factor)
      const g = Math.floor(colors.start.g + (colors.end.g - colors.start.g) * factor)
      const b = Math.floor(colors.start.b + (colors.end.b - colors.start.b) * factor)
      
      return { r, g, b, a: 255 }
    })
  }

  /**
   * Create placeholder materials for development
   * @param {string} type - Type of material ('basic', 'lambert', 'phong')
   * @param {number} color - Material color
   * @returns {THREE.Material}
   */
  createPlaceholderMaterial(type = 'lambert', color = 0xff00ff) {
    switch (type) {
      case 'basic':
        return new THREE.MeshBasicMaterial({ color })
      case 'lambert':
        return new THREE.MeshLambertMaterial({ color })
      case 'phong':
        return new THREE.MeshPhongMaterial({ color })
      default:
        return new THREE.MeshLambertMaterial({ color })
    }
  }

  /**
   * Preload multiple assets
   * @param {Array} assets - Array of asset objects with url and type
   * @returns {Promise<Map>} - Map of loaded assets
   */
  async preloadAssets(assets) {
    const promises = assets.map(asset => {
      switch (asset.type) {
        case 'texture':
          return this.loadTexture(asset.url, asset.options).then(texture => ({
            name: asset.name,
            asset: texture
          }))
        default:
          console.warn(`Unknown asset type: ${asset.type}`)
          return Promise.resolve(null)
      }
    })

    const results = await Promise.allSettled(promises)
    const loadedAssets = new Map()

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        loadedAssets.set(result.value.name, result.value.asset)
      } else {
        console.error(`Failed to load asset: ${assets[index].name}`, result.reason)
      }
    })

    return loadedAssets
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.forEach(texture => {
      texture.dispose()
    })
    this.cache.clear()
  }

  /**
   * Get cache size
   * @returns {number}
   */
  getCacheSize() {
    return this.cache.size
  }

  /**
   * Dispose of a cached texture
   * @param {string} url - URL of the texture to dispose
   */
  disposeTexture(url) {
    if (this.cache.has(url)) {
      this.cache.get(url).dispose()
      this.cache.delete(url)
    }
  }
}
