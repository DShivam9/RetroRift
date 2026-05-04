/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform float uColorNum;
uniform float uPixelSize;
uniform float uWaveSpeed;
uniform float uWaveFreq;
uniform float uWaveAmp;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMouseEnable;

// Bayer matrix for dithering
float bayer8(vec2 uv) {
    vec2 p = floor(uv);
    int x = int(mod(p.x, 8.0));
    int y = int(mod(p.y, 8.0));
    const float m[64] = float[64](
        0.0, 48.0, 12.0, 60.0, 3.0, 51.0, 15.0, 63.0,
        32.0, 16.0, 44.0, 28.0, 35.0, 19.0, 47.0, 31.0,
        8.0, 56.0, 4.0, 52.0, 11.0, 59.0, 7.0, 55.0,
        40.0, 24.0, 36.0, 20.0, 43.0, 27.0, 39.0, 23.0,
        2.0, 50.0, 14.0, 62.0, 1.0, 49.0, 13.0, 61.0,
        34.0, 18.0, 46.0, 30.0, 33.0, 17.0, 45.0, 29.0,
        10.0, 58.0, 6.0, 54.0, 9.0, 57.0, 5.0, 53.0,
        42.0, 26.0, 38.0, 22.0, 41.0, 25.0, 37.0, 21.0
    );
    return m[y * 8 + x] / 64.0;
}

// Simple noise for waves
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv;
    vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
    
    // Wave pattern
    float t = uTime * uWaveSpeed;
    float n = fbm(uv * uWaveFreq + t);
    
    // Mouse interaction
    if (uMouseEnable > 0.5) {
        float dist = distance(screenUv, uMouse);
        float m = 1.0 - smoothstep(0.0, uMouseRadius, dist);
        n += m * 0.4;
    }
    
    // Base color
    vec3 col = uColor * n;
    
    // Dithering
    vec2 pixelCoord = gl_FragCoord.xy / uPixelSize;
    float threshold = bayer8(pixelCoord);
    
    float levels = uColorNum - 1.0;
    col = floor(col * levels + threshold) / levels;
    
    gl_FragColor = vec4(col, 1.0);
}
`;

function Scene({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  colorNum,
  pixelSize,
  enableMouseInteraction,
  mouseRadius
}) {
  const meshRef = useRef();
  const { viewport, size } = useThree();
  
  const uniforms = useMemo(() => ({
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(...waveColor) },
    uColorNum: { value: colorNum },
    uPixelSize: { value: pixelSize },
    uWaveSpeed: { value: waveSpeed },
    uWaveFreq: { value: waveFrequency },
    uWaveAmp: { value: waveAmplitude },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseRadius: { value: mouseRadius },
    uMouseEnable: { value: enableMouseInteraction ? 1.0 : 0.0 }
  }), []);

  useFrame((state) => {
    const { clock, mouse } = state;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uColor.value.set(...waveColor);
    uniforms.uColorNum.value = colorNum;
    uniforms.uPixelSize.value = pixelSize;
    uniforms.uWaveSpeed.value = waveSpeed;
    uniforms.uWaveFreq.value = waveFrequency;
    uniforms.uWaveAmp.value = waveAmplitude;
    uniforms.uMouseRadius.value = mouseRadius;
    uniforms.uMouseEnable.value = enableMouseInteraction ? 1.0 : 0.0;
    
    // Map mouse [-1, 1] to [0, 1]
    uniforms.uMouse.value.set(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5);
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export default function Dither({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  color = '#ffffff',
  colorNum = 4,
  pixelSize = 2,
  enableMouseInteraction = true,
  mouseRadius = 0.3
}) {
  const waveColor = useMemo(() => {
    const c = new THREE.Color(color);
    return [c.r, c.g, c.b];
  }, [color]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <Scene
          waveSpeed={waveSpeed}
          waveFrequency={waveFrequency}
          waveAmplitude={waveAmplitude}
          waveColor={waveColor}
          colorNum={colorNum}
          pixelSize={pixelSize}
          enableMouseInteraction={enableMouseInteraction}
          mouseRadius={mouseRadius}
        />
      </Canvas>
    </div>
  );
}
