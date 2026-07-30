"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const MODEL_VERTEX = `
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  in vec3 position;
  in vec2 uv;

  out vec2 vUv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`;

const FULLSCREEN_VERTEX = `
  in vec3 position;
  in vec2 uv;

  out vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const DISC_FRAGMENT = `
  precision highp float;
  precision highp int;

  uniform float uTime;
  uniform sampler2D uNoiseTexture;
  uniform vec3 uInnerColor;
  uniform vec3 uOuterColor;

  in vec2 vUv;

  layout(location = 0) out vec4 pc_FragColor;

  float inverseLerp(float value, float minimum, float maximum) {
    return (value - minimum) / (maximum - minimum);
  }

  vec3 blendAdd(vec3 base, vec3 blend) {
    return min(base + blend, vec3(1.0));
  }

  void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    float iterations = 3.0;

    for (float index = 0.0; index < iterations; index++) {
      float progress = index / (iterations - 1.0);
      float intensity = 1.0 - ((vUv.y - progress) * iterations) * 0.5;
      intensity = smoothstep(0.0, 1.0, intensity);

      vec2 sampleUv = vUv;
      sampleUv.y *= 2.0;
      sampleUv.x += uTime / ((index * 10.0) + 1.0);

      vec3 ringColor = mix(uInnerColor, uOuterColor, progress);
      float noiseIntensity = texture(uNoiseTexture, sampleUv).r;
      ringColor = mix(
        vec3(0.0),
        ringColor,
        noiseIntensity * intensity * 0.34
      );
      color.rgb = blendAdd(color.rgb, ringColor);
    }

    float edgeAttenuation = min(
      inverseLerp(vUv.y, 0.0, 0.02),
      inverseLerp(vUv.y, 1.0, 0.5)
    );
    color.rgb = mix(vec3(0.0), color.rgb, edgeAttenuation);
    pc_FragColor = color;
  }
`;

const PARTICLE_VERTEX = `
  #define PI 3.1415926538

  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform float uTime;
  uniform vec3 uInnerColor;
  uniform vec3 uOuterColor;
  uniform float uViewHeight;
  uniform float uSize;

  in float position;
  in float aSize;
  in float aRandom;

  out vec3 vColor;

  void main() {
    float concentration = 0.05;
    float outerProgress = smoothstep(0.0, 1.0, position);
    outerProgress = mix(concentration, outerProgress, pow(aRandom, 1.7));
    float radius = 1.0 + outerProgress * 7.5;
    float angle = outerProgress - uTime * mix(3.0, 0.08, outerProgress);
    float inclination =
      (aRandom - 0.5) * smoothstep(0.3, 1.0, outerProgress);

    vec3 newPosition = vec3(
      sin(angle) * radius,
      sin(angle * 0.72 + aRandom * PI * 2.0) * radius * inclination * 0.22,
      cos(angle) * radius
    );
    vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    gl_PointSize = aSize * uSize * uViewHeight;
    gl_PointSize *= 1.0 / -modelViewPosition.z;
    vColor = mix(uInnerColor, uOuterColor, outerProgress);
  }
`;

const PARTICLE_FRAGMENT = `
  precision highp float;
  precision highp int;

  in vec3 vColor;

  layout(location = 0) out vec4 pc_FragColor;

  void main() {
    if (length(gl_PointCoord - vec2(0.5)) > 0.5) {
      discard;
    }
    pc_FragColor = vec4(vColor, 0.28);
  }
`;

const DISTORTION_FRAGMENT = `
  precision highp float;
  precision highp int;

  in vec2 vUv;

  layout(location = 0) out vec4 pc_FragColor;

  float remap(
    float value,
    float inputMinimum,
    float inputMaximum,
    float outputMinimum,
    float outputMaximum
  ) {
    float progress = (value - inputMinimum) / (inputMaximum - inputMinimum);
    return mix(outputMinimum, outputMaximum, progress);
  }

  void main() {
    float distanceToCenter = length(vUv - 0.5);
    float strength = remap(distanceToCenter, 0.0, 0.15, 1.0, 0.0);
    strength = smoothstep(0.0, 1.0, strength);
    pc_FragColor = vec4(strength, 1.0, 1.0, 1.0);
  }
`;

const DISTORTION_MASK_FRAGMENT = `
  precision highp float;
  precision highp int;

  in vec2 vUv;

  layout(location = 0) out vec4 pc_FragColor;

  float remap(
    float value,
    float inputMinimum,
    float inputMaximum,
    float outputMinimum,
    float outputMaximum
  ) {
    float progress = (value - inputMinimum) / (inputMaximum - inputMinimum);
    return mix(outputMinimum, outputMaximum, progress);
  }

  void main() {
    float distanceToCenter = length(vUv - 0.5);
    float radialStrength = remap(distanceToCenter, 0.0, 0.15, 1.0, 0.0);
    radialStrength = smoothstep(0.0, 1.0, radialStrength);
    float alpha = smoothstep(
      0.0,
      1.0,
      remap(distanceToCenter, 0.4, 0.5, 1.0, 0.0)
    );
    pc_FragColor = vec4(radialStrength, 0.0, 0.0, alpha);
  }
`;

