// Y軸の修正案

// 方法A: setupEventsでY座標を反転しない
private setupEvents(): void {
    window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.clientX / window.innerWidth;
        this.mouse.y = e.clientY / window.innerHeight;  // 反転しない
    });
}

// 方法B: フローマップシェーダーでY座標を反転
// flowmapFragment.glsl内で
void main() {
    vec2 flow = texture2D(uPreviousFlow, vUv).rg;
    
    // マウスのY座標を反転
    vec2 adjustedMouse = vec2(uMouse.x, 1.0 - uMouse.y);
    vec2 diff = vUv - adjustedMouse;
    
    // velocityのY軸も反転
    vec2 adjustedVelocity = vec2(uVelocity.x, -uVelocity.y);
    
    float dist = length(diff);
    float influence = smoothstep(uInfluenceRadius, 0.0, dist);
    
    flow += adjustedVelocity * influence * uStrength;
    flow *= uDecay;
    
    gl_FragColor = vec4(flow, 0.0, 1.0);
}

// 方法C: velocityの計算時にY軸を反転
private animate = (): void => {
    // ... 
    
    // 即時の生のベロシティを計算
    const rawVelocityX = this.currentMouse.x - previousMouseX;
    const rawVelocityY = -(this.currentMouse.y - previousMouseY);  // Y軸を反転
    
    // ...
}