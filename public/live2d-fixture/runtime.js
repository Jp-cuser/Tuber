window.LocalAITuberLive2D = {
  version: 'LocalAITuber fixture bridge',
  async loadModel(canvas, modelUrl) {
    canvas.dataset.live2dModel = modelUrl;
    canvas.dataset.live2dExpression = 'neutral';
    canvas.dataset.live2dMotion = '';
    return {
      setExpression(name) {
        canvas.dataset.live2dExpression = name;
      },
      playMotion(group, index = 0) {
        canvas.dataset.live2dMotion = `${group}:${index}`;
      },
      resize(width, height) {
        canvas.dataset.live2dSize = `${width}x${height}`;
      },
      destroy() {
        canvas.dataset.live2dDestroyed = 'true';
      },
    };
  },
};
