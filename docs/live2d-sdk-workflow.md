# User-Supplied Live2D SDK Workflow

Live2D Cubism Core and model assets are not redistributed by LocalAITuber. Use
files obtained under your own valid Live2D and model licenses.

Place the resources under the application's `public/live2d` directory:

- `/live2d/live2dcubismcore.min.js`
- `/live2d/runtime.js`
- `/live2d/<model>/<name>.model3.json` and its referenced assets

`runtime.js` must expose `window.LocalAITuberLive2D` with a version string and a
`loadModel(canvas, modelUrl)` function. The returned handle implements
`setExpression`, `playMotion`, `resize`, and `destroy`. This bridge keeps the UI
independent from the licensed SDK and allows compatible Cubism 3+ runtimes.

Only same-origin `.js` and `.model3.json` paths are accepted. Remote runtime,
Core, and model URLs are rejected. Contract tests use an automated fixture
bridge and do not include any proprietary SDK code or character asset.
