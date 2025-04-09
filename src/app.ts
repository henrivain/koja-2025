import {
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    DoubleSide,
    EquirectangularReflectionMapping,
} from "three";


import { CSG } from 'three-csg-ts';

import Engine from "./engine";

function main() {
    const blueMaterial = new MeshPhongMaterial({ color: 0x3498db, side: DoubleSide });
    const greenMaterial = new MeshPhongMaterial({ color: 0x1db32e, side: DoubleSide });
    const redMaterial = new MeshPhongMaterial({ color: 0xb8333e, side: DoubleSide });




    const plane = new BoxGeometry(2000, 2000, 10);
    const floor = new Mesh(plane, redMaterial);
    floor.position.set(0, -110, 0)
    floor.rotateX(-Math.PI / 2);


    const geometry = new BoxGeometry(200, 200, 100);
    const cube = new Mesh(geometry, blueMaterial);
    cube.position.set(0, 0, 0)

    const geometry2 = new BoxGeometry(200, 200, 200);
    const cube2 = new Mesh(geometry2, greenMaterial);
    cube2.position.set(100, 100, 0)

    const geometry3 = new BoxGeometry(100, 100, 200);
    const cube3 = new Mesh(geometry3, redMaterial);
    cube2.position.set(200, 300, 0)

    const elem = document.getElementById("viewer") as HTMLElement;
    const engine = new Engine(elem, [floor, cube, cube2]);
    engine.run();
    engine.addElem(cube3)

    engine.addGui(cube3)

    document.querySelectorAll<HTMLButtonElement>("._setting-btn").forEach(btn => {
        btn.addEventListener("click", _ => {
            const selected = [cube, cube2, cube3][parseInt(btn.value)];
            engine.addGui(selected)
        })

    });
}








main();

