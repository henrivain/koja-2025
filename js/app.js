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

// Raycaster for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

// Function to handle mouse click
function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the raycaster
  const intersects = raycaster.intersectObjects(
    sceneManager.getSelectableObjects()
  );

  if (intersects.length > 0) {
    // Deselect previous object
    if (selectedObject) {
      selectedObject.material.emissive.setHex(selectedObject.currentHex);
    }

    // Select the first intersected object
    selectedObject = intersects[0].object;
    selectedObject.currentHex = selectedObject.material.emissive
      ? selectedObject.material.emissive.getHex()
      : 0x000000;

    if (selectedObject.material.emissive) {
      selectedObject.material.emissive.setHex(0xff0000); // Highlight with red
    }

    // Highlight the corresponding item in the UI
    highlightSelectedObjectInUI(selectedObject);
  }
}

// Add event listener for mouse click
window.addEventListener("click", onMouseClick, false);

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

const guiAdd = new dat.GUI({ width: 200 });
guiAdd.domElement.style.position = "absolute";
guiAdd.domElement.style.left = "300px"; // Position it next to the original GUI
guiAdd.domElement.style.top = "0px"; // Align it with the first panel
guiAdd.domElement.style.zIndex = "100"; // Make sure it's above canvas

const objectAdder = {
  addCube: function () {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );
    // Use SceneManager to add the cube
    const id = sceneManager.addObject(
      cube,
      `Cube ${sceneManager.getAllObjects().length + 1}`
    );
    // Update the UI
    updateSceneManagerUI();
  },
  addSphere: function () {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );
    // Use SceneManager to add the sphere
    const id = sceneManager.addObject(
      sphere,
      `Sphere ${sceneManager.getAllObjects().length + 1}`
    );
    // Update the UI
    updateSceneManagerUI();
  },
};

guiAdd.add(objectAdder, "addCube").name("Add Cube");
guiAdd.add(objectAdder, "addSphere").name("Add Sphere");

// Optional: Style both panels to be more visible
gui.domElement.style.position = "absolute";
gui.domElement.style.right = "10px";
gui.domElement.style.top = "0px";
gui.domElement.style.zIndex = "100";

// Function to move objects using arrow keys
let moveSpeed = 0.1; // Define how fast the objects move

document.addEventListener("keydown", (event) => {
  if (!selectedObject) return;

  switch (event.key) {
    case "ArrowUp":
      selectedObject.position.z -= moveSpeed; // Move forward (negative Z)
      break;
    case "ArrowDown":
      selectedObject.position.z += moveSpeed; // Move backward (positive Z)
      break;
    case "ArrowLeft":
      selectedObject.position.x -= moveSpeed; // Move left (negative X)
      break;
    case "ArrowRight":
      selectedObject.position.x += moveSpeed; // Move right (positive X)
      break;
  }
});

// Ensure the cube stays on the flat surface
cube.position.y = 0;

