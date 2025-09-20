import * as THREE from 'three'

export interface LightConfig {
  ambientLight?: {
    color?: number | string
    intensity?: number
  }
  directionalLight?: {
    color?: number | string
    intensity?: number
    position?: [number, number, number]
    castShadow?: boolean
    shadowMapSize?: number
    shadowCamera?: {
      left?: number
      right?: number
      top?: number
      bottom?: number
      near?: number
      far?: number
    }
  }
  pointLight?: {
    color?: number | string
    intensity?: number
    distance?: number
    decay?: number
    position?: [number, number, number]
    castShadow?: boolean
    shadowMapSize?: number
  }
  spotLight?: {
    color?: number | string
    intensity?: number
    distance?: number
    angle?: number
    penumbra?: number
    decay?: number
    position?: [number, number, number]
    target?: [number, number, number]
    castShadow?: boolean
    shadowMapSize?: number
  }
  hemisphereLight?: {
    skyColor?: number | string
    groundColor?: number | string
    intensity?: number
    position?: [number, number, number]
  }
}

export class Light {
  private lights: THREE.Light[] = []
  private ambientLight?: THREE.AmbientLight
  private directionalLight?: THREE.DirectionalLight
  private pointLight?: THREE.PointLight
  private spotLight?: THREE.SpotLight
  private hemisphereLight?: THREE.HemisphereLight

  constructor(private config: LightConfig = {}) {
    this.init()
  }

  private init(): void {
    this.createAmbientLight()
    this.createDirectionalLight()
    this.createPointLight()
    this.createSpotLight()
    this.createHemisphereLight()
  }

  private createAmbientLight(): void {
    if (!this.config.ambientLight) return

    const { color = 0x404040, intensity = 0.4 } = this.config.ambientLight

    this.ambientLight = new THREE.AmbientLight(color, intensity)
    this.lights.push(this.ambientLight)
  }

  private createDirectionalLight(): void {
    if (!this.config.directionalLight) return

    const {
      color = 0xffffff,
      intensity = 1,
      position = [10, 10, 5],
      castShadow = true,
      shadowMapSize = 2048,
      shadowCamera = {}
    } = this.config.directionalLight

    this.directionalLight = new THREE.DirectionalLight(color, intensity)
    this.directionalLight.position.set(...position)

    if (castShadow) {
      this.directionalLight.castShadow = true
      this.directionalLight.shadow.mapSize.width = shadowMapSize
      this.directionalLight.shadow.mapSize.height = shadowMapSize

      const {
        left = -10,
        right = 10,
        top = 10,
        bottom = -10,
        near = 0.1,
        far = 50
      } = shadowCamera

      this.directionalLight.shadow.camera.left = left
      this.directionalLight.shadow.camera.right = right
      this.directionalLight.shadow.camera.top = top
      this.directionalLight.shadow.camera.bottom = bottom
      this.directionalLight.shadow.camera.near = near
      this.directionalLight.shadow.camera.far = far
    }

    this.lights.push(this.directionalLight)
  }

  private createPointLight(): void {
    if (!this.config.pointLight) return

    const {
      color = 0xffffff,
      intensity = 1,
      distance = 0,
      decay = 2,
      position = [0, 10, 0],
      castShadow = false,
      shadowMapSize = 1024
    } = this.config.pointLight

    this.pointLight = new THREE.PointLight(color, intensity, distance, decay)
    this.pointLight.position.set(...position)

    if (castShadow) {
      this.pointLight.castShadow = true
      this.pointLight.shadow.mapSize.width = shadowMapSize
      this.pointLight.shadow.mapSize.height = shadowMapSize
    }

    this.lights.push(this.pointLight)
  }

  private createSpotLight(): void {
    if (!this.config.spotLight) return

    const {
      color = 0xffffff,
      intensity = 1,
      distance = 0,
      angle = Math.PI / 3,
      penumbra = 0,
      decay = 2,
      position = [0, 10, 0],
      target = [0, 0, 0],
      castShadow = false,
      shadowMapSize = 1024
    } = this.config.spotLight

    this.spotLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay)
    this.spotLight.position.set(...position)
    this.spotLight.target.position.set(...target)

    if (castShadow) {
      this.spotLight.castShadow = true
      this.spotLight.shadow.mapSize.width = shadowMapSize
      this.spotLight.shadow.mapSize.height = shadowMapSize
    }

