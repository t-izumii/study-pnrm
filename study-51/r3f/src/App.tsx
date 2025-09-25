import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  BackSide,
  PlaneGeometry,
  DoubleSide,
} from "three";
import {
  useTexture,
  OrbitControls,
  MeshPortalMaterial,
} from "@react-three/drei";
import { Model } from "./components/model.jsx";
import { useRef, useState } from "react";
import "./app.css";

function Sphere() {
  const map = useTexture("texture.jpg");

  return (
    <mesh
      geometry={new SphereGeometry(6, 32, 32)}
      material={new MeshBasicMaterial({ map: map, side: BackSide })}
    />
  );
}

function TiltableMesh({
  children,
  mousePosition,
  isHovering,
}: {
  children: React.ReactNode;
  mousePosition: { x: number; y: number };
  isHovering: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (isHovering) {
        // 元のJavaScriptコードと同じ計算方法
        const centerX = 0; // メッシュの中心
        const centerY = 0; // メッシュの中心

        const rotateX = ((mousePosition.y - centerY) / 2.5) * -30; // 高さ5の半分2.5で正規化
        const rotateY = ((mousePosition.x - centerX) / 2) * 30; // 幅4の半分2で正規化

        const targetRotationX = (rotateX * Math.PI) / 180;
        const targetRotationY = (rotateY * Math.PI) / 180;

        // スムーズな補間でカタカタを防ぐ
        meshRef.current.rotation.x +=
          (targetRotationX - meshRef.current.rotation.x) * 0.2;
        meshRef.current.rotation.y +=
          (targetRotationY - meshRef.current.rotation.y) * 0.2;
      } else {
        // マウスが離れた時は元の位置に戻る
        meshRef.current.rotation.x += (0 - meshRef.current.rotation.x) * 0.1;
        meshRef.current.rotation.y += (0 - meshRef.current.rotation.y) * 0.1;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 5]} />
      <MeshPortalMaterial resolution={512} blur={0} side={DoubleSide}>
        {children}
      </MeshPortalMaterial>
    </mesh>
  );
}

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        className="canvas"
        onPointerMove={(e) => {
          // Canvas全体でのマウス位置を取得
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // 正規化された座標に変換（-1から1の範囲）
          const normalizedX = (x / rect.width) * 2 - 1;
          const normalizedY = -((y / rect.height) * 2 - 1); // Y軸を反転

          setMousePosition({ x: normalizedX, y: normalizedY });
          setIsHovering(true);
        }}
        onPointerLeave={() => {
          setIsHovering(false);
        }}
      >
        <TiltableMesh mousePosition={mousePosition} isHovering={isHovering}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <Model scale={[0.8, 0.8, 0.8]} position={[0, -1.5, 0]} />
          <Sphere />
        </TiltableMesh>
      </Canvas>
    </>
  );
}

export default App;
