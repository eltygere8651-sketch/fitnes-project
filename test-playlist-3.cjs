const { Innertube } = require("youtubei.js");
(async () => {
    const yt = await Innertube.create();
    
    const p1 = await yt.getPlaylist('PLXl9q53Jut6mtBQLGn9fsm4Sf1yMtz3dp');
    console.log("PLXl length:", p1.items ? p1.items.length : 'no items');
    
    const p2 = await yt.getPlaylist('PLFcGX84jKOu49Uwyfy1G4WXAc1fT-piU_');
    console.log("PLFc length:", p2.items ? p2.items.length : 'no items');
})();
