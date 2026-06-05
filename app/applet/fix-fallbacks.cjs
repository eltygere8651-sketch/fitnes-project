const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300", isPlaylist: true }; if (data.trending.length === 0) data.trending.push({ ...fallback, id: "PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", title: "Top Tendencias" }); if (data.dailyTop.length === 0) data.dailyTop.push({ ...fallback, id: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", title: "Lo Más Nuevo" }); if (data.top100.length === 0) data.top100.push({ ...fallback, id: "PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", title: "Top 100 Popular" }); if (data.workout.length === 0) data.workout.push({ ...fallback, id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Gym Motivation" }); if (data.focus.length === 0) data.focus.push({ ...fallback, id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Focus & Relax" }); if (data.trends.length === 0) data.trends.push({ ...fallback, id: "PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", title: "Novedades" }); if (data.latin.length === 0) data.latin.push({ ...fallback, id: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", title: "Ritmos Latinos" }); if (data.party.length === 0) data.party.push({ ...fallback, id: "PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", title: "Party Mix" }); exploreCache = { data, timestamp: Date.now() } as any;`;

const replacement1 = `
    const createFallback = (id, title, imgVid) => ({ id, title, artist: "YouTube Mix", duration: "Playlist", url: \`https://www.youtube.com/playlist?list=\${id}\`, thumbnail: \`https://i.ytimg.com/vi/\${imgVid}/mqdefault.jpg\`, isPlaylist: true, subType: "playlist" });
    
    if (data.trending.length === 0) data.trending.push(createFallback("PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", "Top Tendencias", "4Lz0_SPDoqo"));
    if (data.dailyTop.length === 0) data.dailyTop.push(createFallback("PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", "Lo Más Nuevo", "yebNIHKAC4A"));
    if (data.top100.length === 0) data.top100.push(createFallback("PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", "Top 100 Popular", "mTQ_b9kQ6ko"));
    if (data.workout.length === 0) data.workout.push(createFallback("PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", "Gym Motivation", "IZ36b3q1elI"));
    if (data.focus.length === 0) data.focus.push(createFallback("PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE", "Focus & Relax", "jGflUbPQfW8"));
    if (data.trends.length === 0) data.trends.push(createFallback("PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz", "Novedades", "ru0K8uYEZWw"));
    if (data.latin.length === 0) data.latin.push(createFallback("PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r", "Ritmos Latinos", "C7vfCJTQ-rw"));
    if (data.party.length === 0) data.party.push(createFallback("PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB", "Party Mix", "n6N1_sxlBU8"));
    
    exploreCache = { data, timestamp: Date.now() } as any;`;

serverCode = serverCode.replace(targetStr, replacement1);


const targetStr2 = `    const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://i.ytimg.com/vi/1zJcoPT-0VI/mqdefault.jpg", isPlaylist: true }; res.json({ trending: [fallback], dailyTop: [fallback], top100: [fallback], workout: [fallback], focus: [fallback], trends: [fallback], latin: [fallback], party: [fallback] });`;

const replacement2 = `    const createFb = (id, title, imgVid) => ({ id, title, artist: "YouTube Mix", duration: "Playlist", url: \`https://www.youtube.com/playlist?list=\${id}\`, thumbnail: \`https://i.ytimg.com/vi/\${imgVid}/mqdefault.jpg\`, isPlaylist: true, subType: "playlist" });
    const fallbackData = {
      trending: [createFb("PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", "Top Tendencias", "4Lz0_SPDoqo")],
      dailyTop: [createFb("PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", "Lo Más Nuevo", "yebNIHKAC4A")],
      top100: [createFb("PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", "Top 100 Popular", "mTQ_b9kQ6ko")],
      workout: [createFb("PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", "Gym Motivation", "IZ36b3q1elI")],
      focus: [createFb("PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE", "Focus & Relax", "jGflUbPQfW8")],
      trends: [createFb("PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz", "Novedades", "ru0K8uYEZWw")],
      latin: [createFb("PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r", "Ritmos Latinos", "C7vfCJTQ-rw")],
      party: [createFb("PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB", "Party Mix", "n6N1_sxlBU8")]
    };
    res.json(fallbackData);`;

serverCode = serverCode.replace(targetStr2, replacement2);

fs.writeFileSync('server.ts', serverCode);

console.log("Server.ts patched successfully!");

// Now patch GymMusicPlayer.tsx
let clientCode = fs.readFileSync('src/components/GymMusicPlayer.tsx', 'utf8');

const targetStrClient1 = `          if (!res.ok) {
            const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300", isPlaylist: true };
            const fallbackData = { trending: [{...fallback, title: 'Top Tendencias'}], dailyTop: [{...fallback, title: 'Lo Más Nuevo'}], top100: [{...fallback, title: 'Top 100 Popular'}], workout: [{...fallback, title: 'Gym Motivation'}], focus: [{...fallback, title: 'Focus & Relax'}], trends: [{...fallback, title: 'Últimos Lanzamientos'}], latin: [{...fallback, title: 'Música Latina'}], party: [{...fallback, title: 'Fiesta Mix'}] };
            setExploreData(fallbackData);
          }`;

const replacementClient1 = `          if (!res.ok) throw new Error("Fetch failed");`;

clientCode = clientCode.replace(targetStrClient1, replacementClient1);

const targetStrClient2 = `        } catch (error) {
          console.error("Failed to load explore data", error);
          const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300", isPlaylist: true };
          const fallbackData = { trending: [{...fallback, title: 'Top Tendencias'}], dailyTop: [{...fallback, title: 'Lo Más Nuevo'}], top100: [{...fallback, title: 'Top 100 Popular'}], workout: [{...fallback, title: 'Gym Motivation'}], focus: [{...fallback, title: 'Focus & Relax'}], trends: [{...fallback, title: 'Últimos Lanzamientos'}], latin: [{...fallback, title: 'Música Latina'}], party: [{...fallback, title: 'Fiesta Mix'}] };
          setExploreData(fallbackData);
        }`;

const replacementClient2 = `        } catch (error) {
          console.error("Failed to load explore data", error);
          const createFb = (id: string, title: string, imgVid: string) => ({ id, title, artist: "YouTube Mix", duration: "Playlist", url: \`https://www.youtube.com/playlist?list=\${id}\`, thumbnail: \`https://i.ytimg.com/vi/\${imgVid}/mqdefault.jpg\`, isPlaylist: true, subType: "playlist" });
          const fallbackData = {
            trending: [createFb("PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", "Top Tendencias", "4Lz0_SPDoqo")],
            dailyTop: [createFb("PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", "Lo Más Nuevo", "yebNIHKAC4A")],
            top100: [createFb("PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", "Top 100 Popular", "mTQ_b9kQ6ko")],
            workout: [createFb("PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", "Gym Motivation", "IZ36b3q1elI")],
            focus: [createFb("PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE", "Focus & Relax", "jGflUbPQfW8")],
            trends: [createFb("PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz", "Novedades", "ru0K8uYEZWw")],
            latin: [createFb("PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r", "Ritmos Latinos", "C7vfCJTQ-rw")],
            party: [createFb("PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB", "Party Mix", "n6N1_sxlBU8")]
          };
          setExploreData(fallbackData);
        }`;

clientCode = clientCode.replace(targetStrClient2, replacementClient2);

fs.writeFileSync('src/components/GymMusicPlayer.tsx', clientCode);
console.log("GymMusicPlayer.tsx patched successfully!");