    this.lights.push(this.spotLight)
  }

  private createHemisphereLight(): void {
    if (!this.config.hemisphereLight) return

    const {
      skyColor = 0xffffbb,
      groundColor = 0x080820,
      intensity = 1,
      position = [0, 50, 0]
    } = this.config.hemisphereLight

    this.hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    this.hemisphereLight.position.set(...position)

    this.lights.push(this.hemisphereLight)
  }

  // ライトをシーンに追加
  addToScene(scene: THREE.Scene): void {
    this.lights.forEach(light => {
      scene.add(light)
      
      // SpotLightのターゲットも追加
      if (light instanceof THREE.SpotLight) {
        scene.add(light.target)
      }
    })
  }

  // ライトをシーンから削除
  removeFromScene(scene: THREE.Scene): void {
    this.lights.forEach(light => {
      scene.remove(light)
      
      // SpotLightのターゲットも削除
      if (light instanceof THREE.SpotLight) {
        scene.remove(light.target)
      }
    })
  }

  // 特定のライトの強度を変更
  setIntensity(lightType: keyof LightConfig, intensity: number): void {
    switch (lightType) {
      case 'ambientLight':
        if (this.ambientLight) this.ambientLight.intensity = intensity
        break
      case 'directionalLight':
        if (this.directionalLight) this.directionalLight.intensity = intensity
        break
      case 'pointLight':
        if (this.pointLight) this.pointLight.intensity = intensity
        break
      case 'spotLight':
        if (this.spotLight) this.spotLight.intensity = intensity
        break
      case 'hemisphereLight':
        if (this.hemisphereLight) this.hemisphereLight.intensity = intensity
        break
    }
  }

  // 特定のライトの色を変更
  setColor(lightType: keyof LightConfig, color: number | string): void {
    switch (lightType) {
      case 'ambientLight':
        if (this.ambientLight) this.ambientLight.color.set(color)
        break
      case 'directionalLight':
        if (this.directionalLight) this.directionalLight.color.set(color)
        break
      case 'pointLight':
        if (this.pointLight) this.pointLight.color.set(color)
        break
      case 'spotLight':
        if (this.spotLight) this.spotLight.color.set(color)
        break
    }
  }

  // 特定のライトの位置を変更
  setPosition(lightType: 'directionalLight' | 'pointLight' | 'spotLight' | 'hemisphereLight', position: [number, number, number]): void {
    switch (lightType) {
      case 'directionalLight':
        if (this.directionalLight) this.directionalLight.position.set(...position)
        break
      case 'pointLight':
        if (this.pointLight) this.pointLight.position.set(...position)
        break
      case 'spotLight':
        if (this.spotLight) this.spotLight.position.set(...position)
        break
      case 'hemisphereLight':
        if (this.hemisphereLight) this.hemisphereLight.position.set(...position)
        break
    }
  }

  // SpotLightのターゲット位置を変更
  setSpotLightTarget(target: [number, number, number]): void {
    if (this.spotLight) {
      this.spotLight.target.position.set(...target)
    }
  }

  // 全てのライトを取得
  getLights(): THREE.Light[] {
    return this.lights
  }

  // 特定のライトを取得
  getLight(lightType: keyof LightConfig): THREE.Light | undefined {
    switch (lightType) {
      case 'ambientLight':
        return this.ambientLight
      case 'directionalLight':
        return this.directionalLight
      case 'pointLight':
        return this.pointLight
      case 'spotLight':
        return this.spotLight
      case 'hemisphereLight':
        return this.hemisphereLight
      default:
        return undefined
    }
  }

  // ライトヘルパーを作成
  createHelpers(): THREE.Object3D[] {
    const helpers: THREE.Object3D[] = []

    if (this.directionalLight) {
      const helper = new THREE.DirectionalLightHelper(this.directionalLight, 5)
      helpers.push(helper)
    }

    if (this.pointLight) {
      const helper = new THREE.PointLightHelper(this.pointLight, 1)
      helpers.push(helper)
    }

    if (this.spotLight) {
      const helper = new THREE.SpotLightHelper(this.spotLight)
      helpers.push(helper)
    }

    if (this.hemisphereLight) {
      const helper = new THREE.HemisphereLightHelper(this.hemisphereLight, 5)
      helpers.push(helper)
    }

    return helpers
  }

  // 設定を更新
  updateConfig(newConfig: Partial<LightConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // ライトをリセットして再作成
    this.lights = []
    this.ambientLight = undefined
    this.directionalLight = undefined
    this.pointLight = undefined
    this.spotLight = undefined
    this.hemisphereLight = undefined
    
    this.init()
  }

  // リソースの解放
  dispose(): void {
    this.lights.forEach(light => {
      if (light.dispose) {
        light.dispose()
      }
    })
    this.lights = []
  }
}

// プリセット設定
export const LightPresets = {
  // 基本的な3点ライティング
  threePoint: {
    ambientLight: {
      intensity: 0.2
    },
    directionalLight: {
      intensity: 1,
      position: [10, 10, 5] as [number, number, number],
      castShadow: true
    },
    pointLight: {
      intensity: 0.5,
      position: [-10, 10, -5] as [number, number, number]
    }
  },

  // 自然光
  natural: {
    ambientLight: {
      color: 0x87CEEB,
      intensity: 0.6
    },
    directionalLight: {
      color: 0xFFE4B5,
      intensity: 1.2,
      position: [10, 20, 5] as [number, number, number],
      castShadow: true
    }
  },

  // 夜のライティング
  night: {
    ambientLight: {
      color: 0x1a1a2e,
      intensity: 0.1
    },
    pointLight: {
      color: 0xffffff,
      intensity: 2,
      position: [0, 5, 0] as [number, number, number],
      castShadow: true
    }
  },

  // スタジオライティング
  studio: {
    ambientLight: {
      intensity: 0.4
    },
    directionalLight: {
      intensity: 1,
      position: [5, 10, 5] as [number, number, number],
      castShadow: true
    },
    spotLight: {
      intensity: 0.8,
      position: [-5, 10, 5] as [number, number, number],
      target: [0, 0, 0] as [number, number, number]
    }
  }
} as const
