import {
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    DoubleSide,
    MeshBasicMaterial,
    SphereGeometry,
    MeshStandardMaterial,
    Object3D,
    Group,

} from "three";

const GRAY = 0xbbbcbd

import Engine from "./engine";
import { Mover } from './Mover';
import { STLExporter, STLLoader } from "three/examples/jsm/Addons.js";

function main() {
    const blueMaterial = new MeshPhongMaterial({ color: 0x3498db, side: DoubleSide });
    const greenMaterial = new MeshPhongMaterial({ color: 0x1db32e, side: DoubleSide });
    // const lightBlue = new MeshPhongMaterial({ color: 0x3993ed, side: DoubleSide });





    const plane = new BoxGeometry(2000, 2000, 10);
    const floor = new Mesh(plane, new MeshPhongMaterial({ color: GRAY, side: DoubleSide }));
    floor.position.set(0, -110, 0)
    floor.rotateX(-Math.PI / 2);


    const geometry = new BoxGeometry(200, 200, 100);
    const cube = new Mesh(geometry, blueMaterial);
    cube.position.set(600, 0, 700)

    const geometry2 = new BoxGeometry(200, 200, 200);
    const cube2 = new Mesh(geometry2, greenMaterial);
    cube2.position.set(-500, 0, -800)

    // const geometry3 = new BoxGeometry(100, 100, 200);
    // const cube3 = new Mesh(geometry3, lightBlue);
    // cube2.position.set(200, 300, 0)

    const elem = document.getElementById("viewport") as HTMLElement;
    const engine = new Engine(elem, [floor, cube, cube2]);    //[floor, cube, cube2]
    engine.run();
    // engine.addElem(cube3)


    const loader = new STLLoader();
    loader.load("hyva_nimi.stl", (geometry) => {


        const lightBlue = new MeshStandardMaterial({ color: 0x87227d });//new MeshBasicMaterial({ color: 0x3993ed, side: DoubleSide });
        const mesh = new Mesh(geometry, lightBlue);
        engine.addElem(mesh)
        mesh.position.y = 0;
        mesh.position.x = 200;
        mesh.position.z = 200;
        mesh.receiveShadow = true;

        const scale = mesh.scale.x * 0.1
        mesh.scale.set(scale, scale, scale)
        mesh.rotateX(Math.PI / 2)
        mesh.rotateY(Math.PI)

        // const lightBlue = new MeshStandardMaterial({ color: 0x87227d });//new MeshBasicMaterial({ color: 0x3993ed, side: DoubleSide });
        // const mesh = new Mesh(geometry, lightBlue);
        // engine.addElem(mesh)
        // mesh.position.y = 300;
        // mesh.receiveShadow = true;
    })

    // loader.load("Unnamed.stl", (geometry) => {
    //     const lightBlue = new MeshBasicMaterial({ color: 0x3993ed, side: DoubleSide });
    //     const mesh = new Mesh(geometry, lightBlue);
    //     engine.addElem(mesh)
    //     mesh.position.y = 300;
    //     mesh.receiveShadow = true;
    // })


    const mover = new Mover(engine);
    document.getElementById("export-btn")?.addEventListener("click", _ => {
        const selected = mover.selected;
        if (selected) {
            exportSTL([selected!])
            return;
        }
    });

    document.getElementById("import-btn")?.addEventListener("click", _ => {
        importStl(engine);
    })

    document.getElementById("random-square-btn")?.addEventListener("click", _ => {
        engine.addElem(createRandomCube())

    });
    // document.getElementById("random-ball-btn")?.addEventListener("click", _ => {
    //     engine.addElem(createRandomSphere())
    // });
}

function exportSTL(objects: Object3D[]) {
    const exporter = new STLExporter();
    const group = new Group();
    objects.forEach(obj => group.add(obj.clone()));
    const stlString = exporter.parse(group);

    const blob = new Blob([stlString], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "export.stl";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importStl(engine: Engine) {
    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";
    input.accept = ".stl";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", e => {
        if (!input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        const loader = new STLLoader();
        loader.load(URL.createObjectURL(file), geometry => {
            const material = new MeshBasicMaterial({ color: Math.random() * 0xffffff });
            const mesh = new Mesh(geometry, material);
            engine.addElem(mesh);
            input.value = "";
        })
    })
    input.click();
}


function createRandomCube() {
    const blueMaterial = new MeshPhongMaterial({ color: 0x3498db, side: DoubleSide });
    const geometry = new BoxGeometry(200, 200, 100);
    const cube = new Mesh(geometry, blueMaterial);
    cube.position.set((Math.random() - 0.5) * 1000, 0, (Math.random() - 0.5) * 1000)

    // const geometry = new BoxGeometry();
    // const material = new MeshBasicMaterial({ color: Math.random() * 0xffffff });
    // const cube = new Mesh(geometry, material);
    // cube.position.set((Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100);
    return cube;
}

function createRandomSphere() {
    const greenMaterial = new MeshPhongMaterial({ color: 0x1db32e, side: DoubleSide });
    const geometry = new SphereGeometry(0.5, 32, 32);
    const sphere = new Mesh(geometry, greenMaterial);
    sphere.position.set((Math.random() - 0.5) * 1000, 0, (Math.random() - 0.5) * 1000);
    return sphere;
}







main();

