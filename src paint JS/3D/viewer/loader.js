// Loader = 3d
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const stage = document.getElementById("stage");
const canvas = document.getElementById("viewport");
const emptyState = document.getElementById("empty-state");
const dropOverlay = document.getElementById("drop-overlay");
const loadingState = document.getElementById("loading-state");
const loadingLabel = document.getElementById("loading-label");
const toast = document.getElementById("toast");
const hintBar = document.getElementById("hint-bar");
const infoPanel = document.getElementById("info-panel");
const fileInput = document.getElementById("file-input");

const btnUpload = document.getElementById("btn-upload");
const btnBrowse = document.getElementById("btn-browse");
const btnReset = document.getElementById("btn-reset");
const btnWireframe = document.getElementById("btn-wireframe");
const btnGrid = document.getElementById("btn-grid");
const btnAutorotate = document.getElementById("btn-autorotate");
const btnTheme = document.getElementById("btn-theme");
const btnInfo = document.getElementById("btn-info");
const btnReplace = document.getElementById("btn-replace");

const toolButtons = [btnReset, btnWireframe, btnGrid, btnAutorotate, btnTheme, btnInfo];

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
camera.position.set(3, 2.2, 4);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.85;
controls.zoomSpeed = 0.9;
controls.panSpeed = 0.7;
controls.minDistance = 0.05;
controls.maxDistance = 500;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc9bc, 1.0));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
keyLight.position.set(5, 8, 6);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
fillLight.position.set(-6, 3, -4);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
rimLight.position.set(-2, 4, -8);
scene.add(rimLight);

const grid = new THREE.GridHelper(10, 20, 0xb9b1a0, 0xddd6c7);
grid.visible = false;
scene.add(grid);

function makeShadowTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(20,18,14,0.32)");
  grad.addColorStop(0.65, "rgba(20,18,14,0.10)");
  grad.addColorStop(1, "rgba(20,18,14,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const shadowMat = new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false });
const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.visible = false;
scene.add(shadowPlane);

let currentModel = null;
let wireframeOn = false;

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", resize);
resize();

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function computeStats(object) {
  let verts = 0;
  let tris = 0;
  let meshes = 0;
  const mats = new Set();

  object.traverse((node) => {
    if (!node.isMesh) return;
    meshes += 1;
    const geo = node.geometry;
    if (geo) {
      const pos = geo.attributes.position;
      if (pos) verts += pos.count;
      tris += geo.index ? geo.index.count / 3 : pos ? pos.count / 3 : 0;
    }
    const mat = node.material;
    if (Array.isArray(mat)) mat.forEach((m) => m && mats.add(m));
    else if (mat) mats.add(mat);
  });

  return { verts, tris: Math.round(tris), meshes, materials: mats.size };
}

function frameObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  object.position.sub(center);

  const radius = Math.max(size.length() / 2, 0.001);
  camera.near = radius / 100;
  camera.far = radius * 200;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = radius * 0.05;
  controls.maxDistance = radius * 20;

  const fovRad = (camera.fov * Math.PI) / 180;
  const distance = (radius / Math.sin(fovRad / 2)) * 1.15;
  const dir = new THREE.Vector3(1, 0.6, 1).normalize();
  camera.position.copy(dir.multiplyScalar(distance));
  camera.lookAt(0, 0, 0);
  controls.update();

  const span = Math.max(size.x, size.z, radius * 2) * 3;
  grid.scale.setScalar(span / 10);
  grid.position.y = -size.y / 2;

  shadowPlane.scale.setScalar(radius * 2.6);
  shadowPlane.position.y = -size.y / 2 + radius * 0.0008;
  shadowPlane.visible = true;

  return { size, radius };
}

function disposeModel(object) {
  object.traverse((node) => {
    if (!node.isMesh) return;
    node.geometry?.dispose();
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => m && m.dispose && m.dispose());
  });
}

