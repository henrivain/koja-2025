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

animate();
