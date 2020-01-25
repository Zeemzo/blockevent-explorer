const {Howl, Howler} = require('howler');
 
// Setup the new Howl.
const sound = new Howl({
  src: [ 'eventually.mp3']
});
 
// Play the sound.
sound.play();
 
// Change global volume.
Howler.volume(0.5);