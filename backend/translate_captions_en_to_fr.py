import json
from transformers import MarianMTModel, MarianTokenizer

# ---- Step 1: Load English COCO-style captions ----
with open("captions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# ---- Step 2: Load MarianMT model for English to French ----
model_name = "Helsinki-NLP/opus-mt-en-fr"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)

# ---- Step 3: Define translation function ----
def translate_batch(texts, batch_size=8):
    translations = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        encoded = tokenizer(batch, return_tensors="pt", padding=True, truncation=True)
        translated = model.generate(**encoded)
        decoded = [tokenizer.decode(t, skip_special_tokens=True) for t in translated]
        translations.extend(decoded)
    return translations

# ---- Step 4: Extract English captions and translate ----
english_captions = [item["caption"] for item in data]
french_captions = translate_batch(english_captions)

# ---- Step 5: Add French captions to original data ----
for item, caption_fr in zip(data, french_captions):
    item["caption_fr"] = caption_fr

# ---- Step 6: Save to new JSON file ----
with open("captions_fr.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Translated captions saved to captions_fr.json")