const FINAL_FRAGMENT = `
  #define PI 3.1415926538

  precision highp float;
  precision highp int;

  in vec2 vUv;

  uniform sampler2D uSpaceTexture;
  uniform sampler2D uDistortionTexture;
  uniform vec2 uBlackHolePosition;
  uniform float uRGBShiftRadius;

  layout(location = 0) out vec4 pc_FragColor;

  vec3 getRGBShiftedColor(sampler2D sourceTexture, vec2 sourceUv, float radius) {
    vec3 angle = vec3(PI * 2.0 / 3.0, PI * 4.0 / 3.0, 0.0);
    vec3 color = vec3(0.0);
    color.r = texture(
      sourceTexture,
      sourceUv + vec2(sin(angle.r) * radius, cos(angle.r) * radius)
    ).r;
    color.g = texture(
      sourceTexture,
      sourceUv + vec2(sin(angle.g) * radius, cos(angle.g) * radius)
    ).g;
    color.b = texture(
      sourceTexture,
      sourceUv + vec2(sin(angle.b) * radius, cos(angle.b) * radius)
    ).b;
    return color;
  }

  void main() {
    float distortion = texture(uDistortionTexture, vUv).r;
    vec2 towardCenter = vUv - uBlackHolePosition;
    towardCenter *= -distortion * 2.0;
    vec3 color = getRGBShiftedColor(
      uSpaceTexture,
      vUv + towardCenter,
      uRGBShiftRadius
    );
    float intensity = max(max(color.r, color.g), color.b);
    float eventHorizon =
      1.0 - smoothstep(0.06, 0.115, length(vUv - uBlackHolePosition));
    vec2 edgeDistance = abs(vUv - 0.5);
    float outerFade =
      1.0 - smoothstep(0.42, 0.5, max(edgeDistance.x, edgeDistance.y));
    float alpha = max(eventHorizon, smoothstep(0.004, 0.08, intensity));
    alpha *= outerFade;
    pc_FragColor = vec4(color, alpha);
  }
`;

