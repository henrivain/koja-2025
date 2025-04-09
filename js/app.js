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

// Set camera position
camera.position.set(0, 1, 5);

// Add lighting
const light = new THREE.AmbientLight(0x404040);
scene.add(light);

// Create floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
scene.add(floor);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Raycaster and mouse for selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let outlineMesh = null;

// Highlight function
function highlightObject(object) {
    if (outlineMesh) {
        scene.remove(outlineMesh);
        outlineMesh = null;
    }

    if (object) {
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide,
        });

        outlineMesh = new THREE.Mesh(object.geometry.clone(), outlineMaterial);
        outlineMesh.position.copy(object.position);
        outlineMesh.rotation.copy(object.rotation);
        outlineMesh.scale.copy(object.scale).multiplyScalar(1.05);
        scene.add(outlineMesh);
    }
}

// Object selection
function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object !== floor) {
            selectedObject = intersects[i].object;
            highlightObject(selectedObject);
            updateGUIForSelected();
            return;
        }
    }

    selectedObject = null;
    highlightObject(null);
    updateGUIForSelected();
}
renderer.domElement.addEventListener('click', onClick);

// GUI controls
const gui = new dat.GUI();
// gui.domElement.style.display = 'none'; // Initially hidden
gui.domElement.style.position = 'absolute';
gui.domElement.style.left = '10px';
gui.domElement.style.top = '70px';
gui.domElement.style.zIndex = '100';

const cubeParams = {
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    length: 1,  // Scale along x-axis
    width: 1,   // Scale along y-axis
    height: 1   // Scale along z-axis
};

function updateGUIForSelected() {
    while (gui.__controllers.length > 0) {
        gui.remove(gui.__controllers[0]);
    }

    if (!selectedObject) {
        //gui.domElement.style.display = 'none';
        return;
    }

    cubeParams.x = selectedObject.position.x;
    cubeParams.y = selectedObject.position.y;
    cubeParams.z = selectedObject.position.z;
    cubeParams.scale = selectedObject.scale.x;
    cubeParams.rotationX = selectedObject.rotation.x;
    cubeParams.rotationY = selectedObject.rotation.y;
    cubeParams.rotationZ = selectedObject.rotation.z;
    
    // Set the length, width, height based on the current scale
    cubeParams.length = selectedObject.scale.x;
    cubeParams.width = selectedObject.scale.y;
    cubeParams.height = selectedObject.scale.z;

    gui.add(cubeParams, 'x', -10, 10).onChange(() => selectedObject.position.x = cubeParams.x);
    gui.add(cubeParams, 'y', -10, 10).onChange(() => selectedObject.position.y = cubeParams.y);
    gui.add(cubeParams, 'z', -10, 10).onChange(() => selectedObject.position.z = cubeParams.z);
    gui.add(cubeParams, 'scale', 0.1, 3).onChange(() => {
        selectedObject.scale.set(cubeParams.scale, cubeParams.scale, cubeParams.scale);
        if (outlineMesh) {
            outlineMesh.scale.copy(selectedObject.scale).multiplyScalar(1.05);
        }
    });

    // Adding the independent scaling controls for each axis
    gui.add(cubeParams, 'length', 0.1, 5).onChange(() => {
        selectedObject.scale.x = cubeParams.length;
        if (outlineMesh) {
            outlineMesh.scale.x = cubeParams.length * 1.05;
        }
    });

    gui.add(cubeParams, 'width', 0.1, 5).onChange(() => {
        selectedObject.scale.y = cubeParams.width;
        if (outlineMesh) {
            outlineMesh.scale.y = cubeParams.width * 1.05;
        }
    });

    gui.add(cubeParams, 'height', 0.1, 5).onChange(() => {
        selectedObject.scale.z = cubeParams.height;
        if (outlineMesh) {
            outlineMesh.scale.z = cubeParams.height * 1.05;
        }
    });

    gui.add(cubeParams, 'rotationX', -Math.PI, Math.PI).onChange(() => {
        selectedObject.rotation.x = cubeParams.rotationX;
    });
    gui.add(cubeParams, 'rotationY', -Math.PI, Math.PI).onChange(() => {
        selectedObject.rotation.y = cubeParams.rotationY;
    });
    gui.add(cubeParams, 'rotationZ', -Math.PI, Math.PI).onChange(() => {
        selectedObject.rotation.z = cubeParams.rotationZ;
    });

    gui.domElement.style.display = 'block'; // Show GUI when object is selected
}

