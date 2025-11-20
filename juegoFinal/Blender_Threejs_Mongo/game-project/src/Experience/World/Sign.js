import * as THREE from 'three'

export default class Sign {
    constructor(experience, text = 'Sign', position = { x: 0, y: 2, z: 0 }, options = {}) {
        this.experience = experience
        this.scene = this.experience.scene
        this.text = text
        this.position = position
        this.options = Object.assign({ width: 2.4, height: 1.2, font: '48px sans-serif', textColor: '#ffffff', bgColor: '#222233' }, options)

        this.group = new THREE.Group()
        this.group.position.set(position.x, position.y, position.z)

        this._createCanvasTexture()
        this._createMesh()

        this.scene.add(this.group)
    }

    _createCanvasTexture() {
        const w = 1024
        const h = 512
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')

        // Fondo
        ctx.fillStyle = this.options.bgColor
        ctx.fillRect(0, 0, w, h)

        // Texto
        ctx.fillStyle = this.options.textColor
        ctx.font = this.options.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.text, w / 2, h / 2)

        this.texture = new THREE.CanvasTexture(canvas)
        this.texture.encoding = THREE.sRGBEncoding
        this.texture.needsUpdate = true
    }

    _createMesh() {
        const geo = new THREE.PlaneGeometry(this.options.width, this.options.height)
        const mat = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, side: THREE.DoubleSide })
        this.mesh = new THREE.Mesh(geo, mat)
        this.mesh.castShadow = false
        this.mesh.receiveShadow = false

        // Soporte (poste)
        const postGeo = new THREE.CylinderGeometry(0.05, 0.05, this.options.height + 0.6, 8)
        const postMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
        this.post = new THREE.Mesh(postGeo, postMat)
        this.post.position.set(0, -(this.options.height / 2) - 0.3, 0)

        const signGroup = new THREE.Group()
        signGroup.add(this.mesh)
        signGroup.add(this.post)

        // Ajuste: colocar la cara del cartel frente a la cámara por defecto
        signGroup.rotation.y = 0

        this.group.add(signGroup)
    }

    lookAt(target) {
        if (!target) return
        const t = (target.position) ? target.position : target
        this.group.lookAt(new THREE.Vector3(t.x, this.group.position.y, t.z))
    }

    destroy() {
        if (this.texture) this.texture.dispose()
        if (this.mesh) {
            this.mesh.geometry.dispose()
            if (this.mesh.material.map) this.mesh.material.map.dispose()
            this.mesh.material.dispose()
        }
        if (this.post) {
            this.post.geometry.dispose()
            this.post.material.dispose()
        }
        this.scene.remove(this.group)
    }
}
