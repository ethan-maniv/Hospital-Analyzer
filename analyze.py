import spacy
import scispacy
from scispacy.linking import EntityLinker

def extract_diseases(text):
    # Load the SciSpaCy model
    nlp = spacy.load("en_core_sci_sm")

    # Add the entity linker to the pipeline. The linker will try to link the entities to UMLS.
    # We disable this feature for now, but it can be enabled if UMLS IDs for diseases are needed.
    nlp.add_pipe("scispacy_linker", config={"resolve_abbreviations": True, "linker_name": "umls"})

    # Process the text
    doc = nlp(text)

    # Extract diseases
    diseases = set()
    for entity in doc.ents:
        # Check if the entity is a disease
        if "DISEASE" in entity.label_:
            diseases.add(entity.text)

    return diseases

# Example text
text = "The patient was diagnosed with diabetes two years ago and has been on insulin since then. \
Last year, they were also diagnosed with hypertension and asthma."

# Extract and print diseases
diseases = extract_diseases(text)
print(", ".join(diseases))