function clearCurrentModel() {
  if (!currentModel) return;
  scene.remove(currentModel);
  disposeModel(currentModel);
  currentModel = null;
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("toast-error", isError);
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

function setLoading(label) {
  loadingLabel.textContent = label;
  loadingState.hidden = false;
}
function clearLoading() {
  loadingState.hidden = true;
}

function setToolsEnabled(enabled) {
  toolButtons.forEach((btn) => (btn.disabled = !enabled));
}

function onModelReady(object, meta) {
  clearCurrentModel();
  currentModel = object;
  scene.add(object);

  const { size } = frameObject(object);
  const stats = computeStats(object);

  if (wireframeOn) {
    object.traverse((node) => {
      if (!node.isMesh) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => m && (m.wireframe = true));
    });
  }

  emptyState.classList.add("is-hidden");
  hintBar.hidden = false;
  infoPanel.hidden = false;
  setToolsEnabled(true);

  grid.visible = true;
  btnGrid.classList.add("is-active");
  btnInfo.setAttribute("aria-pressed", "true");

  document.getElementById("info-filename").textContent = meta.name;
  document.getElementById("info-format").textContent = meta.format;
  document.getElementById("stat-size").textContent = formatBytes(meta.size);
  document.getElementById("stat-dims").textContent =
    `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m`;
  document.getElementById("stat-verts").textContent = stats.verts.toLocaleString();
  document.getElementById("stat-tris").textContent = stats.tris.toLocaleString();
  document.getElementById("stat-meshes").textContent = stats.meshes;
  document.getElementById("stat-mats").textContent = stats.materials;

  clearLoading();
  showToast(`Loaded ${meta.name}`);
}

function onLoadError(err, name) {
  clearLoading();
  console.error(err);
  showToast(`Couldn't read ${name}. Try exporting as .glb from Blender.`, true);
}

const loaders = {
  gltf: new GLTFLoader(),
  obj: new OBJLoader(),
  fbx: new FBXLoader(),
};

function loadFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const meta = { name: file.name, size: file.size, format: ext.toUpperCase() };

  if (!["glb", "gltf", "obj", "fbx"].includes(ext)) {
    showToast(`Unsupported file type ".${ext}". Use GLB, GLTF, OBJ, or FBX.`, true);
    return;
  }

  setLoading(`Reading ${file.name}…`);
  const reader = new FileReader();
  reader.onerror = () => onLoadError(reader.error, file.name);

  if (ext === "glb" || ext === "gltf") {
    reader.onload = () => {
      try {
        loaders.gltf.parse(
          reader.result,
          "",
          (gltf) => onModelReady(gltf.scene, meta),
          (err) => onLoadError(err, file.name)
        );
      } catch (err) {
        onLoadError(err, file.name);
      }
    };
    ext === "glb" ? reader.readAsArrayBuffer(file) : reader.readAsText(file);
  } else if (ext === "obj") {
    reader.onload = () => {
      try {
        onModelReady(loaders.obj.parse(reader.result), meta);
      } catch (err) {
        onLoadError(err, file.name);
      }
    };
    reader.readAsText(file);
  } else if (ext === "fbx") {
    reader.onload = () => {
      try {
        onModelReady(loaders.fbx.parse(reader.result, ""), meta);
      } catch (err) {
        onLoadError(err, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

btnUpload.addEventListener("click", () => fileInput.click());
btnBrowse.addEventListener("click", () => fileInput.click());
btnReplace.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
  fileInput.value = "";
});

let dragDepth = 0;
["dragenter", "dragover"].forEach((evt) =>
  window.addEventListener(evt, (e) => {
    e.preventDefault();
    dragDepth += evt === "dragenter" ? 1 : 0;
    dropOverlay.classList.add("is-active");
  })
);
window.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dragDepth -= 1;
  if (dragDepth <= 0) {
    dragDepth = 0;
    dropOverlay.classList.remove("is-active");
  }
});
window.addEventListener("drop", (e) => {
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.classList.remove("is-active");
  const file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});

btnReset.addEventListener("click", () => {
  if (currentModel) frameObject(currentModel);
});

btnWireframe.addEventListener("click", () => {
  if (!currentModel) return;
  wireframeOn = !wireframeOn;
  currentModel.traverse((node) => {
    if (!node.isMesh) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => m && (m.wireframe = wireframeOn));
  });
  btnWireframe.classList.toggle("is-active", wireframeOn);
});

btnGrid.addEventListener("click", () => {
  grid.visible = !grid.visible;
  btnGrid.classList.toggle("is-active", grid.visible);
});

btnAutorotate.addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  controls.autoRotateSpeed = 1.4;
  btnAutorotate.classList.toggle("is-active", controls.autoRotate);
});

let darkBackdrop = false;
btnTheme.addEventListener("click", () => {
  darkBackdrop = !darkBackdrop;
  stage.classList.toggle("stage-dark", darkBackdrop);
  btnTheme.classList.toggle("is-active", darkBackdrop);
});

btnInfo.addEventListener("click", () => {
  if (!currentModel) return;
  infoPanel.hidden = !infoPanel.hidden;
  btnInfo.setAttribute("aria-pressed", String(!infoPanel.hidden));
  btnInfo.classList.toggle("is-active", !infoPanel.hidden);
});
