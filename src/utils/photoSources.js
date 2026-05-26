const coverModules = import.meta.glob("../assets/photos/cover/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default"
});

const galleryModules = import.meta.glob("../assets/photos/gallery/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default"
});

const fallbackCover =
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1800&q=80";

const fallbackGallery = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80"
];

function normalizeModules(modulesMap) {
  return Object.entries(modulesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, src]) => src);
}

const localCoverPhotos = normalizeModules(coverModules);
const localGalleryPhotos = normalizeModules(galleryModules);

export const coverPhoto = localCoverPhotos[0] ?? fallbackCover;
export const galleryPhotos = localGalleryPhotos.length ? localGalleryPhotos : fallbackGallery;
