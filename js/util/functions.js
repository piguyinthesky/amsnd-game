export function constrain(n, small, big) { return Math.min(Math.max(n, small), big); }

export function numScenes(scene, actIndex) { return scene.cache.json.get("fullPlay").acts[actIndex].scenes.length; }