export const CAT_CLASSIFICATION_PROMPT = `
Analyze this image carefully and determine if it contains a cat. Look for feline features, fur patterns, ears, whiskers, and typical cat behaviors or poses.

**Important**: Only classify as a cat if you're confident the image shows a cat. If the image shows:
- Other animals (dogs, birds, etc.)
- The cat is not real, e.g. a cat-like toy, a cat-like drawing, a cat-like sculpture, anime cat, etc.
- Objects that might look like cats
- Poor quality images where you can't clearly identify a cat
- Multiple animals where a cat is not the primary subject

Then set "isCat": false and provide a helpful explanation.

If it IS a cat, provide detailed information about:

1. **Title**: Create a fun, unique 1-4 word name for this cat based on its appearance, pose, expression, and environment. Examples: "Banana Philosopher", "Window Dreamer", "Curious Explorer", "Sunny Lounger"

2. **Breed**: Identify the most likely cat breed or mix (e.g., "Persian", "Siamese", "Maine Coon", "Siberian", "etc.")

3. **Color**: Describe the primary color (e.g., "Orange", "Black", "Gray", "White")

4. **Pattern**: Any specific markings (e.g., "Tabby", "Solid", "Calico", "Bicolor") - only if clearly visible

5. **Body Type**: The cat's build (e.g., "sleek", "muscular", "fluffy", "stocky", "longhaired")

6. **Eye Color**: Color of the eyes (e.g., "Green", "Blue", "Yellow") - ONLY if clearly visible in the image

7. **Pose**: The cat's position/pose (e.g., "standing", "sitting", "lying", "curled", "jumping", "alert")

8. **Photo Quality**: Image quality assessment (e.g., "excellent", "good", "fair", "poor")

9. **Welfare Check**: Assess for obvious welfare indicators (NOT medical diagnosis):
   - "appears_underweight" - if cat looks very thin
   - "visible_injury" - if there are obvious wounds/scars
   - "poor_coat_condition" - if fur looks extremely matted or unhealthy
   - "abnormal_posture" - if posture suggests discomfort
   - "appears_healthy" - if no obvious concerns

10. **Scene Description**: Brief description of the scene/environment (1-2 sentences)

11. **Detected Features**: List which features were clearly identifiable (e.g., ["face", "body", "eyes", "environment"])

**Guidelines:**
- For conditional features (eyeColor, pattern): Only include if clearly visible and confident (>70%)
- For welfare indicators: Only flag obvious concerns, never diagnose medical conditions
- For title: Make it fun and unique but relevant to what you see
- Keep all responses concise and factual
- If uncertain about any attribute, use "Unknown" or omit optional fields

Format your response as JSON with the following structure:
{
  "isCat": true/false,
  "title": "Fun Name",
  "breed": "string",
  "color": "string",
  "pattern": "string",
  "bodyType": "sleek" | "muscular" | "fluffy" | "stocky" | "longhaired",
  "eyeColor": "string",
  "pose": "standing" | "sitting" | "lying" | "curled" | "jumping" | "alert",
  "photoQuality": "excellent" | "good" | "poor",
  "welfareCheck": {
    "attentionNeeded": true/false,
    "indicators": ["appears_underweight", "visible_injury"],
    "recommendation": "monitor" | "consult_vet" | "appears_healthy"
  },
  "sceneDescription": "Brief scene description",
  "detectedFeatures": ["face", "body", "environment"]
}

For non-cat images, set "isCat": false and explain what you see in the "sceneDescription" field.
`.trim();

export type CatAnalysis = {
  isCat: boolean;
  title?: string;
  breed?: string;
  color?: string;
  pattern?: string;
  bodyType?: string;
  eyeColor?: string;
  pose?: string;
  photoQuality?: string;
  welfareCheck?: {
    attentionNeeded: boolean;
    indicators?: string[];
    recommendation?: string;
  };
  sceneDescription?: string;
  detectedFeatures?: string[];
  // Allow unknown fields from the model without failing parsing
  [key: string]: unknown;
};


