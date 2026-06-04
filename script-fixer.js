const fs = require('fs');
let code = fs.readFileSync('src/components/GymMusicPlayer.tsx', 'utf8');

const funcCode = `
  const handleLoadExplorePlaylist = async (item: any) => {
    setIsLoadingExplore(true);
    try {
      const res = await fetch(\`/api/youtube/playlist?id=\${item.id}\`);
      if (!res.ok) throw new Error("Failed to load playlist");
      const tracks = await res.json();
      if (tracks && tracks.length > 0) {
        setPreviewPlaylist({
          id: item.id,
          name: item.title,
          description: item.artist || "Lista oficial",
          tracks: tracks,
          thumbnail_url: item.thumbnail,
          ownerId: "youtube",
          ownerName: item.artist || "YouTube",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setShowLibrary(true);
      } else {
        showNotification("La playlist está vacía.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error cargando playlist.");
    } finally {
      setIsLoadingExplore(false);
    }
  };
`;

code = code.replace(
  /const handleToggleExpandPlaylist = async \(playlistId: string\) => \{/,
  funcCode + '\n  const handleToggleExpandPlaylist = async (playlistId: string) => {'
);


code = code.replace(/setSearchQuery\(pl\.title\);\s*setYoutubeResults\(\[pl\]\);\s*handleToggleExpandPlaylist\(pl\.id\);/g, 'handleLoadExplorePlaylist(pl);');
code = code.replace(/setSearchQuery\(song\.title\);\s*setYoutubeResults\(\[song\]\);\s*handleToggleExpandPlaylist\(song\.id\);/g, 'handleLoadExplorePlaylist(song);');

// Use this for ExploreView too
code = code.replace(
/loadPlaylistAndPlay=\{async \(item: any\) => \{[\s\S]*?finally \{\s*setIsLoadingExplore\(false\);\s*\}\s*\}\s*\}/g,
'loadPlaylistAndPlay={handleLoadExplorePlaylist}'
);


fs.writeFileSync('src/components/GymMusicPlayer.tsx', code);
