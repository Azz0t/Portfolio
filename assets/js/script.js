import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";


/*==========================| 3D Model |==========================*/
const container = document.getElementById("three-container");

if (!container) {
throw new Error('Élément "#three-container" introuvable dans le HTML.');
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
45,
1,
0.1,
4000
);

camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({
antialias: true,
alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.enableZoom = false;
controls.enablePan = false;

const modelMobileQuery = window.matchMedia("(max-width: 768px)");

controls.enableRotate = !modelMobileQuery.matches;

modelMobileQuery.addEventListener("change", (e) => {
  controls.enableRotate = !e.matches;
});

controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;

renderer.domElement.style.touchAction = "pan-y";

const pivot = new THREE.Group();
scene.add(pivot);

const loader = new GLTFLoader();

loader.setMeshoptDecoder(MeshoptDecoder);

loader.load(
"./assets/models/model.glb",

(gltf) => {
const model = gltf.scene;

const box = new THREE.Box3().setFromObject(model);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());

model.position.sub(center);

pivot.add(model);

const maxDimension = Math.max(size.x, size.y, size.z);

const fovRadians = THREE.MathUtils.degToRad(camera.fov);
const distance = (maxDimension / 2) / Math.tan(fovRadians / 2);

camera.position.set(
  0,
  maxDimension * 0.08,
  Math.max(distance * 1.6, 1)
);

camera.near = Math.max(maxDimension / 1000, 0.01);
camera.far = Math.max(maxDimension * 100, 1000);
camera.updateProjectionMatrix();

controls.target.set(0, 0, 0);
controls.update();

console.log("Modèle GLB chargé avec succès :", model);
console.log("Dimensions du modèle :", size);

},

(progress) => {
  if (progress.total > 0) {
    const percent = (progress.loaded / progress.total) * 100;

    console.log(`Chargement du modèle : ${percent.toFixed(1)} %`);
  }
},

(error) => {
console.error("Erreur lors du chargement du modèle GLB :", error);
}
);

function resize() {
const width = container.clientWidth;
const height = container.clientHeight;

if (width === 0 || height === 0) {
return;
}

camera.aspect = width / height;
camera.updateProjectionMatrix();

renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

function animate() {
requestAnimationFrame(animate);

pivot.rotation.y += 0.001;

controls.update();
renderer.render(scene, camera);
}

animate();




/*==========================| SECTION — PROJECTS |==========================*/

document.addEventListener("DOMContentLoaded", () => {

  const track = document.querySelector(".projects-track");
  const container = document.querySelector(".projects-content");

  const btnLeft = document.querySelector(".projects-btn-left");
  const btnRight = document.querySelector(".projects-btn-right");

  const progressBar = document.querySelector(".projects-progress-bar");
  const filterContainer = document.querySelector(".projects-filters");

  if (!track || !container) return;

  const isMobile = window.matchMedia("(max-width: 768px)");

  const STEP = 440;

  let isDragging = false;
  let dragging = false;

  let startX = 0;
  let startY = 0;

  let x = 0;
  let targetX = 0;
  let velocity = 0;

  let minX = 0;
  let maxX = 0;

  function computeBounds() {

    maxX = 0;

    if (isMobile.matches) {
      const style = window.getComputedStyle(container);

      const padding =
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight);

      minX = Math.min(
        0,
        container.clientWidth - padding - track.scrollWidth
      );

    } else {

      minX = Math.min(
        0,
        container.clientWidth - track.scrollWidth
      );

    }

    clamp();
  }

  function clamp() {

    targetX = Math.max(
      minX,
      Math.min(maxX, targetX)
    );

    x = Math.max(
      minX,
      Math.min(maxX, x)
    );
  }

  function applyTransform() {
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function updateProgress() {

    if (!progressBar) return;

    const total = maxX - minX;

    if (total <= 0) {
      progressBar.style.width = "100%";
      return;
    }

    const progress = 1 - ((x - minX) / total);

    progressBar.style.width =
      `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }

  function initDesktop() {

    btnLeft?.addEventListener("click", () => {
      targetX += STEP;
      clamp();
    });

    btnRight?.addEventListener("click", () => {
      targetX -= STEP;
      clamp();
    });

    container.addEventListener("mousedown", (e) => {

      isDragging = true;
      dragging = false;

      startX = e.clientX;
      startY = e.clientY;

      velocity = 0;

    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    window.addEventListener("mouseleave", () => {
      isDragging = false;
    });

    window.addEventListener("blur", () => {
      isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {

      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging && Math.abs(dy) > Math.abs(dx)) {
        isDragging = false;
        return;
      }

      dragging = true;

      startX = e.clientX;

      x += dx;
      targetX = x;

      velocity = Math.max(-30, Math.min(30, dx));

      clamp();
      applyTransform();

    });

    function animateDesktop() {

      if (!dragging && !isDragging) {

        targetX += velocity;
        velocity *= 0.92;

        if (Math.abs(velocity) < 0.01) {
          velocity = 0;
        }

      }

      clamp();

      x += (targetX - x) * 0.12;

      applyTransform();
      updateProgress();

      requestAnimationFrame(animateDesktop);
    }

    animateDesktop();
  }

  function initMobile() {

    let pointerStartX = 0;
    let targetStartX = 0;

    container.addEventListener("pointerdown", (e) => {

      if (e.pointerType === "mouse" && e.button !== 0) return;

      isDragging = true;

      pointerStartX = e.clientX;
      targetStartX = targetX;

      container.classList.add("dragging");

      container.setPointerCapture(e.pointerId);

    });

    container.addEventListener("pointermove", (e) => {

      if (!isDragging) return;

      const dx = e.clientX - pointerStartX;

      targetX = targetStartX + dx;

      clamp();

    });

    function stopDragging() {

      if (!isDragging) return;

      isDragging = false;

      container.classList.remove("dragging");

    }

    container.addEventListener("pointerup", stopDragging);
    container.addEventListener("pointercancel", stopDragging);
    container.addEventListener("lostpointercapture", stopDragging);

    /* Flèches mobiles */

    function moveByCard(direction) {

      const firstCard = track.querySelector(".project-card");

      if (!firstCard) return;

      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap) || 0;

      const step = firstCard.offsetWidth + gap;

      targetX += direction * step;

      clamp();

    }

    btnLeft?.addEventListener("click", () => {
      moveByCard(1);
    });

    btnRight?.addEventListener("click", () => {
      moveByCard(-1);
    });

    function animateMobile() {

      x += (targetX - x) * 0.14;

      if (Math.abs(targetX - x) < 0.1) {
        x = targetX;
      }

      applyTransform();
      updateProgress();

      requestAnimationFrame(animateMobile);

    }

    animateMobile();

  }

  window.addEventListener("resize", () => {
    computeBounds();
  });

  if (filterContainer) {

    let selectedTag = "ALL";

    function getAllTags() {

      return [
        "ALL",
        ...new Set(
          [...document.querySelectorAll(".tag-solo-in-project")]
            .map(tag => tag.textContent.trim())
        )
      ];

    }

    function filterCards() {

      const cards = document.querySelectorAll(".project-card");

      cards.forEach(card => {

        const tags = [
          ...card.querySelectorAll(".tag-solo-in-project")
        ].map(tag => tag.textContent.trim());

        card.style.display =
          selectedTag === "ALL" || tags.includes(selectedTag)
            ? ""
            : "none";

      });

      x = 0;
      targetX = 0;
      velocity = 0;

      computeBounds();

    }

    function renderFilters() {

      const tags = getAllTags();

      filterContainer.innerHTML = "";

      const fragment = document.createDocumentFragment();

      tags.forEach(tag => {

        const btn = document.createElement("button");

        btn.textContent = tag;
        btn.className = "filter-btn";

        if (tag === "ALL") {
          btn.classList.add("active");
        }

        btn.addEventListener("click", () => {

          selectedTag = tag;

          filterContainer
            .querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

          btn.classList.add("active");

          filterCards();

        });

        fragment.appendChild(btn);

      });

      filterContainer.appendChild(fragment);

    }

    renderFilters();

  }

  computeBounds();

  if (isMobile.matches) {
    initMobile();
  } else {
    initDesktop();
  }

  if (filterContainer) {
    filterContainer.querySelector(".filter-btn")?.click();
  }

});





/*==========================| SCROLL |==========================*/
const sections = [
    document.querySelector(".section-masthead"),
    document.querySelector(".section-skills"),
    document.querySelector(".section-projects"),
    document.querySelector("#footer")
].filter(Boolean);

let currentSection = 0;
let targetSection = 0;
let scrollTimeout;

function goToSection(index) {
    targetSection = Math.max(
        0,
        Math.min(index, sections.length - 1)
    );

    currentSection = targetSection;

    sections[targetSection].scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

if (!isMobile.matches) {

    window.addEventListener("wheel", (event) => {

        event.preventDefault();

        if (Math.abs(event.deltaY) < 2) return;

        goToSection(
            targetSection + (event.deltaY > 0 ? 1 : -1)
        );

    }, { passive: false });

}
