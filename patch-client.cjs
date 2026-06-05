const fs = require('fs');
let c = fs.readFileSync('src/components/GymMusicPlayer.tsx', 'utf8');
const t1 = 'const fallback = { id: \'PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5\'';
const lines = c.split('\n');
const s1 = lines.findIndex(l => l.includes('const fallback = { id: \'PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5\'') || l.includes('PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5'));
if(s1 > -1) {
  const newLines = lines.slice(0, s1 - 2);
  newLines.push('            throw new Error(\"Explore API failed\");');
  newLines.push('          }');
  newLines.push('        } catch (err) {');
  newLines.push('          console.error(\"Explore fallback:\", err);');
  newLines.push('          const mkFb = (id, title, imgVid) => ({ id, title, artist: \"YouTube Mix\", duration: \"Playlist\", url: \`https://www.youtube.com/playlist?list=\`, thumbnail: \`https://i.ytimg.com/vi//mqdefault.jpg\`, isPlaylist: true, subType: \"playlist\" });');
  newLines.push('          setExploreData({');
  newLines.push('            trending: [mkFb(\"PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI\", \"Top Tendencias\", \"4Lz0_SPDoqo\")],');
  newLines.push('            dailyTop: [mkFb(\"PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf\", \"Lo Más Nuevo\", \"yebNIHKAC4A\")],');
  newLines.push('            top100: [mkFb(\"PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i\", \"Top 100 Popular\", \"mTQ_b9kQ6ko\")],');
  newLines.push('            workout: [mkFb(\"PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5\", \"Gym Motivation\", \"IZ36b3q1elI\")],');
  newLines.push('            focus: [mkFb(\"PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE\", \"Focus & Relax\", \"jGflUbPQfW8\")],');
  newLines.push('            trends: [mkFb(\"PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz\", \"Lanzamientos\", \"ru0K8uYEZWw\")],');
  newLines.push('            latin: [mkFb(\"PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r\", \"Ritmos Latinos\", \"C7vfCJTQ-rw\")],');
  newLines.push('            party: [mkFb(\"PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB\", \"Fiesta Mix\", \"n6N1_sxlBU8\")]');
  newLines.push('          });');
  newLines.push('        } finally {');
  newLines.push('          setIsLoadingExplore(false);');
  newLines.push('        }');
  const s2 = lines.findIndex(l => l.includes('setIsLoadingExplore(false);'));
  if(s2 > -1){
    const newC = newLines.join('\n') + '\n' + lines.slice(s2 + 2).join('\n');
    fs.writeFileSync('src/components/GymMusicPlayer.tsx', newC);
    console.log('Patched GymMusicPlayer.tsx');
  }
}