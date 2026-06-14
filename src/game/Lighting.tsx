export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#e8f0ff', '#6b7280', 1.4]} />
      <directionalLight
        castShadow
        intensity={1.8}
        position={[4, 8, 5]}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}
