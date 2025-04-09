const panelData = {
    panel: { title: "Luukku", width: 1000.0, depth: 900.0 },
    panelInside: { title: "Luukun sisäpaneeli", width: 984.2, depth: 704.2 },
    panelOutside: { title: "Luukun ulkopaneeli", width: 987.0, depth: 707.0 }
  };
  
  const container = document.getElementById("viewer");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 1, 1).normalize();
  scene.add(light);
  
  camera.position.z = 600;
  
  // Clear old meshes
  function clearScene() {
    while (scene.children.length > 0) {
      const obj = scene.children[0];
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    scene.add(light); // re-add light
  }
  
  function drawPanel(data) {
    clearScene();
  
    const geometry = new THREE.BoxGeometry(data.width, data.depth, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0x3498db });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  }
  
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  
  document.getElementById("visualizeBtn").addEventListener("click", () => {
    const selectedKey = document.getElementById("panelSelector").value;
    drawPanel(panelData[selectedKey]);
  });
  
  animate(); // start animation loop
  