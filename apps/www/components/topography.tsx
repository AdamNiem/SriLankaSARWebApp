'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export default function Topography() {
  // Explicitly type the ref as an HTMLDivElement or null
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0d8ef);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 200, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const loader = new STLLoader();
    loader.load('/models/terrain.stl', (geometry: THREE.BufferGeometry) => {
      geometry.computeVertexNormals();

      const position = geometry.getAttribute('position') as THREE.BufferAttribute;
      const box = new THREE.Box3().setFromBufferAttribute(position);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      geometry.translate(-center.x, -center.y, -center.z);

      const colors: number[] = [];
      let minZ = Infinity, maxZ = -Infinity;
      for (let i = 0; i < position.count; i++) {
        const z = position.getZ(i);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
      for (let i = 0; i < position.count; i++) {
        const z = position.getZ(i);
        const t = (z - minZ) / (maxZ - minZ);
        const color = new THREE.Color().setHSL(0.6 - 0.6 * t, 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
      }
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);

      camera.position.set(0, maxDim * 0.5, maxDim * 0.75);
      controls.target.set(0, 0, 0);
      controls.update();
    });

    const resizeObserver = new ResizeObserver(() => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(mount);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '300px',
        maxHeight: '600px',
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    />
  );
}
