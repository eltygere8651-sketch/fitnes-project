const fs = require('fs');
const contents = fs.readFileSync('src/components/GymMusicPlayer.tsx', 'utf8');
const newContents = contents.split('\n').filter(line => !line.includes('fallbackSilentAudioRef')).join('\n');
fs.writeFileSync('src/components/GymMusicPlayer.tsx', newContents);