function createNoiseTexture() {
  const size = 128;
  const values = new Uint8Array(size * size * 4);

  for (let index = 0; index < size * size; index++) {
    const value = Math.floor(Math.random() * 256);
    values[index * 4] = value;
    values[index * 4 + 1] = value;
    values[index * 4 + 2] = value;
    values[index * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(values, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

interface BlackHoleGateProps {
  view: {
    current: {
      rotationX: number;
      rotationY: number;
      zoom: number;
    };
  };
}

export default function BlackHoleGate({ view }: BlackHoleGateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        premultipliedAlpha: false,
      });
    } catch {
      return;
    }

    const spaceScene = new THREE.Scene();
    const distortionScene = new THREE.Scene();
    const finalScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(7.4, 3, 7.4);
    camera.lookAt(0, 0, 0);

    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;

    const innerColor = new THREE.Color("#8fae3d");
    const outerColor = new THREE.Color("#1c746c");
    const noiseTexture = createNoiseTexture();

    const discMaterial = new THREE.RawShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fragmentShader: DISC_FRAGMENT,
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uInnerColor: { value: innerColor },
        uNoiseTexture: { value: noiseTexture },
        uOuterColor: { value: outerColor },
        uTime: { value: 0 },
      },
      vertexShader: MODEL_VERTEX,
    });
    const discGeometry = new THREE.CylinderGeometry(5, 1, 0, 64, 10, true);
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    spaceScene.add(disc);

    // ponytail: Gate-sized density; raise only if the gate becomes full-screen.
    const particleCount = 8_000;
    const particlePositions = new Float32Array(particleCount);
    const particleSizes = new Float32Array(particleCount);
    const particleRandomness = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index++) {
      particlePositions[index] = Math.random();
      particleSizes[index] = Math.random();
      particleRandomness[index] = Math.random();
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 1),
    );
    particleGeometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(particleSizes, 1),
    );
    particleGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(particleRandomness, 1),
    );
    const particleMaterial = new THREE.RawShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fragmentShader: PARTICLE_FRAGMENT,
      glslVersion: THREE.GLSL3,
      transparent: true,
      uniforms: {
        uInnerColor: { value: innerColor },
        uOuterColor: { value: outerColor },
        uSize: { value: 0.012 },
        uTime: { value: 0 },
        uViewHeight: { value: 360 },
      },
      vertexShader: PARTICLE_VERTEX,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.frustumCulled = false;
    spaceScene.add(particles);

    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const distortionMaterial = new THREE.RawShaderMaterial({
      fragmentShader: DISTORTION_FRAGMENT,
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      transparent: true,
      vertexShader: MODEL_VERTEX,
    });
    const distortion = new THREE.Mesh(planeGeometry, distortionMaterial);
    distortion.scale.setScalar(10);
    distortion.lookAt(camera.position);
    distortion.renderOrder = 0;
    distortionScene.add(distortion);

    const maskMaterial = new THREE.RawShaderMaterial({
      fragmentShader: DISTORTION_MASK_FRAGMENT,
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      transparent: true,
      vertexShader: MODEL_VERTEX,
    });
    const mask = new THREE.Mesh(planeGeometry, maskMaterial);
    mask.scale.setScalar(10);
    mask.rotation.x = Math.PI * 0.5;
    mask.renderOrder = 1;
    distortionScene.add(mask);

    const spaceTarget = new THREE.WebGLRenderTarget(1, 1, {
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
    });
    const distortionTarget = new THREE.WebGLRenderTarget(1, 1, {
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
    });
    const finalMaterial = new THREE.RawShaderMaterial({
      depthTest: false,
      depthWrite: false,
      fragmentShader: FINAL_FRAGMENT,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uBlackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
        uDistortionTexture: { value: distortionTarget.texture },
        uRGBShiftRadius: { value: 0.00001 },
        uSpaceTexture: { value: spaceTarget.texture },
      },
      vertexShader: FULLSCREEN_VERTEX,
    });
    const finalGeometry = new THREE.PlaneGeometry(2, 2);
    const finalPlane = new THREE.Mesh(finalGeometry, finalMaterial);
    finalPlane.frustumCulled = false;
    finalScene.add(finalPlane);

    const projectedCenter = new THREE.Vector3();
    let animationFrame = 0;

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);
      const pixelWidth = Math.max(1, Math.floor(width * pixelRatio));
      const pixelHeight = Math.max(1, Math.floor(height * pixelRatio));

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      spaceTarget.setSize(pixelWidth, pixelHeight);
      distortionTarget.setSize(
        Math.max(1, Math.floor(pixelWidth * 0.5)),
        Math.max(1, Math.floor(pixelHeight * 0.5)),
      );
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      particleMaterial.uniforms.uViewHeight.value = pixelHeight;
    };

    const draw = (frameTime: number) => {
      const time = frameTime * 0.001;
      const galaxyView = view.current;
      const pitch = 0.28 + (galaxyView.rotationX + 0.12) * 0.7;
      const zoomDistance =
        10.8 * Math.pow(680 / galaxyView.zoom, 0.45);
      const tiltFit =
        1 + Math.max(0, Math.abs(Math.sin(pitch)) - 0.3) * 1.05;
      const distance = THREE.MathUtils.clamp(
        zoomDistance * tiltFit,
        10.2,
        17.5,
      );
      const yaw = Math.PI * 0.25 + (galaxyView.rotationY + 0.45) * 0.55;
      const roll = THREE.MathUtils.clamp(
        (galaxyView.rotationY + 0.45) * 0.18,
        -0.3,
        0.3,
      );

      camera.position.set(
        Math.sin(yaw) * Math.cos(pitch) * distance,
        Math.sin(pitch) * distance,
        Math.cos(yaw) * Math.cos(pitch) * distance,
      );
      camera.up.set(Math.sin(roll), Math.cos(roll), 0);
      camera.lookAt(0, 0, 0);
      distortion.lookAt(camera.position);
      discMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uTime.value = time + 9999;
      projectedCenter.set(0, 0, 0).project(camera);
      finalMaterial.uniforms.uBlackHolePosition.value.set(
        projectedCenter.x * 0.5 + 0.5,
        projectedCenter.y * 0.5 + 0.5,
      );

      renderer.setRenderTarget(spaceTarget);
      renderer.clear();
      renderer.render(spaceScene, camera);
      renderer.setRenderTarget(distortionTarget);
      renderer.clear();
      renderer.render(distortionScene, camera);
      renderer.setRenderTarget(null);
      renderer.render(finalScene, camera);
    };

    const animate = (frameTime: number) => {
      draw(frameTime);
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    draw(0);
    canvas.dataset.ready = "true";

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      delete canvas.dataset.ready;
      discGeometry.dispose();
      discMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      planeGeometry.dispose();
      distortionMaterial.dispose();
      maskMaterial.dispose();
      finalGeometry.dispose();
      finalMaterial.dispose();
      noiseTexture.dispose();
      spaceTarget.dispose();
      distortionTarget.dispose();
      renderer.dispose();
    };
  }, [view]);

  return (
    <canvas
      ref={canvasRef}
      className="galaxy-gate-render"
      aria-hidden="true"
    />
  );
}
