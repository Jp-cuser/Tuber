import { useEffect, useRef } from 'react';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface VrmRendererProps {
  source: string;
  onLoaded?: () => void;
  onError?: (message: string) => void;
}

export function VrmRenderer({ source, onLoaded, onError }: VrmRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    scene.add(new AmbientLight(0xffffff, 1.5));
    const keyLight = new DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(1, 2, 3);
    scene.add(keyLight);
    const clock = new Clock();

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

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      model?.update(clock.getDelta());
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
      if (model) {
        scene.remove(model.scene);
        VRMUtils.deepDispose(model.scene);
      }
      renderer.dispose();
    };
  }, [onError, onLoaded, source]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
