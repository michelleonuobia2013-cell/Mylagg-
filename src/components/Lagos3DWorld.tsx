import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Zap,
  Play,
  Volume2,
  Maximize2,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Hand,
  Send,
  Navigation,
  Landmark,
  Film,
  Flame,
  Briefcase,
  Home as HomeIcon,
  ShoppingBag
} from 'lucide-react';
import { playTapSound, playCoinSound } from '../utils/audio';
import { speakText } from '../utils/speech';
import { FormatNaira } from './NairaSign';

interface OtherPlayer {
  id: string;
  name: string;
  level: number;
  activity: string;
  chatBubble?: string;
  chatTimer?: number;
  mesh?: THREE.Group;
  targetPos: THREE.Vector3;
  color: number;
  hairColor: number;
  isDancing?: boolean;
}

interface InteractiveObject {
  id: string;
  name: string;
  actionText: string;
  pos: THREE.Vector3;
  radius: number;
  type: 'atm' | 'cinema' | 'danfo' | 'suya' | 'tech' | 'housing' | 'market';
  color: string;
}

interface Lagos3DWorldProps {
  onOpenATM: () => void;
  onOpenCinema: () => void;
  onOpenHousing: () => void;
  onOpenMarket: () => void;
  onOpenDungeons: () => void;
  onEarnCash: (naira: number) => void;
  playerUsername: string;
  playerLevel: number;
  balanceNaira: number;
}

