
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv
from transcribe import transcribe_with_assemblyai
load_dotenv()
# Check for both environment variables
def generate_summary_from_transcript(transcript: str) ->str:
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError("API key not found. Please set GEMINI_API_KEY or GOOGLE_API_KEY.")
    
    genai.configure(api_key=api_key)
    model_name = "gemini-2.5-pro"
    last_error = None
    
    try:
        print(f"Attempting to initialize model: {model_name}...")
        model = genai.GenerativeModel(
            model_name,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.7,
                "max_output_tokens": 1024,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            },
        )
        print(f"Successfully initialized model: {model_name}")
    except Exception as e:
        print(f"-> Failed to initialize {model_name}.")
        last_error = e
        model = None
    
    if not model:
        print("\nError: Could not initialize any of the candidate Gemini models.")
        if last_error:
            # Re-raise the last error to show the user what went wrong
            raise last_error
        else:
            raise RuntimeError("Failed to find a working Gemini model.")
    
    BASIC_PROMPT = (
        "Summarize the following meeting transcript into three clear sections. "
        "Return ONLY JSON with these fields. Do not include any extra text or markdown fences.\n"
        "1) summary: A concise paragraph highlighting the key points.\n"
        "2) key_decisions: An array of strings listing ALL important decisions, agreements, or conclusions reached during the meeting. If no explicit decisions were made, identify implied decisions or next steps agreed upon. Always include at least 2-3 key decisions.\n"
        "3) action_items: A list of tasks (array of objects) starting with strong verbs, detailing tasks to be done.\n"
    )
    
    JSON_INSTRUCTION = (
        "Output strictly valid JSON only, with keys exactly as specified. IMPORTANT: The key_decisions field must contain at least 2-3 items describing decisions, agreements, or conclusions from the meeting. Schema:\n"
        '{\n'
        '  "summary": "string",\n'
        '  "key_decisions": ["decision 1", "decision 2", "decision 3"],\n'
        '  "action_items": [\n'
        '    {"description": "string", "owner": "string|null", "due_date": "string|null"}\n'
        '  ]\n'
        '}'
    )
       
    full_prompt = f"{BASIC_PROMPT}\n\nJSON_INSTRUCTION:\n{JSON_INSTRUCTION}\n\nMeeting Transcript:\n{transcript}"
    
    print("\nGenerating summary...")
    try:
        response = model.generate_content(full_prompt)
        
        # Debug: Print full response details
        print(f"Response candidates: {len(response.candidates) if response.candidates else 0}")
        if response.candidates:
            candidate = response.candidates[0]
            print(f"Finish reason: {candidate.finish_reason}")
            if hasattr(candidate, 'safety_ratings'):
                print(f"Safety ratings: {candidate.safety_ratings}")
        
        # Check if response was blocked by safety filters BEFORE accessing .text
        if not response.candidates or not response.candidates[0].content.parts:
            finish_reason = response.candidates[0].finish_reason if response.candidates else "UNKNOWN"
            safety_ratings = response.candidates[0].safety_ratings if (response.candidates and hasattr(response.candidates[0], 'safety_ratings')) else []
            
            # Try a more lenient prompt if safety blocked
            print(f"\n⚠️ First attempt blocked by safety filters (finish_reason: {finish_reason}). Trying with sanitized prompt...")
            
            sanitized_prompt = (
                " Analyze this meeting transcript objectively and provide factual information only. "
                "Return ONLY valid JSON (no markdown, no extra text) with these exact keys:\n"
                '{\n'
                "1) summary: A concise paragraph highlighting the key points.\n"
                "2) key_decisions: An array of strings listing ALL important decisions, agreements, or conclusions reached during the meeting. If no explicit decisions were made, identify implied decisions or next steps agreed upon. Always include at least 2-3 key decisions.\n"
                "3) action_items: A list of tasks (array of objects) starting with strong verbs, detailing tasks to be done.\n"
                '  "summary": "Professional summary of meeting topics and outcomes",\n'
                '  "key_decisions": ["decision 1", "decision 2", "decision 3"],\n'
                '  "action_items": [{"description": "task description", "owner": null, "due_date": null}]\n'
                '}\n\n'
                f"Meeting Transcript:\n{transcript[:3000]}"  # Limit to first 3000 chars
            )
            
            response2 = model.generate_content(sanitized_prompt)
            # print (response2)
            # Check if second attempt was also blocked
            if not response2.candidates or not response2.candidates[0].content.parts:
                error_msg = f"❌ Content generation blocked twice. Finish reason: {finish_reason}"
                if safety_ratings:
                    error_msg += f"\nSafety ratings: {safety_ratings}"
                print(error_msg)
                # Return a structured error response instead of raising
                return '{"summary": "Unable to generate summary - content was flagged by safety filters", "key_decisions": ["Try with a different audio file"], "action_items": []}'
            
            print("✅ Second attempt succeeded!")
            print(f"Response text preview (first 300 chars): {response2.text[:300]}")
            return response2.text
        
        # First attempt succeeded - log and return
        print("✅ First attempt succeeded!")
        if response.text:
            print(f"Response text preview (first 300 chars): {response.text[:300]}")
        
        return response.text
        
    except AttributeError as e:
        # Handle the specific error when trying to access .text on a blocked response
        print(f"❌ AttributeError (likely blocked response): {e}")
        return '{"summary": "Error: Response was blocked by safety filters", "key_decisions": ["Try uploading a different audio file", "Check if the content contains sensitive information"], "action_items": []}'
    except ValueError:
        # Re-raise ValueError (already formatted)
        raise
    except Exception as e:
        print(f"❌ Error generating summary: {e}")
        raise