// Function to update the SceneManager UI panel
function updateSceneManagerUI() {
  const sceneObjectsList = document.getElementById("scene-objects-list");
  if (!sceneObjectsList) return;

  sceneObjectsList.innerHTML = ""; // Clear the list

  // Get all objects from the SceneManager
  const objects = sceneManager.getAllObjects();

  // Create a list item for each object
  objects.forEach((obj) => {
    if (obj.name === "floor") {
      return; // Skip the floor
    }

    // Create a container for the object item
    const itemContainer = document.createElement("div");
    itemContainer.className = "scene-object-item-container";
    itemContainer.dataset.id = obj.id; // Store for selection

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
        // If the object being deleted is the currently selected object, clear selection
        if (selectedObject === obj.object) {
          selectedObject = null;
        }

        // Remove the object from the scene
        if (sceneManager.removeObject(obj.id)) {
          // Update the UI
          updateSceneManagerUI();
        }
      }
    });

    // Add click event to select the object
    item.addEventListener("click", () => {
      // Clear previous selection from 3D view
      if (selectedObject) {
        selectedObject.material.emissive.setHex(selectedObject.currentHex);
      }

      // Select the object in the scene
      selectedObject = obj.object;

      // Store and set emissive color for highlighting
      if (selectedObject.material.emissive) {
        selectedObject.currentHex = selectedObject.material.emissive.getHex();
        selectedObject.material.emissive.setHex(0xff0000); // Red highlight
      }

      // Highlight in UI
      document.querySelectorAll(".scene-object-item").forEach((el) => {
        el.style.backgroundColor = "#34495e";
      });
      item.style.backgroundColor = "#2980b9";
    });

    // Add double-click event to rename the object
    item.addEventListener("dblclick", () => {
      // Create an input field
      const input = document.createElement("input");
      input.type = "text";
      input.value = obj.name;
      input.className = "rename-input";

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

// Helper function to highlight the selected object in the UI
function highlightSelectedObjectInUI(object) {
  // Find the object in the SceneManager
  const objects = sceneManager.getAllObjects();
  const matchingObj = objects.find((obj) => obj.object === object);

  if (matchingObj) {
    // Remove highlight from all items
    document.querySelectorAll(".scene-object-item").forEach((el) => {
      el.style.backgroundColor = "#34495e";
    });

    // Highlight the selected item
    const selectedItem = document.querySelector(
      `.scene-object-item[data-id="${matchingObj.id}"]`
    );
    if (selectedItem) {
      selectedItem.style.backgroundColor = "#2980b9";
    }
  }
}

// Function to add objects to scene with SceneManager
function addObjectToScene(object, name) {
  const id = sceneManager.addObject(object, name);
  updateSceneManagerUI();
  return id;
}

// Create UI structure if it doesn't exist
function createUI() {
  // Check if the app element exists
  if (!document.getElementById("app")) {
    // Create the app container
    const app = document.createElement("div");
    app.id = "app";
    document.body.appendChild(app);

    // Create the scene manager panel
    const sceneManagerPanel = document.createElement("div");
    sceneManagerPanel.id = "scene-manager";
    app.appendChild(sceneManagerPanel);

    // Create the viewport
    const viewport = document.createElement("div");
    viewport.id = "viewport";
    app.appendChild(viewport);

    // Move the renderer to the viewport
    const rendererDomElement = renderer.domElement;
    viewport.appendChild(rendererDomElement);
  }

  // Create scene manager contents
  const sceneManagerEl = document.getElementById("scene-manager");
  if (sceneManagerEl && !document.getElementById("scene-objects-list")) {
    // Create header
    const header = document.createElement("h3");
    header.textContent = "Scene Objects";
    sceneManagerEl.appendChild(header);

    // Create the objects list
    const objectsList = document.createElement("div");
    objectsList.id = "scene-objects-list";
    sceneManagerEl.appendChild(objectsList);

    // Add buttons container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "8px";
    buttonContainer.style.marginTop = "10px";

    // Add a button to create new cubes
    const addCubeButton = document.createElement("button");
    addCubeButton.className = "add-cube-button";
    addCubeButton.textContent = "Add Cube";
    addCubeButton.addEventListener("click", objectAdder.addCube);
    buttonContainer.appendChild(addCubeButton);

    // Add a button to create new spheres
    const addSphereButton = document.createElement("button");
    addSphereButton.className = "add-sphere-button";
    addSphereButton.textContent = "Add Sphere";
    addSphereButton.addEventListener("click", objectAdder.addSphere);
    buttonContainer.appendChild(addSphereButton);

    sceneManagerEl.appendChild(buttonContainer);
  }
}

// Extend SceneManager to work with the raycaster
SceneManager.prototype.getSelectableObjects = function () {
  return this.getAllObjects()
    .filter((obj) => obj.name !== "floor")
    .map((obj) => obj.object);
};

// Initialize UI
createUI();

// Initialize the SceneManager UI
updateSceneManagerUI();

// Function to update the list of objects in the scene
function updateObjectList() {
  const objectList = guiAdd.addFolder("Objects in Scene");
  objectList.domElement.style.position = "absolute";
  objectList.domElement.style.left = "500px"; // Position it next to the original GUI
  objectList.domElement.style.top = "0px"; // Align it with the first panel
  objectList.domElement.style.zIndex = "100"; // Make sure it's above canvas
  // Clear previous list
  while (objectList.__controllers.length > 0) {
    objectList.remove(objectList.__controllers[0]);
  }

  // Add current objects to the list
  scene.children.forEach((object, index) => {
    objectList
      .add({ name: object.type }, "name")
      .name(`Object ${index + 1}: ${object.type}`);
  });
}

animate();
