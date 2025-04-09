// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewport').appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Set camera position (camera stays fixed)
camera.position.set(0, 1, 5); // Set a fixed camera position, no automatic movement

// Add lighting
const light = new THREE.AmbientLight(0x404040); // Ambient light
scene.add(light);

// Create the floor (a large plane geometry)
const floorGeometry = new THREE.PlaneGeometry(100, 100); // 100x100 plane
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide }); // Gray color
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate the floor so it's flat on the XZ plane
floor.position.y = -1; // Position it below the cube
scene.add(floor);

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
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        // Deselect previous object
        if (selectedObject) {
            selectedObject.material.emissive.setHex(selectedObject.currentHex);
        }

        // Select the first intersected object
        selectedObject = intersects[0].object;
        selectedObject.currentHex = selectedObject.material.emissive.getHex();
        selectedObject.material.emissive.setHex(0x000000); // Highlight with black border color
    }
}

// Add event listener for mouse click
window.addEventListener('click', onMouseClick, false);

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

gui.add(cubeParams, 'x', -5, 5).onChange(() => {
    cube.position.x = cubeParams.x;
});
gui.add(cubeParams, 'y', -5, 5).onChange(() => {
    cube.position.y = cubeParams.y;
});
gui.add(cubeParams, 'z', -5, 5).onChange(() => {
    cube.position.z = cubeParams.z;
});
gui.add(cubeParams, 'scale', 0.1, 3).onChange(() => {
    cube.scale.set(cubeParams.scale, cubeParams.scale, cubeParams.scale);
});

const guiAdd = new dat.GUI({ width: 200 });
guiAdd.domElement.style.position = 'absolute';
guiAdd.domElement.style.left = '300px'; // Position it next to the original GUI
guiAdd.domElement.style.top = '0px'; // Align it with the first panel
guiAdd.domElement.style.zIndex = '100'; // Make sure it's above canvas

const objectAdder = {
    addCube: function () {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
        );
        scene.add(cube);
        updateObjectList();
    },
    addSphere: function () {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
        );
        scene.add(sphere);
        updateObjectList();
    }
};

guiAdd.add(objectAdder, 'addCube').name('Add Cube');
guiAdd.add(objectAdder, 'addSphere').name('Add Sphere');

// Optional: Style both panels to be more visible
gui.domElement.style.position = 'absolute';
gui.domElement.style.left = '10px';
gui.domElement.style.top = '0px';
gui.domElement.style.zIndex = '100';

// Function to move the cube using arrow keys
let moveSpeed = 0.1; // Define how fast the cube moves

document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            cube.position.z -= moveSpeed; // Move forward (negative Z)
            break;
        case 'ArrowDown':
            cube.position.z += moveSpeed; // Move backward (positive Z)
            break;
        case 'ArrowLeft':
            cube.position.x -= moveSpeed; // Move left (negative X)
            break;
        case 'ArrowRight':
            cube.position.x += moveSpeed; // Move right (positive X)
            break;
    }
});

// Ensure the cube stays on the flat surface
cube.position.y = 0;

// Function to update the list of objects in the scene
function updateObjectList() {
    const objectList = guiAdd.addFolder('Objects in Scene');
    objectList.domElement.style.position = 'absolute';
    objectList.domElement.style.left = '500px'; // Position it next to the original GUI
    objectList.domElement.style.top = '0px'; // Align it with the first panel
    objectList.domElement.style.zIndex = '100'; // Make sure it's above canvas
    // Clear previous list
    while (objectList.__controllers.length > 0) {
        objectList.remove(objectList.__controllers[0]);
    }

    // Add current objects to the list
    scene.children.forEach((object, index) => {
        objectList.add({ name: object.type }, 'name').name(`Object ${index + 1}: ${object.type}`);
    });
}

animate();
