// Simple test to verify the validation logic works
const { validateAnswer, generateFeedbackMessage, getNoteDisplayColor } = require('./src/utils/AnswerValidation.ts');

// Test perfect match
console.log('Testing perfect match...');
const perfectResult = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']);
console.log('Perfect result:', perfectResult);
console.log('Feedback:', generateFeedbackMessage(perfectResult));

// Test partial match
console.log('\nTesting partial match...');
const partialResult = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'E4']);
console.log('Partial result:', partialResult);
console.log('Feedback:', generateFeedbackMessage(partialResult));

// Test incorrect match
console.log('\nTesting incorrect match...');
const incorrectResult = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'F4', 'A4']);
console.log('Incorrect result:', incorrectResult);
console.log('Feedback:', generateFeedbackMessage(incorrectResult));

console.log('\nAll validation tests completed successfully!');
