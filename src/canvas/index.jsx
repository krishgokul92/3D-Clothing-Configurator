import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows } from '@react-three/drei';
import Shirt from './Shirt';
import CameraRig from './CameraRig';

const CanvasModel = () => {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
        className="w-full h-full"
        shadows
      >
        {/* Studio lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={1024} 
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.5} 
          color="#aec6cf" 
        />
        <directionalLight 
          position={[0, 5, -10]} 
          intensity={0.2} 
        />
        
        {/* Add contact shadows for better grounding */}
        <ContactShadows 
          position={[0, -0.5, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={1.5} 
          far={0.8} 
        />

        <CameraRig>
          <Center>
            <Shirt />
          </Center>
        </CameraRig>
      </Canvas>
    </div>
  )
}

export default CanvasModel