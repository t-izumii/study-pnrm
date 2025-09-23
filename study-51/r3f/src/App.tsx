import { Canvas } from "@react-three/fiber";
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

function App() {
  return (
    <>
      <Canvas style={{ width: "100vw", height: "100vh" }} className="canvas">
        <OrbitControls />

        <mesh>
          <planeGeometry args={[4, 5]} />
          <MeshPortalMaterial resolution={512} blur={0} side={DoubleSide}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <Model scale={[0.8, 0.8, 0.8]} position={[0, -1.5, 0]} />

            <Sphere />
          </MeshPortalMaterial>
        </mesh>
      </Canvas>
    </>
  );
}

export default App;