export const Lagos3DWorld: React.FC<Lagos3DWorldProps> = ({
  onOpenATM,
  onOpenCinema,
  onOpenHousing,
  onOpenMarket,
  onOpenDungeons,
  onEarnCash,
  playerUsername,
  playerLevel,
  balanceNaira,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nearbyInteraction, setNearbyInteraction] = useState<InteractiveObject | null>(null);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [playerSpeech, setPlayerSpeech] = useState<string>('');
  const [activeEmote, setActiveEmote] = useState<'walk' | 'idle' | 'dance' | 'wave'>('idle');
  const [joystickActive, setJoystickActive] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Tunde_Lekki', text: 'Just withdrew ₦25,000 at the GTBank ATM! Quick settlement!', time: '10:41' },
    { sender: 'Amina_VI', text: 'Who is watching The Lagos Heist in Movie Box? +₦360/min!', time: '10:42' },
    { sender: 'Chidi_Tech', text: 'Catch me at Computer Village coding fintech smart contracts!', time: '10:43' },
  ]);

  // Keys ref
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const joystickVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080e1c);
    scene.fog = new THREE.FogExp2(0x080e1c, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 14, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x2d3748, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    scene.add(dirLight);

    // Neon Street Atmosphere
    const purpleLight = new THREE.PointLight(0xa855f7, 3.5, 40);
    purpleLight.position.set(-15, 6, -10);
    scene.add(purpleLight);

    const yellowLight = new THREE.PointLight(0xfacc15, 4.0, 45);
    yellowLight.position.set(15, 6, 10);
    scene.add(yellowLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3.0, 35);
    cyanLight.position.set(0, 6, -20);
    scene.add(cyanLight);

    // 3. Ground / Lagos Asphalt & Sidewalks
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road Grid Lines
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(18, 160), roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.01;
    mainRoad.receiveShadow = true;
    scene.add(mainRoad);

    const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(160, 18), roadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.y = 0.015;
    crossRoad.receiveShadow = true;
    scene.add(crossRoad);

    // Yellow Road Center Stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = -70; i <= 70; i += 10) {
      const stripe1 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 5), stripeMat);
      stripe1.rotation.x = -Math.PI / 2;
      stripe1.position.set(0, 0.02, i);
      scene.add(stripe1);

      const stripe2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.8), stripeMat);
      stripe2.rotation.x = -Math.PI / 2;
      stripe2.position.set(i, 0.02, 0);
      scene.add(stripe2);
    }

    // 4. Interactive Landmarks & 3D Structures
    const interactiveList: InteractiveObject[] = [
      {
        id: 'atm_hub',
        name: 'GTBank ATM Cashout Center',
        actionText: '💸 Press E to Cashout Real ₦ to Bank',
        pos: new THREE.Vector3(-18, 0, 12),
        radius: 4.5,
        type: 'atm',
        color: '#10b981',
      },
      {
        id: 'cinema_box',
        name: 'Nollywood Movie Box Palace',
        actionText: '🎬 Press E to Enter Movie Box & Stream Earn',
        pos: new THREE.Vector3(-18, 0, -18),
        radius: 5.5,
        type: 'cinema',
        color: '#ef4444',
      },
      {
        id: 'danfo_stop',
        name: 'Oshodi Danfo Bus Terminal',
        actionText: '🚌 Press E to Ride Danfo Rush (+₦2,500)',
        pos: new THREE.Vector3(18, 0, 14),
        radius: 5.0,
        type: 'danfo',
        color: '#facc15',
      },
      {
        id: 'suya_stand',
        name: 'Mallam Garba Suya Grill Spot',
        actionText: '🔥 Press E to Grill Suya Skewer (+₦3,500)',
        pos: new THREE.Vector3(16, 0, -8),
        radius: 4.2,
        type: 'suya',
        color: '#f97316',
      },
      {
        id: 'tech_village',
        name: 'Computer Village Tech Hub',
        actionText: '💻 Press E to Code & Earn Tech Equity',
        pos: new THREE.Vector3(0, 0, -28),
        radius: 5.5,
        type: 'tech',
        color: '#06b6d4',
      },
      {
        id: 'housing_villa',
        name: 'Lekki Penthouse Life Together',
        actionText: '🏡 Press E to Visit Home & Pets',
        pos: new THREE.Vector3(26, 0, -24),
        radius: 5.0,
        type: 'housing',
        color: '#a855f7',
      },
      {
        id: 'market_stalls',
        name: 'Balogun Wholesale Market',
        actionText: '🛍️ Press E to Trade Rare Gear in Escrow',
        pos: new THREE.Vector3(-28, 0, 0),
        radius: 5.0,
        type: 'market',
        color: '#3b82f6',
      },
    ];

    // Build 3D models for each landmark
    // Landmark A: ATM Financial Tower
    const atmGroup = new THREE.Group();
    atmGroup.position.copy(interactiveList[0].pos);
    const atmTower = new THREE.Mesh(
      new THREE.BoxGeometry(7, 12, 7),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.8, roughness: 0.2 })
    );
    atmTower.position.y = 6;
    atmTower.castShadow = true;
    atmTower.receiveShadow = true;
    atmGroup.add(atmTower);

    // Glowing ATM screen
    const atmScreen = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    atmScreen.position.set(0, 4, 3.6);
    atmGroup.add(atmScreen);

    // ATM Hologram sign
    const atmSign = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.4, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true })
    );
    atmSign.position.set(0, 13, 0);
    atmGroup.add(atmSign);
    scene.add(atmGroup);

    // Landmark B: Movie Box Cinema Palace
    const cinemaGroup = new THREE.Group();
    cinemaGroup.position.copy(interactiveList[1].pos);
    const cinemaBldg = new THREE.Mesh(
      new THREE.BoxGeometry(10, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x450a0a, metalness: 0.6, roughness: 0.3 })
    );
    cinemaBldg.position.y = 7;
    cinemaBldg.castShadow = true;
    cinemaBldg.receiveShadow = true;
    cinemaGroup.add(cinemaBldg);

    // Giant Screen on Cinema
    const screenGeo = new THREE.PlaneGeometry(7, 4.5);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 8, 5.05);
    cinemaGroup.add(screenMesh);

    // Marquee Sign
    const marquee = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.5, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    marquee.position.set(0, 12, 5.1);
    cinemaGroup.add(marquee);
    scene.add(cinemaGroup);

    // Landmark C: Danfo Bus Stop & 3D Danfo Minibus
    const danfoGroup = new THREE.Group();
    danfoGroup.position.copy(interactiveList[2].pos);
    // Yellow Danfo Bus Body
    const danfoBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4, roughness: 0.4 })
    );
    danfoBody.position.y = 2.2;
    danfoBody.castShadow = true;
    danfoGroup.add(danfoBody);

    // Black stripes (classic Lagos Danfo)
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(4.55, 0.6, 7.8),
      new THREE.MeshBasicMaterial({ color: 0x020617 })
    );
    stripe.position.y = 2.2;
    danfoGroup.add(stripe);

    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 12);
    [
      [-2.1, 0.7, 2.2],
      [2.1, 0.7, 2.2],
      [-2.1, 0.7, -2.2],
      [2.1, 0.7, -2.2],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      danfoGroup.add(wheel);
    });
    scene.add(danfoGroup);

    // Landmark D: Suya Grill Spot
    const suyaGroup = new THREE.Group();
    suyaGroup.position.copy(interactiveList[3].pos);
    const grillBox = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.6, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 })
    );
    grillBox.position.y = 1.0;
    grillBox.castShadow = true;
    suyaGroup.add(grillBox);

    // Hot glowing coal bed
    const coals = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xea580c })
    );
    coals.rotation.x = -Math.PI / 2;
    coals.position.y = 1.85;
    suyaGroup.add(coals);
    scene.add(suyaGroup);

    // Landmark E: Computer Village Tech Hub
    const techGroup = new THREE.Group();
    techGroup.position.copy(interactiveList[4].pos);
    const techTower = new THREE.Mesh(
      new THREE.BoxGeometry(11, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x082f49, metalness: 0.7, roughness: 0.2 })
    );
    techTower.position.y = 8;
    techTower.castShadow = true;
    techGroup.add(techTower);

    // Circuit glow bands
    const glowBand = new THREE.Mesh(
      new THREE.BoxGeometry(11.2, 0.6, 8.2),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    glowBand.position.y = 10;
    techGroup.add(glowBand);
    scene.add(techGroup);

    // Landmark F: Lekki Penthouse
    const penthouseGroup = new THREE.Group();
    penthouseGroup.position.copy(interactiveList[5].pos);
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(9, 10, 9),
      new THREE.MeshStandardMaterial({ color: 0x3b0764, metalness: 0.5, roughness: 0.4 })
    );
    house.position.y = 5;
    house.castShadow = true;
    penthouseGroup.add(house);
    scene.add(penthouseGroup);

    // Landmark G: Balogun Market
    const marketGroup = new THREE.Group();
    marketGroup.position.copy(interactiveList[6].pos);
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 })
    );
    canopy.position.y = 4.5;
    canopy.rotation.y = Math.PI / 4;
    marketGroup.add(canopy);
    scene.add(marketGroup);

    // 5. Construct Player Avatar (The Purple-Haired Tomboy from User Request)
    // 3-12 composite part humanoid with animated limbs
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 0);

    // Shadow blob
    const shadowBlob = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
    );
    shadowBlob.rotation.x = -Math.PI / 2;
    shadowBlob.position.y = 0.03;
    playerGroup.add(shadowBlob);

    // Torso (Yellow & Emerald jacket patches)
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 })
    );
    torso.position.y = 2.0;
    torso.castShadow = true;
    playerGroup.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.8 })
    );
    head.position.y = 3.15;
    head.castShadow = true;
    playerGroup.add(head);

    // Purple Tomboy Spiky Hair
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.6, 0.95),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 })
    );
    hair.position.y = 3.6;
    playerGroup.add(hair);

    // Cap Visor
    const capVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.15, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xfacc15 })
    );
    capVisor.position.set(0, 3.4, 0.55);
    playerGroup.add(capVisor);

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), armMat);
    leftArm.position.set(-0.8, 2.0, 0);
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), armMat);
    rightArm.position.set(0.8, 2.0, 0);
    playerGroup.add(rightArm);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.3, 0.4), legMat);
    leftLeg.position.set(-0.35, 0.65, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.3, 0.4), legMat);
    rightLeg.position.set(0.35, 0.65, 0);
    playerGroup.add(rightLeg);

    scene.add(playerGroup);

    // 6. Other Players (Visible to each other, with distinct activities)
    const otherPlayersData: OtherPlayer[] = [
      {
        id: 'p1',
        name: 'Tunde_Lekki',
        level: 18,
        activity: '💸 Withdrawing ₦ at GTBank ATM',
        chatBubble: '₦25,000 cashout successful!',
        targetPos: new THREE.Vector3(-15, 0, 10),
        color: 0x10b981,
        hairColor: 0x38bdf8,
      },
      {
        id: 'p2',
        name: 'Amina_VI',
        level: 14,
        activity: '🍿 Watching Nollywood Movie Box',
        chatBubble: 'Chai! Action pass Hollywood!',
        targetPos: new THREE.Vector3(-14, 0, -15),
        color: 0xef4444,
        hairColor: 0xf43f5e,
      },
      {
        id: 'p3',
        name: 'Chidi_Tech',
        level: 21,
        activity: '💻 Coding at Computer Village',
        chatBubble: 'Deploying Lagos smart contract 🚀',
        targetPos: new THREE.Vector3(2, 0, -22),
        color: 0x06b6d4,
        hairColor: 0xeab308,
      },
      {
        id: 'p4',
        name: 'Bisi_Balogun',
        level: 9,
        activity: '🔥 Grilling Suya Skewers',
        chatBubble: 'Yaji pepper is extra spicy today!',
        targetPos: new THREE.Vector3(13, 0, -6),
        color: 0xf97316,
        hairColor: 0xa855f7,
        isDancing: true,
      },
    ];

    // Build meshes for other players
    otherPlayersData.forEach((p) => {
      const g = new THREE.Group();
      g.position.copy(p.targetPos);

      // Torso
      const t = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.3, 0.75),
        new THREE.MeshStandardMaterial({ color: p.color })
      );
      t.position.y = 1.9;
      g.add(t);

      // Head
      const h = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xd97706 })
      );
      h.position.y = 2.95;
      g.add(h);

      // Hair
      const hr = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.4, 0.85),
        new THREE.MeshStandardMaterial({ color: p.hairColor })
      );
      hr.position.y = 3.35;
      g.add(hr);

      // Legs
      const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), legMat);
      l1.position.set(-0.3, 0.6, 0);
      g.add(l1);

      const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), legMat);
      l2.position.set(0.3, 0.6, 0);
      g.add(l2);

      p.mesh = g;
      scene.add(g);
    });

    // 7. Input Event Listeners (Keyboard WASD & Touch)
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.code === 'Space') {
        // Jump
        if (playerVelocityY === 0) {
          playerVelocityY = 0.24;
        }
      }
      if (e.key.toLowerCase() === 'e') {
        // Trigger interaction
        handleTriggerNearby();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Physics variables
    let playerVelocityY = 0;
    const playerSpeed = 0.22;
    let walkClock = 0;

    // Trigger Nearby helper
    const handleTriggerNearby = () => {
      for (const item of interactiveList) {
        const dist = playerGroup.position.distanceTo(item.pos);
        if (dist <= item.radius) {
          playCoinSound();
          if (item.type === 'atm') {
            speakText('Opening GTBank ATM Cashout Portal.');
            onOpenATM();
          } else if (item.type === 'cinema') {
            speakText('Welcome to Nollywood Movie Box! Earning Naira active.');
            onOpenCinema();
          } else if (item.type === 'housing') {
            speakText('Entering your Life Together Penthouse.');
            onOpenHousing();
          } else if (item.type === 'market') {
            speakText('Opening Balogun Wholesale Trading Marketplace.');
            onOpenMarket();
          } else if (item.type === 'danfo') {
            speakText('Danfo conductor shouted Oya enter with your change! Cash earned!');
            onEarnCash(2500);
          } else if (item.type === 'suya') {
            speakText('Mallam served hot suya! +₦3,500 tip credited to your balance!');
            onEarnCash(3500);
          } else if (item.type === 'tech') {
            speakText('Entering Computer Village Tech Dungeon!');
            onOpenDungeons();
          }
          break;
        }
      }
    };

    // 8. Main Animation & Game Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      walkClock += delta * 10;

      // Calculate Player Movement Vector from Keyboard or Virtual Joystick
      let moveX = 0;
      let moveZ = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) moveZ -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveZ += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;

      // Add touch joystick input
      if (joystickVector.current.x !== 0 || joystickVector.current.y !== 0) {
        moveX += joystickVector.current.x;
        moveZ += joystickVector.current.y;
      }

      const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;

      if (isMoving) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        const normX = (moveX / length) * playerSpeed;
        const normZ = (moveZ / length) * playerSpeed;

        playerGroup.position.x += normX;
        playerGroup.position.z += normZ;

        // Rotate player to face movement direction
        const targetAngle = Math.atan2(normX, normZ);
        playerGroup.rotation.y = THREE.MathUtils.damp(playerGroup.rotation.y, targetAngle, 12, delta);

        // Limb swinging walk cycle
        leftArm.rotation.x = Math.sin(walkClock) * 0.6;
        rightArm.rotation.x = -Math.sin(walkClock) * 0.6;
        leftLeg.rotation.x = -Math.sin(walkClock) * 0.7;
        rightLeg.rotation.x = Math.sin(walkClock) * 0.7;
      } else {
        // Idle breathing or dancing
        if (activeEmote === 'dance') {
          playerGroup.rotation.y += delta * 4;
          leftArm.rotation.z = Math.sin(walkClock * 1.5) * 0.8 + 0.5;
          rightArm.rotation.z = -Math.sin(walkClock * 1.5) * 0.8 - 0.5;
          torso.position.y = 2.0 + Math.abs(Math.sin(walkClock * 1.5)) * 0.25;
        } else {
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 8, delta);
          rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 8, delta);
          leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, delta);
          rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, delta);
        }
      }

      // Jump gravity physics
      if (playerVelocityY !== 0 || playerGroup.position.y > 0) {
        playerGroup.position.y += playerVelocityY;
        playerVelocityY -= 0.016; // gravity
        if (playerGroup.position.y <= 0) {
          playerGroup.position.y = 0;
          playerVelocityY = 0;
        }
      }

      // Camera smoothly follows player (Third-person Roblox camera)
      const targetCamX = playerGroup.position.x;
      const targetCamY = playerGroup.position.y + 11;
      const targetCamZ = playerGroup.position.z + 16;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 5, delta);
      camera.lookAt(playerGroup.position.x, playerGroup.position.y + 2, playerGroup.position.z);

      // Check proximity to landmarks
      let closest: InteractiveObject | null = null;
      let minDistance = Infinity;

      for (const item of interactiveList) {
        const d = playerGroup.position.distanceTo(item.pos);
        if (d < item.radius && d < minDistance) {
          closest = item;
          minDistance = d;
        }
      }
      setNearbyInteraction(closest);

      // Animate Other Players (Dancing, slight idle sway)
      otherPlayersData.forEach((p, index) => {
        if (!p.mesh) return;
        if (p.isDancing) {
          p.mesh.rotation.y += delta * 2;
          p.mesh.position.y = Math.abs(Math.sin(walkClock + index)) * 0.2;
        } else {
          p.mesh.position.y = Math.sin(walkClock * 0.5 + index) * 0.05;
        }
      });

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Window Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Send in-game chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    playTapSound();
    const newMsg = {
      sender: playerUsername,
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPlayerSpeech(chatMessage.trim());
    setChatLog((prev) => [...prev.slice(-6), newMsg]);
    setChatMessage('');

    // Clear player speech bubble after 5s
    setTimeout(() => {
      setPlayerSpeech('');
    }, 5000);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden bg-slate-950 border border-purple-900/50 shadow-2xl select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* 1. TOP OVERLAY HUD: District Title, Real Balances & Players Online */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
        <div className="px-3.5 py-2 rounded-2xl bg-[#090e1c]/85 border border-slate-700/80 backdrop-blur-md pointer-events-auto flex items-center gap-2.5 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="font-display font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
              LAGOS LIFE 3D
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-red-600 text-white rounded font-bold">
                ROBLOX MODE
              </span>
            </span>
            <span className="text-[10px] text-slate-300 block font-mono">
              Computer Village · Balogun · Lekki Corridor
            </span>
          </div>
        </div>

        {/* Players Online & Emotes Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/60 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>5 Citizens Live</span>
          </div>

          <button
            onClick={() => {
              playTapSound();
              setActiveEmote(activeEmote === 'dance' ? 'idle' : 'dance');
              speakText('Dancing to Amapiano in Lagos!');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              activeEmote === 'dance'
                ? 'bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-500/50'
                : 'bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeEmote === 'dance' ? 'Dancing!' : 'Dance'}</span>
          </button>
        </div>
      </div>

      {/* 2. OVERHEAD SPEECH BUBBLE OVER PLAYER */}
      {playerSpeech && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-white text-slate-950 font-bold text-xs shadow-2xl border-2 border-purple-500 animate-bounce pointer-events-none">
          <span className="font-black text-purple-700">@{playerUsername}: </span>
          <span>{playerSpeech}</span>
        </div>
      )}

      {/* 3. ROBLOX-STYLE INTERACTION PROMPT PILL (Appears when close to any landmark) */}
      {nearbyInteraction && (
        <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-bounce">
          <button
            onClick={() => {
              playCoinSound();
              if (nearbyInteraction.type === 'atm') onOpenATM();
              else if (nearbyInteraction.type === 'cinema') onOpenCinema();
              else if (nearbyInteraction.type === 'housing') onOpenHousing();
              else if (nearbyInteraction.type === 'market') onOpenMarket();
              else if (nearbyInteraction.type === 'danfo') onEarnCash(2500);
              else if (nearbyInteraction.type === 'suya') onEarnCash(3500);
              else if (nearbyInteraction.type === 'tech') onOpenDungeons();
            }}
            className="px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-2xl flex items-center gap-2.5 transition transform hover:scale-105 border-2 border-white/50 cursor-pointer"
            style={{ backgroundColor: nearbyInteraction.color }}
          >
            <Hand className="w-5 h-5" />
            <span>{nearbyInteraction.actionText}</span>
          </button>
        </div>
      )}

      {/* 4. ROBLOX VIRTUAL THUMBSTICK / TOUCH CONTROLLER (Mobile & Tablet) */}
      <div className="absolute bottom-5 left-5 z-20 flex flex-col items-center pointer-events-auto">
        <div className="text-[10px] font-mono text-slate-400 mb-1 font-bold">MOVE CONTROLS</div>
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700">
          <div />
          <button
            onPointerDown={() => {
              joystickVector.current = { x: 0, y: -1 };
              setJoystickActive(true);
            }}
            onPointerUp={() => {
              joystickVector.current = { x: 0, y: 0 };
              setJoystickActive(false);
            }}
            className="w-11 h-11 rounded-xl bg-slate-800 active:bg-purple-600 text-white flex items-center justify-center font-bold shadow transition"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onPointerDown={() => {
              joystickVector.current = { x: -1, y: 0 };
              setJoystickActive(true);
            }}
            onPointerUp={() => {
              joystickVector.current = { x: 0, y: 0 };
              setJoystickActive(false);
            }}
            className="w-11 h-11 rounded-xl bg-slate-800 active:bg-purple-600 text-white flex items-center justify-center font-bold shadow transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onPointerDown={() => {
              joystickVector.current = { x: 0, y: 1 };
              setJoystickActive(true);
            }}
            onPointerUp={() => {
              joystickVector.current = { x: 0, y: 0 };
              setJoystickActive(false);
            }}
            className="w-11 h-11 rounded-xl bg-slate-800 active:bg-purple-600 text-white flex items-center justify-center font-bold shadow transition"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            onPointerDown={() => {
              joystickVector.current = { x: 1, y: 0 };
              setJoystickActive(true);
            }}
            onPointerUp={() => {
              joystickVector.current = { x: 0, y: 0 };
              setJoystickActive(false);
            }}
            className="w-11 h-11 rounded-xl bg-slate-800 active:bg-purple-600 text-white flex items-center justify-center font-bold shadow transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 5. JUMP BUTTON & ROBLOX ACTION PAD (Right side) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            playTapSound();
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 active:scale-95 text-white font-black text-xs shadow-xl shadow-purple-950 flex flex-col items-center justify-center border-2 border-purple-400 transition"
        >
          <ArrowUp className="w-5 h-5" />
          <span>JUMP</span>
        </button>
      </div>

      {/* 6. LIVE MULTIPLAYER LAGOS CHAT STREAM & INPUT (Bottom Left / Center) */}
      <div className="absolute top-16 left-3 z-10 w-64 sm:w-72 max-h-36 overflow-y-auto rounded-2xl bg-black/65 backdrop-blur-md p-2.5 border border-slate-800 text-[11px] space-y-1.5 no-scrollbar pointer-events-auto">
        <div className="text-[10px] font-mono text-purple-400 font-bold uppercase flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>Lagos Street Chat</span>
        </div>
        {chatLog.slice(-3).map((msg, i) => (
          <div key={i} className="leading-tight text-slate-300">
            <span className="font-bold text-yellow-400">@{msg.sender}: </span>
            <span>{msg.text}</span>
          </div>
        ))}

        <form onSubmit={handleSendChat} className="flex gap-1 pt-1 border-t border-slate-800">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type Pidgin or message..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="p-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 7. QUICK DISTRICT TELEPORT BAR (Top Center) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md pointer-events-auto">
        <button
          onClick={onOpenATM}
          className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-400 text-xs font-semibold border border-emerald-800 flex items-center gap-1 transition"
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>ATM Cashout</span>
        </button>

        <button
          onClick={onOpenCinema}
          className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-400 text-xs font-semibold border border-red-800 flex items-center gap-1 transition"
        >
          <Film className="w-3.5 h-3.5" />
          <span>Movie Box</span>
        </button>

        <button
          onClick={onOpenHousing}
          className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold border border-purple-800 flex items-center gap-1 transition"
        >
          <HomeIcon className="w-3.5 h-3.5" />
          <span>Penthouse</span>
        </button>

        <button
          onClick={onOpenMarket}
          className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-400 text-xs font-semibold border border-blue-800 flex items-center gap-1 transition"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Market</span>
        </button>
      </div>
    </div>
  );
};
