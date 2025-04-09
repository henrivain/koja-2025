// Import the SceneManager class
import SceneManager from "./SceneManager.js";

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("viewport").appendChild(renderer.domElement);

// Initialize the SceneManager
const sceneManager = new SceneManager(scene);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// Add the cube to the scene using SceneManager
const cubeId = sceneManager.addObject(cube, "mainCube");

// Set camera position (camera stays fixed)
camera.position.set(0, 1, 5); // Set a fixed camera position, no automatic movement

// Add lighting
const light = new THREE.AmbientLight(0x404040); // Ambient light
scene.add(light);

// Create the floor (a large plane geometry)
const floorGeometry = new THREE.PlaneGeometry(100, 100); // 100x100 plane
const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0x808080,
  side: THREE.DoubleSide,
}); // Gray color
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate the floor so it's flat on the XZ plane
floor.position.y = -1; // Position it below the cube
// Add the floor to the scene using SceneManager
const floorId = sceneManager.addObject(floor, "floor", false);

// OrbitControls: Add mouse control to the camera
const controls = new THREE.OrbitControls(camera, renderer.domElement); // Attach controls to camera and renderer

// Function to update the renderer size based on the viewport size
function updateRendererSize() {
  const viewport = document.getElementById("viewport");
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;

  // Update the renderer size
  renderer.setSize(width, height);

  // Update the camera aspect ratio
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Call updateRendererSize initially and on window resize
updateRendererSize();
window.addEventListener("resize", updateRendererSize);

// Add resize observer to detect when the scene manager is resized
const resizeObserver = new ResizeObserver(() => {
  updateRendererSize();
});
resizeObserver.observe(document.getElementById("viewport"));

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Cube rotation removed to stop automatic movement
  // cube.rotation.x += 0.01; // Removed rotation
  // cube.rotation.y += 0.01; // Removed rotation

  controls.update(); // Update the controls (required for damping)

  // Render the scene
  renderer.render(scene, camera);
}

// GUI controls using dat.GUI
const gui = new dat.GUI();
const cubeParams = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
};

gui.add(cubeParams, "x", -5, 5).onChange(() => {
  cube.position.x = cubeParams.x;
});
gui.add(cubeParams, "y", -5, 5).onChange(() => {
  cube.position.y = cubeParams.y;
});
gui.add(cubeParams, "z", -5, 5).onChange(() => {
  cube.position.z = cubeParams.z;
});
gui.add(cubeParams, "scale", 0.1, 3).onChange(() => {
  cube.scale.set(cubeParams.scale, cubeParams.scale, cubeParams.scale);
});

// Function to move the cube using arrow keys
let moveSpeed = 0.1; // Define how fast the cube moves

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      cube.position.z -= moveSpeed; // Move forward (negative Z)
      break;
    case "ArrowDown":
      cube.position.z += moveSpeed; // Move backward (positive Z)
      break;
    case "ArrowLeft":
      cube.position.x -= moveSpeed; // Move left (negative X)
      break;
    case "ArrowRight":
      cube.position.x += moveSpeed; // Move right (positive X)
      break;
  }
});

// Ensure the cube stays on the flat surface
cube.position.y = 0;

// Function to update the SceneManager UI panel
function updateSceneManagerUI() {
  const sceneObjectsList = document.getElementById("scene-objects-list");
  sceneObjectsList.innerHTML = ""; // Clear the list

  // Get all objects from the SceneManager
  const objects = sceneManager.getAllObjects();

  // Create a list item for each object
  objects.forEach((obj) => {
    if (obj.name === "floor") {
      return;
    }
    // Create a container for the object item
    const itemContainer = document.createElement("div");
    itemContainer.className = "scene-object-item-container";

    // Create the object item
    const item = document.createElement("div");
    item.className = "scene-object-item";
    item.textContent = obj.name;
    item.dataset.id = obj.id; // Store the object ID as a data attribute

    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "&times;"; // X symbol

    // Add click event to the delete button
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering the item's click event

      // Confirm deletion
      if (confirm(`Are you sure you want to delete "${obj.name}"?`)) {
        // Remove the object from the scene
        if (sceneManager.removeObject(obj.id)) {
          // Update the UI
          updateSceneManagerUI();
        }
      }
    });

    // Add click event to select the object
    item.addEventListener("click", () => {
      // Highlight the selected object (you can implement this later)
      console.log(`Selected object: ${obj.name} (ID: ${obj.id})`);

      // Remove highlight from all items
      document.querySelectorAll(".scene-object-item").forEach((el) => {
        el.style.backgroundColor = "#34495e";
      });

      // Highlight the selected item
      item.style.backgroundColor = "#2980b9";
    });

    // Add double-click event to rename the object
    item.addEventListener("dblclick", () => {
      // Create an input field
      const input = document.createElement("input");
      input.type = "text";
      input.value = obj.name;
      input.className = "rename-input";

      // Style the input
      input.style.width = "100%";
      input.style.padding = "4px";
      input.style.boxSizing = "border-box";
      input.style.border = "1px solid #3498db";
      input.style.borderRadius = "3px";

      // Replace the item's text with the input
      item.textContent = "";
      item.appendChild(input);

      // Focus the input
      input.focus();

      // Handle input blur (when focus is lost)
      input.addEventListener("blur", () => {
        const newName = input.value.trim();
        if (newName) {
          // Update the object's name in the SceneManager
          if (sceneManager.renameObject(obj.id, newName)) {
            item.textContent = newName;
          } else {
            // If renaming failed, revert to the original name
            item.textContent = obj.name;
          }
        } else {
          // If the name is empty, revert to the original name
          item.textContent = obj.name;
        }
      });

      // Handle Enter key press
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          input.blur(); // Trigger the blur event
        }
      });
    });

    // Add the item and delete button to the container
    itemContainer.appendChild(item);
    itemContainer.appendChild(deleteButton);

    // Add the container to the list
    sceneObjectsList.appendChild(itemContainer);
  });
}

// Update the SceneManager UI when objects are added or removed
function addObjectToScene(object, name) {
  const id = sceneManager.addObject(object, name);
  updateSceneManagerUI();
  return id;
}

// Function to add a new cube to the scene
function addNewCube() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({
    color: Math.random() * 0xffffff,
  });
  const newCube = new THREE.Mesh(geometry, material);
  newCube.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);

  addObjectToScene(newCube, `Cube ${sceneManager.getAllObjects().length + 1}`);
}

// Add a button to create new cubes
const addCubeButton = document.createElement("button");
addCubeButton.className = "add-cube-button";
addCubeButton.textContent = "Add New Cube";

addCubeButton.addEventListener("click", addNewCube);
document.getElementById("scene-manager").appendChild(addCubeButton);

// Initialize the SceneManager UI
updateSceneManagerUI();

// Call the animation loop
animate();
