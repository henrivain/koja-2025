import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    Object3D,
    PCFSoftShadowMap,
    TextureLoader,
} from "three";

import * as dat from "dat.gui";

const BACKGROUND = "cloud-sky.jpg";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Mover } from "./Mover";

export default class Engine {
    container: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    scene: Scene;
    controls: OrbitControls;
    elems: Object3D[];
    gui: dat.GUI | null = null;
    selectedObject: Object3D | null = null;
    sidebar: HTMLElement;
    mover: Mover;

    constructor(container: HTMLElement, elems: Object3D[]) {
        this.container = container;
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        this.camera = new PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            1,
            5000
        );
        this.scene = new Scene();
        this.elems = elems;
        this.controls = this.addControls();
        this.mover = new Mover(this);
        this.sidebar = this.createSidebar();
    }

    createSidebar() {
        const sidebar = document.createElement("div");
        sidebar.style.position = "fixed";
        sidebar.style.left = "0";
        sidebar.style.top = "0";
        sidebar.style.width = "180px";
        sidebar.style.height = "100vh";
        sidebar.style.backgroundColor = "#f5f5f5";
        sidebar.style.padding = "20px";
        sidebar.style.textAlign = "center";
        sidebar.style.boxShadow = "2px 0 5px rgba(0,0,0,0.1)";
        document.body.appendChild(sidebar);
        return sidebar;
    }

    updateSidebar() {
        let elemList =
            "<h2>Elements</h2><div style='display: flex; flex-direction: column; gap: 8px;'>";
        this.elems.forEach((elem, index) => {
            elemList += `
                <div id="elem-container-${index}" style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: ${this.selectedObject === elem ? "#e0e0e0" : "white"
                };
                ">
                    <button 
                        id="elem-button-${index}"
                        onclick="window.engine.selectElement(${index})" 
                        ondblclick="window.engine.startRename(${index})"
                        style="
                            cursor: pointer; 
                            padding: 8px 12px; 
                            border: none;
                            border-radius: 4px; 
                            background: transparent;
                            text-align: center;
                            flex-grow: 1;
                            transition: background 0.2s;
                        "
                    >
                        ${elem.name || `Element ${index + 1}`}
                    </button>
                    <button
                        onclick="window.engine.deleteElem(window.engine.elems[${index}])"
                        style="
                            cursor: pointer;
                            padding: 4px 8px;
                            border: 1px solid #ff4444;
                            border-radius: 4px;
                            background: white;
                            color: #ff4444;
                            transition: all 0.2s;
                        "
                        onmouseover="this.style.background='#ff4444';this.style.color='white'"
                        onmouseout="this.style.background='white';this.style.color='#ff4444'"
                    >
                        ×
                    </button>
                </div>`;
        });
        elemList += "</div>";
        this.sidebar.innerHTML = elemList;
    }

    selectElement(index: number) {
        this.selectedObject = this.elems[index];
        this.mover.selected = this.selectedObject;
        this.mover.highLight(this.selectedObject);
        this.updateSidebar();
    }

    startRename(index: number) {
        const elem = this.elems[index];
        const button = document.getElementById(`elem-button-${index}`);
        if (button) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = elem.name || `Element ${index + 1}`;
            input.style.width = "100%";
            input.style.padding = "8px 12px";
            input.style.border = "1px solid #ccc";
            input.style.borderRadius = "4px";

            const handleRename = () => {
                elem.name = input.value;
                this.updateSidebar();
            };

            input.addEventListener("blur", handleRename);
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    handleRename();
                }
            });

            button.replaceWith(input);
            input.focus();
            input.select(); // Select all text for easy replacement
        }

        // const loader = new TextureLoader();
        // this.scene.background = loader.load(BACKGROUND);
    }

    run() {
        const container = this.container;
        const renderer = this.renderer;
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Make engine instance available globally
        (window as any).engine = this;

        // Run code
        this.addLighting();
        this.render();
        this.animate();
        this.updateSidebar();

        document
            .getElementById("visualizeBtn")
            ?.addEventListener("click", (_) => this.render());
    }

    animate() {
        requestAnimationFrame((_) => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    addElem(elem: Object3D) {
        this.scene.add(elem);
        this.elems.push(elem);
        this.updateSidebar();
    }

    deleteElem(elem: Object3D) {
        this.elems = this.elems.filter((x) => x != elem);
        this.scene.remove(elem);
        this.updateSidebar();
    }

    addControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        this.camera.position.z = 600;
        return controls;
    }

    addLighting() {
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        ambientLight.position.set(0, 1, 1).normalize();
        this.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(0xffffff, 3);
        directionalLight.position.set(100, 100, 100);
        this.scene.add(directionalLight);

        // This light is inside the fucking oven
        const directionalLight2 = new DirectionalLight(0xffffff, 2);
        directionalLight2.position.set(200, 20, 200);
        this.scene.add(directionalLight2);
    }

    // Clear old meshes
    clearScene() {
        while (this.scene.children.length > 0) {
            const obj = this.scene.children[0] as any;
            this.scene.remove(obj);

            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }
        this.addLighting();
    }

    render() {
        this.clearScene();
        for (const elem of this.elems) {
            this.scene.add(elem);
        }
        this.animate();
        this.updateSidebar();
    }
}

