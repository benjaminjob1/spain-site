"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Calc = {
  roomLength: number;
  roomWidth: number;
  roomHeight: number;
  screenDiag: number;
  numRows: number;
  seatsPerRow: number;
};

const DEFAULT: Calc = {
  roomLength: 6,
  roomWidth: 4,
  roomHeight: 2.7,
  screenDiag: 120,
  numRows: 2,
  seatsPerRow: 4,
};

// 7.1.4 Atmos layout (angles in degrees from MLP, 0 = front)
const SPEAKER_POSITIONS = [
  { id: "L", label: "Front Left", angle: -30, height: 1.2, color: 0xc8451f },
  { id: "C", label: "Centre", angle: 0, height: 1.2, color: 0xc8451f },
  { id: "R", label: "Front Right", angle: 30, height: 1.2, color: 0xc8451f },
  { id: "SL", label: "Side Left", angle: -90, height: 1.5, color: 0xd4a843 },
  { id: "SR", label: "Side Right", angle: 90, height: 1.5, color: 0xd4a843 },
  { id: "BL", label: "Back Left", angle: -150, height: 1.5, color: 0xd4a843 },
  { id: "BR", label: "Back Right", angle: 150, height: 1.5, color: 0xd4a843 },
  // height channels (Atmos) - on ceiling
  { id: "TFL", label: "Top Front Left", angle: -30, height: -1, color: 0x6b5d52, ceiling: true },
  { id: "TFR", label: "Top Front Right", angle: 30, height: -1, color: 0x6b5d52, ceiling: true },
  { id: "TBL", label: "Top Back Left", angle: -135, height: -1, color: 0x6b5d52, ceiling: true },
  { id: "TBR", label: "Top Back Right", angle: 135, height: -1, color: 0x6b5d52, ceiling: true },
];

export default function Cinema3D({ calc }: { calc: Calc }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isOrbiting, setIsOrbiting] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = 500;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // --- Orbit controls (manual since we don't add drei) ---
    let theta = Math.PI / 4; // azimuth
    let phi = Math.PI / 4; // polar
    let radius = calc.roomLength * 1.2;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    const updateCamera = () => {
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.set(x, y, z);
      camera.lookAt(0, calc.roomHeight / 2, 0);
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      setIsOrbiting(false);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      theta -= dx * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * 0.005));
      lastX = e.clientX;
      lastY = e.clientY;
      updateCamera();
    };
    const onPointerUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(2, Math.min(20, radius + e.deltaY * 0.005));
      updateCamera();
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    updateCamera();

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spot = new THREE.SpotLight(0xffffff, 0.8);
    spot.position.set(0, calc.roomHeight, 2);
    spot.target.position.set(0, 0, -calc.roomLength / 2);
    scene.add(spot);
    scene.add(spot.target);

    // --- Room (floor, ceiling, walls) ---
    const roomGroup = new THREE.Group();

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(calc.roomWidth, 0.05, calc.roomLength),
      new THREE.MeshStandardMaterial({ color: 0x2a2d38, roughness: 0.8 })
    );
    floor.position.y = 0;
    roomGroup.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(calc.roomWidth, 0.05, calc.roomLength),
      new THREE.MeshStandardMaterial({ color: 0x1f1a17, roughness: 0.9 })
    );
    ceiling.position.y = calc.roomHeight;
    roomGroup.add(ceiling);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x6b5d52, roughness: 0.9 });

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(calc.roomWidth, calc.roomHeight, 0.05),
      wallMat
    );
    backWall.position.set(0, calc.roomHeight / 2, -calc.roomLength / 2);
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, calc.roomHeight, calc.roomLength),
      wallMat
    );
    leftWall.position.set(-calc.roomWidth / 2, calc.roomHeight / 2, 0);
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, calc.roomHeight, calc.roomLength),
      wallMat
    );
    rightWall.position.set(calc.roomWidth / 2, calc.roomHeight / 2, 0);
    roomGroup.add(rightWall);

    // --- Screen (on front wall, opposite from MLP) ---
    const screenWidth = (calc.screenDiag * 0.0254 * 16) / Math.sqrt(16 * 16 + 9 * 9);
    const screenHeight = screenWidth * (9 / 16);
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(screenWidth, screenHeight, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x222222 })
    );
    screen.position.set(0, screenHeight / 2 + 0.3, calc.roomLength / 2 - 0.05);
    roomGroup.add(screen);

    // --- MLP + seats ---
    const mlpDist = (calc.roomLength * 2) / 3;
    const mlpZ = calc.roomLength / 2 - mlpDist;

    // MLP marker (golden sphere)
    const mlp = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4a843, emissive: 0x553311 })
    );
    mlp.position.set(0, 1.2, mlpZ);
    roomGroup.add(mlp);

    // Seating rows
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xc8451f });
    for (let r = 0; r < calc.numRows; r++) {
      const rowZ = mlpZ + (r - (calc.numRows - 1) / 2) * 1.1;
      for (let s = 0; s < calc.seatsPerRow; s++) {
        const seatX = (s - (calc.seatsPerRow - 1) / 2) * 0.7;
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          seatMat
        );
        seat.position.set(seatX, 0.25, rowZ);
        roomGroup.add(seat);
      }
    }

    // --- Speakers (7.1.4 Atmos) ---
    const speakerRadius = mlpDist * 0.7;
    SPEAKER_POSITIONS.forEach((sp) => {
      const rad = (sp.angle * Math.PI) / 180;
      const x = speakerRadius * Math.sin(rad);
      const z = mlpZ - speakerRadius * Math.cos(rad);
      const y = sp.ceiling ? calc.roomHeight - 0.1 : sp.height;
      const speaker = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshStandardMaterial({ color: sp.color, emissive: sp.color, emissiveIntensity: 0.3 })
      );
      speaker.position.set(x, y, z);
      roomGroup.add(speaker);

      // Label (using Sprite with canvas texture)
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1f1a17";
      ctx.fillRect(0, 0, 128, 64);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sp.id, 64, 32);
      const texture = new THREE.CanvasTexture(canvas);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
      label.scale.set(0.3, 0.15, 1);
      label.position.set(x, y + 0.2, z);
      roomGroup.add(label);
    });

    // --- Subwoofer pair (front wall, on floor) ---
    [-0.8, 0.8].forEach((sx) => {
      const sub = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.5, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x6b5d52 })
      );
      sub.position.set(sx, 0.25, calc.roomLength / 2 - 0.3);
      roomGroup.add(sub);
    });

    scene.add(roomGroup);

    // --- Animation loop ---
    let frameId = 0;
    let autoRotate = true;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging) {
        theta += 0.003;
        updateCamera();
      }
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize handler ---
    const onResize = () => {
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      // Dispose geometries/materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [calc, isOrbiting]);

  return (
    <div className="space-y-3">
      <div
        ref={mountRef}
        className="w-full rounded-xl border bg-surface overflow-hidden"
        style={{ height: 500, cursor: "grab" }}
        onClick={() => setIsOrbiting((v) => !v)}
      />
      <div className="flex justify-between items-center text-xs text-muted">
        <span>
          {isOrbiting ? "🔄 Auto-rotating — click to stop" : "🖱️ Drag to rotate · scroll to zoom · click to resume auto-rotate"}
        </span>
        <span>
          🎨 LCR orange · surrounds gold · height channels grey · subs dark
        </span>
      </div>
    </div>
  );
}