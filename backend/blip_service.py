from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from transformers import BlipProcessor, BlipForConditionalGeneration,MarianMTModel, MarianTokenizer
from PIL import Image
import io

app = FastAPI()

# Load BLIP model once
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
translation_model_name = "Helsinki-NLP/opus-mt-en-fr"
translator_tokenizer = MarianTokenizer.from_pretrained(translation_model_name)
translator_model = MarianMTModel.from_pretrained(translation_model_name)

# ---- Function to translate English to French ----
from transformers import T5ForConditionalGeneration, T5Tokenizer

def translate_to_french(text: str) -> str:
    if not text:
        return "No caption available"
    try:
        inputs = translator_tokenizer([text], return_tensors="pt", padding=True, truncation=True)
        translated = translator_model.generate(**inputs)
        return translator_tokenizer.decode(translated[0], skip_special_tokens=True)
    except Exception as e:
        print(f"Error during translation: {e}")
        return "Translation failed"

def translate_to_french_word(word: str) -> str:
    inputs = translator_tokenizer([word], return_tensors="pt", padding=True, truncation=True)
    translated = translator_model.generate(**inputs)
    return translator_tokenizer.decode(translated[0], skip_special_tokens=True)

def clean_caption(text):
    return text.replace("a ", "").strip()


@app.post("/caption-image/")
async def caption_image(file: UploadFile = File(...)):
    try:
        # Load image from upload
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')

        # Generate caption
        inputs = processor(images=image, return_tensors="pt")
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        caption_cleaned = clean_caption(caption)
        caption_fr = translate_to_french(caption)
        print(f"French translation: {caption_fr}")

        # Simple tag generation (split caption into words)
        tags_en = list(set(caption.lower().replace('.', '').replace(',', '').split()))
        tags_fr = list(set(caption_fr.lower().replace('.', '').replace(',', '').split()))
        print("🔥 Print is working", caption, caption_fr)
        return JSONResponse(content={
            "caption": caption,
            "caption_fr": caption_fr,
            "tags_en": ",".join(tags_en),
            "tags_fr": ",".join(tags_fr)
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
