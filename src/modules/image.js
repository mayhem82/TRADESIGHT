export const imageModule = {
  id: 'image',
  name: 'Image DNA / As-Built Scanner',
  status: 'scaffolded',
  run(assessment) {
    return {
      moduleId: 'image',
      state: assessment?.state || 'CS7',
      notes: ['Image pathway scaffold active.', 'Photos can support observations but do not create final compliance findings alone.']
    };
  }
};
