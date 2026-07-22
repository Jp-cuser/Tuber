import { useEffect, useRef } from 'react';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  computeAvatarFrame,
  computeLipSync,
  pointerToLookTarget,
  type AvatarBone,
  type AvatarControlState,
} from '@/features/avatar/control';
import type { AvatarPresentation } from '@/features/avatar/presentation';

interface VrmRendererProps {
  source: string;
  control: AvatarControlState;
  presentation: AvatarPresentation;
  speaking: boolean;
  onLoaded?: () => void;
  onError?: (message: string) => void;
}

export function VrmRenderer({
  source,
  control,
  presentation,
  speaking,
  onLoaded,
  onError,
}: VrmRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef(control);
  const presentationRef = useRef(presentation);
  const speakingRef = useRef(speaking);

  useEffect(() => {
    controlRef.current = control;
  }, [control]);
  useEffect(() => {
    presentationRef.current = presentation;
  }, [presentation]);
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let frame = 0;
    let model: VRM | undefined;
    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 1.35, 3.2);
    const ambientLight = new AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const keyLight = new DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(1, 2, 3);
    scene.add(keyLight);
    const lookTarget = new Object3D();
    lookTarget.position.set(0, 1.35, 3);
    scene.add(lookTarget);
    const clock = new Clock();
    let elapsed = 0;

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const trackPointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      lookTarget.position.set(
        ...pointerToLookTarget(
          event.clientX - bounds.left,
          event.clientY - bounds.top,
          bounds.width,
          bounds.height,
        ),
      );
    };
    const resetPointer = () => lookTarget.position.set(0, 1.35, 3);
    canvas.addEventListener('pointermove', trackPointer);
    canvas.addEventListener('pointerleave', resetPointer);

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      elapsed += delta;
      if (model) {
        const view = presentationRef.current;
        model.scene.position.set(view.positionX, view.positionY, 0);
        model.scene.rotation.y = Math.PI + view.rotationY;
        model.scene.scale.setScalar(view.scale);
        ambientLight.intensity = view.ambientIntensity;
        keyLight.intensity = view.keyIntensity;
        const avatarFrame = computeAvatarFrame(controlRef.current, elapsed);
        for (const [bone, rotation] of Object.entries(avatarFrame.bones)) {
          const node = model.humanoid?.getNormalizedBoneNode(
            bone as AvatarBone,
          );
          if (node && rotation) node.rotation.set(...rotation);
        }
        model.expressionManager?.resetValues();
        if (controlRef.current.emotion !== 'neutral')
          model.expressionManager?.setValue(controlRef.current.emotion, 1);
        model.expressionManager?.setValue('blink', avatarFrame.blink);
        model.expressionManager?.setValue(
          'aa',
          computeLipSync(speakingRef.current, elapsed),
        );
        model.update(delta);
      }
      renderer.render(scene, camera);
    };
    animate();

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      source,
      (gltf) => {
        if (disposed) return;
        model = gltf.userData.vrm as VRM | undefined;
        if (!model) {
          onError?.('The selected file does not contain a VRM model');
          return;
        }
        VRMUtils.removeUnnecessaryVertices(model.scene);
        VRMUtils.combineSkeletons(model.scene);
        model.scene.rotation.y = Math.PI;
        if (model.lookAt) model.lookAt.target = lookTarget;
        scene.add(model.scene);
        onLoaded?.();
      },
      undefined,
      () => {
        if (!disposed) onError?.('Unable to load the VRM model');
      },
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', trackPointer);
      canvas.removeEventListener('pointerleave', resetPointer);
      if (model) {
        scene.remove(model.scene);
        VRMUtils.deepDispose(model.scene);
      }
      renderer.dispose();
    };
  }, [onError, onLoaded, source]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="VRM avatar renderer"
    />
  );
}