// Add Cube/Sphere GUI
const guiAdd = new dat.GUI({ width: 200 });
guiAdd.domElement.style.position = 'absolute';
guiAdd.domElement.style.left = '300px';
guiAdd.domElement.style.top = '70px';
guiAdd.domElement.style.zIndex = '100';

const objectAdder = {
    addCube: function () {
        const geometry = new THREE.BoxBufferGeometry();
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
        scene.add(cube);
    },
    addSphere: function () {
        const geometry = new THREE.SphereBufferGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
        scene.add(sphere);
    }
};

guiAdd.add(objectAdder, 'addCube').name('Add Cube');
guiAdd.add(objectAdder, 'addSphere').name('Add Sphere');

// Move selected object with arrow keys
let moveSpeed = 0.1;
document.addEventListener('keydown', (event) => {
    if (!selectedObject) return;

    switch (event.key) {
        case 'ArrowUp':
            selectedObject.position.z -= moveSpeed;
            break;
        case 'ArrowDown':
            selectedObject.position.z += moveSpeed;
            break;
        case 'ArrowLeft':
            selectedObject.position.x -= moveSpeed;
            break;
        case 'ArrowRight':
            selectedObject.position.x += moveSpeed;
            break;
        case 'Delete':
            // Remove the selected object from the scene
            scene.remove(selectedObject);
            // Remove outline if exists
            if (outlineMesh) {
                scene.remove(outlineMesh);
                outlineMesh = null;
            }
            selectedObject = null;
            updateGUIForSelected();
    }

    if (outlineMesh) {
        outlineMesh.position.copy(selectedObject.position);
    }

    // Sync GUI
    cubeParams.x = selectedObject.position.x;
    cubeParams.z = selectedObject.position.z;
    gui.updateDisplay();
});

// Ensure the cube starts on floor
cube.position.y = 0;

// Animate
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Add STL import/export functionality
const guiImpExp = new dat.GUI({ width: 200 });
guiImpExp.domElement.style.position = 'absolute';49
guiImpExp.domElement.style.left = '520px';
guiImpExp.domElement.style.top = '70px';
guiImpExp.domElement.style.zIndex = '100';

const stlInput = document.createElement('input');
stlInput.type = 'file';
stlInput.accept = '.stl';
document.body.appendChild(stlInput);

stlInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loader = new THREE.STLLoader();
    loader.load(URL.createObjectURL(file), function(geometry) {
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        stlInput.value = ''; // Reset input
    });
});

// Add import/export functions to objectAdder
objectAdder.importSTL = function() {
    stlInput.click();
};

objectAdder.exportSTL = function() {
    let objectsToExport = [];
    if (selectedObject) {
        objectsToExport.push(selectedObject);
    } else {
        scene.children.forEach(child => {
            if (child !== floor && !(child instanceof THREE.Light)) {
                objectsToExport.push(child);
            }
        });
    }

    if (objectsToExport.length === 0) {
        alert('No objects to export!');
        return;
    }


    const exporter = new THREE.STLExporter();
    const group = new THREE.Group();
    objectsToExport.forEach(obj => group.add(obj.clone()));
    const stlString = exporter.parse(group);

    const blob = new Blob([stlString], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = selectedObject ? 'selected_object.stl' : 'scene.stl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Add buttons to guiAdd
guiImpExp.add(objectAdder, 'importSTL').name('Import STL');
guiImpExp.add(objectAdder, 'exportSTL').name('Export STL');
