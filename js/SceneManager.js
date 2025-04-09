/**
 * SceneManager class to manage objects in the Three.js scene
 */
class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.objects = new Map(); // Map to store objects with unique IDs
    this.nextId = 1; // Counter for generating unique IDs
  }

  /**
   * Add an object to the scene and track it
   * @param {THREE.Object3D} object - The Three.js object to add
   * @param {string} name - Optional name for the object
   * @returns {string} - The unique ID assigned to the object
   */
  addObject(object, name = "") {
    const id = `obj_${this.nextId++}`;
    this.objects.set(id, {
      object,
      name: name || id,
      addedAt: new Date(),
    });
    this.scene.add(object);
    return id;
  }

  /**
   * Remove an object from the scene by its ID
   * @param {string} id - The ID of the object to remove
   * @returns {boolean} - Whether the object was successfully removed
   */
  removeObject(id) {
    if (this.objects.has(id)) {
      const { object } = this.objects.get(id);
      this.scene.remove(object);
      this.objects.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Get an object by its ID
   * @param {string} id - The ID of the object to retrieve
   * @returns {Object|null} - The object data or null if not found
   */
  getObject(id) {
    return this.objects.has(id) ? this.objects.get(id) : null;
  }

  /**
   * Rename an object by its ID
   * @param {string} id - The ID of the object to rename
   * @param {string} newName - The new name for the object
   * @returns {boolean} - Whether the object was successfully renamed
   */
  renameObject(id, newName) {
    if (this.objects.has(id) && newName.trim()) {
      const objectData = this.objects.get(id);
      objectData.name = newName.trim();
      return true;
    }
    return false;
  }

  /**
   * Get all objects in the scene
   * @returns {Array} - Array of all object data
   */
  getAllObjects() {
    return Array.from(this.objects.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }

  /**
   * Find objects by name (partial match)
   * @param {string} name - The name to search for
   * @returns {Array} - Array of matching object data
   */
  findObjectsByName(name) {
    const results = [];
    this.objects.forEach((data, id) => {
      if (data.name.includes(name)) {
        results.push({ id, ...data });
      }
    });
    return results;
  }

  /**
   * Clear all objects from the scene
   */
  clearScene() {
    this.objects.forEach((data) => {
      this.scene.remove(data.object);
    });
    this.objects.clear();
    this.nextId = 1;
  }
}

// Export the SceneManager class
export default SceneManager;
