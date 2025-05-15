import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF } from "@react-three/drei";

function Lungs() {
  const { scene } = useGLTF("/lungs.glb");  
  return (
    <Center>
      <primitive object={scene} scale={2.5} />
    </Center>
  );
}

export default function LungsModel() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 11 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Lungs />
        <OrbitControls
          autoRotate
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          rotateSpeed={1.5}
          dampingFactor={0.1}
        />
      </Suspense>
    </Canvas>
  );
}
