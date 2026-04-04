"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh, ShaderMaterial } from "three";
import { Color, FrontSide, Vector3 } from "three";

import { cn } from "@atl/ui/lib/utils";

interface ShaderPlaneProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, { value: unknown }>;
}

const ShaderPlane = ({
  vertexShader,
  fragmentShader,
  uniforms,
}: ShaderPlaneProps) => {
  const meshRef = useRef<Mesh>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime * 0.5;
      material.uniforms.u_resolution.value.set(size.width, size.height, 1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={FrontSide}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_resolution;
  uniform vec3 u_color;
  uniform vec3 u_bg_color;

  float bayerDither(vec2 fragCoord) {
      float scale = 4.0;
      int x = int(mod(floor(fragCoord.x / scale), 4.0));
      int y = int(mod(floor(fragCoord.y / scale), 4.0));
      int idx = x + y * 4;
      float bayer[16];
      bayer[0] = 0.0;  bayer[1] = 8.0;  bayer[2] = 2.0;  bayer[3] = 10.0;
      bayer[4] = 12.0; bayer[5] = 4.0;  bayer[6] = 14.0; bayer[7] = 6.0;
      bayer[8] = 3.0;  bayer[9] = 11.0; bayer[10] = 1.0; bayer[11] = 9.0;
      bayer[12] = 15.0; bayer[13] = 7.0; bayer[14] = 13.0; bayer[15] = 5.0;
      return bayer[idx] / 16.0;
  }

  void mainImage(out vec4 col, in vec2 pc)
  {
      float time = u_time / 3.0;
      vec2 a = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 c = pc.xy / u_resolution.xy * a * 3.5 + time * 0.3;

      float k = 0.1 + cos(c.y + sin(0.148 - time)) + 2.4 * time;
      float w = 0.9 + sin(c.x + cos(0.628 + time)) - 0.7 * time;
      float d = length(c);
      float s = 7.0 * cos(d + w) * sin(k + w);

      col = vec4(0.5 + 0.5 * cos(s + vec3(0.2, 0.5, 0.9)), 1.0);
  }

  void main() {
      vec2 fragCoord = vUv * u_resolution.xy;
      vec4 col;
      mainImage(col, fragCoord);

      float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      float threshold = bayerDither(fragCoord);
      float bw = step(threshold, gray);
      col.rgb = mix(u_bg_color, u_color, bw);

      gl_FragColor = col;
  }
`;

/** WebGL backdrop for the donate CTA card (client-only; keeps DonateSection as RSC). */
export function DonateShaderBackdrop() {
  const uniforms = useMemo(
    () => ({
      u_bg_color: { value: new Color("#14151f") },
      u_color: { value: new Color("#7b8cff") },
      u_resolution: { value: new Vector3(1, 1, 1) },
      u_time: { value: 0 },
    }),
    []
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full min-h-0 w-full overflow-hidden opacity-90"
      )}
    >
      <Canvas className="h-full w-full">
        <ShaderPlane
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
        />
      </Canvas>
    </div>
  );
}
