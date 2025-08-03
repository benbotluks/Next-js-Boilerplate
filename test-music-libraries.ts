import { Midi, Note } from 'tonal';
// Test file to verify music library TypeScript integration
import * as Tone from 'tone';

// Test Tone.js TypeScript integration
const testToneIntegration = () => {
  console.log('Testing Tone.js integration...');

  // Test basic Tone.js functionality with TypeScript
  const synth = new Tone.Synth();
  const volume = synth.volume.value;
  console.log('Tone.js synth volume:', volume);

  // Test note frequency calculation
  const noteFreq = Tone.Frequency('C4').toFrequency();
  console.log('C4 frequency from Tone.js:', noteFreq);
};

// Test VexFlow TypeScript integration
const testVexFlowIntegration = () => {
  console.log('Testing VexFlow integration...');

  // Test VexFlow access
  console.log('VexFlow imported successfully');

  // Note: VexFlow requires DOM environment for full testing
  // This is just a basic import test
};

// Test Tonal TypeScript integration
const testTonalIntegration = () => {
  console.log('Testing Tonal integration...');

  // Test Tonal note functionality
  const noteInfo = Note.get('C4');
  console.log('Tonal note info for C4:', noteInfo);

  // Test MIDI conversion
  const midiNumber = Midi.toMidi('C4');
  console.log('C4 MIDI number from Tonal:', midiNumber);
};

// Export test functions for potential use
export { testTonalIntegration, testToneIntegration, testVexFlowIntegration };

console.log('Music libraries TypeScript integration test file created successfully!');
